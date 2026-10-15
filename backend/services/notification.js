import Notification from '../models/notification.js';
import NotificationDelivery from '../models/notificationDelivery.js';
import UserDevice from '../models/userDevice.js';
import User from '../models/user.js';
import { sendPushNotification } from './push.js';
import { sendSms } from './sms.js';
import { sendEmail } from './email.js';

/**
 * Creates and dispatches a notification across specified channels
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
 * @returns {Promise<{ notification: any, deliveries: any[] }>}
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
  // 1. Create base notification document
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
    deliveryStatus: 'processing',
    expiresAt,
  });

  const deliveries = [];
  const channelResults = [];

  // Fetch recipient user details for SMS and Email
  const user = await User.findById(recipientUserId);

  // 2. Dispatch for each channel
  for (const channel of channels) {
    let deliveryRecord = await NotificationDelivery.create({
      notificationId: notification._id,
      recipientUserId,
      channel,
      provider: getChannelDefaultProvider(channel),
      deliveryStatus: 'processing',
      attemptCount: 1,
    });

    try {
      if (channel === 'in_app') {
        deliveryRecord.deliveryStatus = 'delivered';
        deliveryRecord.sentAt = new Date();
        deliveryRecord.deliveredAt = new Date();
        await deliveryRecord.save();
        channelResults.push({ channel, success: true });
      } else if (channel === 'push') {
        // Fetch user devices
        const devices = await UserDevice.find({ userId: recipientUserId });
        const tokens = devices.map((d) => d.deviceToken).filter(Boolean);

        if (tokens.length > 0) {
          const pushResult = await sendPushNotification({
            to: tokens.length === 1 ? tokens[0] : tokens,
            title,
            body: message,
            data: { ...data, notificationId: notification._id.toString() },
          });

          if (pushResult.success) {
            deliveryRecord.deliveryStatus = 'sent';
            deliveryRecord.sentAt = new Date();
            deliveryRecord.providerMessageId =
              pushResult.data?.data?.[0]?.id || `push_${Date.now()}`;
            channelResults.push({ channel, success: true });
          } else {
            deliveryRecord.deliveryStatus = 'failed';
            deliveryRecord.failedAt = new Date();
            deliveryRecord.lastError = pushResult.error;
            channelResults.push({ channel, success: false });
          }
        } else {
          deliveryRecord.deliveryStatus = 'failed';
          deliveryRecord.failedAt = new Date();
          deliveryRecord.lastError = 'No registered device tokens found for recipient';
          channelResults.push({ channel, success: false });
        }
        await deliveryRecord.save();
      } else if (channel === 'sms') {
        const phone = user?.phoneNumber || user?.normalizedPhone;
        if (phone) {
          const smsResult = await sendSms({
            phoneNumber: phone,
            text: `${title}: ${message}`,
          });

          if (smsResult.success) {
            deliveryRecord.deliveryStatus = 'sent';
            deliveryRecord.sentAt = new Date();
            deliveryRecord.providerMessageId =
              smsResult.data?.messageId || `sms_${Date.now()}`;
            channelResults.push({ channel, success: true });
          } else {
            deliveryRecord.deliveryStatus = 'failed';
            deliveryRecord.failedAt = new Date();
            deliveryRecord.lastError = smsResult.error;
            channelResults.push({ channel, success: false });
          }
        } else {
          deliveryRecord.deliveryStatus = 'failed';
          deliveryRecord.failedAt = new Date();
          deliveryRecord.lastError = 'Recipient does not have a phone number';
          channelResults.push({ channel, success: false });
        }
        await deliveryRecord.save();
      } else if (channel === 'email') {
        // In the future or if user has email property
        const emailAddress = user?.email;
        if (emailAddress) {
          const emailResult = await sendEmail({
            to: emailAddress,
            subject: title,
            text: message,
          });

          if (emailResult.success) {
            deliveryRecord.deliveryStatus = 'sent';
            deliveryRecord.sentAt = new Date();
            deliveryRecord.providerMessageId = emailResult.messageId;
            channelResults.push({ channel, success: true });
          } else {
            deliveryRecord.deliveryStatus = 'failed';
            deliveryRecord.failedAt = new Date();
            deliveryRecord.lastError = emailResult.error;
            channelResults.push({ channel, success: false });
          }
        } else {
          deliveryRecord.deliveryStatus = 'failed';
          deliveryRecord.failedAt = new Date();
          deliveryRecord.lastError = 'Recipient has no registered email address';
          channelResults.push({ channel, success: false });
        }
        await deliveryRecord.save();
      }
    } catch (channelErr) {
      deliveryRecord.deliveryStatus = 'failed';
      deliveryRecord.failedAt = new Date();
      deliveryRecord.lastError = channelErr.message;
      await deliveryRecord.save();
      channelResults.push({ channel, success: false });
    }

    deliveries.push(deliveryRecord);
  }

  // 3. Update overall notification delivery status
  const successCount = channelResults.filter((r) => r.success).length;
  if (successCount === channels.length) {
    notification.deliveryStatus = 'sent';
  } else if (successCount > 0) {
    notification.deliveryStatus = 'partially_sent';
  } else {
    notification.deliveryStatus = 'failed';
  }
  await notification.save();

  return {
    notification,
    deliveries,
  };
}

function getChannelDefaultProvider(channel) {
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
};
