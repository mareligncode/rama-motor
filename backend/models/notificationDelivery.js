import mongoose from 'mongoose';

const notificationDeliverySchema = new mongoose.Schema(
  {
    notificationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Notification',
      required: true,
      index: true,
    },
    recipientUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    channel: {
      type: String,
      required: true,
      enum: ['in_app', 'push', 'sms', 'email'],
    },
    provider: {
      type: String,
      required: true,
      enum: ['expo', 'fcm', 'sms_gateway', 'email_provider', 'internal'],
    },
    providerMessageId: {
      type: String,
      trim: true,
      default: null,
    },
    deliveryStatus: {
      type: String,
      enum: ['pending', 'processing', 'sent', 'delivered', 'failed', 'cancelled'],
      default: 'pending',
    },
    attemptCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxAttempts: {
      type: Number,
      default: 3,
      min: 1,
    },
    nextRetryAt: {
      type: Date,
      default: null,
    },
    sentAt: {
      type: Date,
      default: null,
    },
    deliveredAt: {
      type: Date,
      default: null,
    },
    failedAt: {
      type: Date,
      default: null,
    },
    lastError: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'notification_deliveries',
  }
);

// Indexes
// Unique delivery record per channel for a given notification
notificationDeliverySchema.index({ notificationId: 1, channel: 1 }, { unique: true });
// For background retry workers
notificationDeliverySchema.index({ deliveryStatus: 1, nextRetryAt: 1 });
// For user history queries
notificationDeliverySchema.index({ recipientUserId: 1, createdAt: 1 });
// Sparse index for looking up messages by provider external message ID
notificationDeliverySchema.index({ providerMessageId: 1 }, { sparse: true });

const NotificationDelivery = mongoose.model(
  'NotificationDelivery',
  notificationDeliverySchema
);

export default NotificationDelivery;
