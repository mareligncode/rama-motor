import Notification from '../models/notification.js';
import NotificationDelivery from '../models/notificationDelivery.js';
import UserDevice from '../models/userDevice.js';
import User from '../models/user.js';
import { sendPushNotification } from './push.js';
import { sendSms } from './sms.js';
import { sendEmail } from './email.js';

/**
 * Creates a notification. The attached Mongoose outboxPlugin will automatically
 * queue a NOTIFICATION_DISPATCH event, allowing the background worker to handle
 * deliveries and retries hands-free without blocking the HTTP request.
 *
 * @param {object} params
 * @param {string} params.recipientUserId - Target user ID
 * @param {string} params.recipientRole - Target role ('sender', 'driver', etc.)
 * @param {string} [params.senderUserId] - Sender user ID if applicable
 * @param {string} params.notificationType - 'auth', 'payment', 'warning', 'delivery', 'other'
 * @param {string} params.title - Title
 * @param {string} params.message - Body text
 * @param {object} [params.data] - Context metadata (deliveryId, screen, etc.)
 * @param {string} [params.priority='normal'] - 'low', 'normal', 'high', 'urgent'
 * @param {string[]} [params.channels=['in_app']] - ['in_app', 'push', 'sms', 'email']
 * @param {Date} [params.expiresAt] - Optional expiry date
 * @returns {Promise<{ notification: any }>}
 */
export async function createAndSendNotification({
  recipientUserId,
  recipientRole,
  senderUserId = null,
  notificationType,
  title,
  message,
  data = {},
  priority = 'normal',
  channels = ['in_app'],
  expiresAt = null,
}) {
  const notification = await Notification.create({
    recipientUserId,
    recipientRole,
    senderUserId,
    notificationType,
    title,
    message,
    data,
    priority,
    channels,
    deliveryStatus: 'pending',
    expiresAt,
  });

  return {
    notification,
  };
}

/**
 * Hands-free background executor called by the Outbox Worker for NOTIFICATION_DISPATCH
 * @param {string|import('mongoose').Types.ObjectId} notificationId
 */
export async function executeNotificationDelivery(notificationId) {
  const notification = await Notification.findById(notificationId);
  if (!notification) return;

  const user = await User.findById(notification.recipientUserId);
  const channels = notification.channels || ['in_app'];

  for (const channel of channels) {
    // Find or initialize delivery record matching Collection 38
    let deliveryRecord = await NotificationDelivery.findOne({
      notificationId: notification._id,
      channel,
    });

    if (!deliveryRecord) {
      deliveryRecord = await NotificationDelivery.create({
        notificationId: notification._id,
        recipientUserId: notification.recipientUserId,
        channel,
        provider: getChannelDefaultProvider(channel),
        deliveryStatus: 'pending',
        attemptCount: 0,
        maxAttempts: 3,
      });
    }

    if (deliveryRecord.deliveryStatus !== 'delivered') {
      await processSingleDelivery(deliveryRecord, notification, user);
    }
  }

  await updateParentNotificationStatus(notification._id);
}

/**
 * Attempts delivery for a single channel, updating attemptCount, status, and nextRetryAt
 */
export async function processSingleDelivery(deliveryRecord, notification, userDoc = null) {
  const user = userDoc || (await User.findById(deliveryRecord.recipientUserId));
  const channel = deliveryRecord.channel;

  deliveryRecord.attemptCount += 1;
  deliveryRecord.deliveryStatus = 'processing';
  await deliveryRecord.save();

  try {
    if (channel === 'in_app') {
      deliveryRecord.deliveryStatus = 'delivered';
      deliveryRecord.sentAt = new Date();
      deliveryRecord.deliveredAt = new Date();
      deliveryRecord.nextRetryAt = null;
      deliveryRecord.lastError = null;
    } else if (channel === 'push') {
      const devices = await UserDevice.find({ userId: deliveryRecord.recipientUserId });
      const tokens = devices.map((d) => d.deviceToken).filter(Boolean);

      if (tokens.length > 0) {
        const pushResult = await sendPushNotification({
          to: tokens.length === 1 ? tokens[0] : tokens,
          title: notification.title,
          body: notification.message,
          data: { ...notification.data, notificationId: notification._id.toString() },
        });

        if (pushResult.success) {
          deliveryRecord.deliveryStatus = 'delivered';
          deliveryRecord.sentAt = new Date();
          deliveryRecord.deliveredAt = new Date();
          deliveryRecord.providerMessageId =
            pushResult.data?.data?.[0]?.id || `push_${Date.now()}`;
          deliveryRecord.nextRetryAt = null;
          deliveryRecord.lastError = null;
        } else {
          throw new Error(pushResult.error || 'Push notification delivery failed');
        }
      } else {
        throw new Error('No registered device push tokens found for recipient');
      }
    } else if (channel === 'sms') {
      const phone = user?.phoneNumber || user?.normalizedPhone;
      if (!phone) {
        throw new Error('Recipient does not have a registered phone number for SMS delivery');
      }

      const smsResult = await sendSms({
        phoneNumber: phone,
        text: `${notification.title}: ${notification.message}`,
      });

      if (smsResult.success) {
        deliveryRecord.deliveryStatus = 'delivered';
        deliveryRecord.sentAt = new Date();
        deliveryRecord.deliveredAt = new Date();
        deliveryRecord.providerMessageId = smsResult.data?.messageId || `sms_${Date.now()}`;
        deliveryRecord.nextRetryAt = null;
        deliveryRecord.lastError = null;
      } else {
        throw new Error(smsResult.error || 'SMS gateway rejected delivery');
      }
    } else if (channel === 'email') {
      const emailAddress = user?.email;
      if (!emailAddress) {
        throw new Error('Recipient has no registered email address');
      }

      const emailResult = await sendEmail({
        to: emailAddress,
        subject: notification.title,
        text: notification.message,
      });

      if (emailResult.success) {
        deliveryRecord.deliveryStatus = 'delivered';
        deliveryRecord.sentAt = new Date();
        deliveryRecord.deliveredAt = new Date();
        deliveryRecord.providerMessageId = emailResult.messageId;
        deliveryRecord.nextRetryAt = null;
        deliveryRecord.lastError = null;
      } else {
        throw new Error(emailResult.error || 'Email service rejected delivery');
      }
    }
  } catch (deliveryError) {
    deliveryRecord.lastError = deliveryError.message;
    deliveryRecord.failedAt = new Date();

    if (deliveryRecord.attemptCount >= deliveryRecord.maxAttempts) {
      deliveryRecord.deliveryStatus = 'failed';
      deliveryRecord.nextRetryAt = null;
      console.error(
        `[NotificationDelivery] Channel ${channel} permanently failed for notification ${deliveryRecord.notificationId} after ${deliveryRecord.attemptCount} attempts.`
      );
    } else {
      // Exponential backoff: 15s, 30s, 60s
      const backoffSeconds = Math.pow(2, deliveryRecord.attemptCount) * 15;
      deliveryRecord.deliveryStatus = 'pending';
      deliveryRecord.nextRetryAt = new Date(Date.now() + backoffSeconds * 1000);
      console.warn(
        `[NotificationDelivery] Channel ${channel} failed (attempt ${deliveryRecord.attemptCount}/${deliveryRecord.maxAttempts}). Retrying in ${backoffSeconds}s.`
      );
    }
  }

  await deliveryRecord.save();
}

/**
 * Hands-free background retry worker for pending deliveries matching Collection 38 index:
 * { deliveryStatus: 1, nextRetryAt: 1 }
 */
export async function retryPendingDeliveries(batchSize = 10) {
  const now = new Date();

  // Find deliveries eligible for background retry
  const pendingDeliveries = await NotificationDelivery.find({
    deliveryStatus: 'pending',
    nextRetryAt: { $lte: now },
    attemptCount: { $lt: 3 },
  })
    .sort({ nextRetryAt: 1 })
    .limit(batchSize);

  for (const delivery of pendingDeliveries) {
    const notification = await Notification.findById(delivery.notificationId);
    if (!notification) continue;

    await processSingleDelivery(delivery, notification);
    await updateParentNotificationStatus(notification._id);
  }
}

/**
 * Recalculates parent notification status based on its channel deliveries
 */
async function updateParentNotificationStatus(notificationId) {
  const deliveries = await NotificationDelivery.find({ notificationId });
  if (deliveries.length === 0) return;

  const deliveredCount = deliveries.filter((d) => d.deliveryStatus === 'delivered').length;
  const failedCount = deliveries.filter((d) => d.deliveryStatus === 'failed').length;

  let newStatus = 'processing';
  if (deliveredCount === deliveries.length) {
    newStatus = 'sent';
  } else if (deliveredCount > 0) {
    newStatus = 'partially_sent';
  } else if (failedCount === deliveries.length) {
    newStatus = 'failed';
  }

  await Notification.findByIdAndUpdate(notificationId, { deliveryStatus: newStatus });
}

export function getChannelDefaultProvider(channel) {
  switch (channel) {
    case 'push':
      return 'expo';
    case 'sms':
      return 'sms_gateway';
    case 'email':
      return 'email_provider';
    default:
      return 'internal';
  }
}

export default {
  createAndSendNotification,
  executeNotificationDelivery,
  processSingleDelivery,
  retryPendingDeliveries,
  getChannelDefaultProvider,
};
