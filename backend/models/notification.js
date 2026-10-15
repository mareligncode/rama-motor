import mongoose from 'mongoose';

const notificationDataSchema = new mongoose.Schema(
  {
    deliveryOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DeliveryOrder',
      default: null,
    },
    deliveryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Delivery',
      default: null,
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      default: null,
    },
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      default: null,
    },
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
      default: null,
    },
    incidentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Incident',
      default: null,
    },
    screen: {
      type: String,
      trim: true,
      default: null,
    },
  },
  { _id: false }
);

const notificationSchema = new mongoose.Schema(
  {
    recipientUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    recipientRole: {
      type: String,
      required: true,
      enum: ['sender', 'recipient', 'driver', 'vehicle_owner', 'staff', 'admin'],
    },
    senderUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    notificationType: {
      type: String,
      required: true,
      enum: ['auth', 'payment', 'warning', 'delivery', 'other'],
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    data: {
      type: notificationDataSchema,
      default: () => ({}),
    },
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal',
    },
    channels: {
      type: [String],
      enum: ['in_app', 'push', 'sms', 'email'],
      default: ['in_app'],
    },
    deliveryStatus: {
      type: String,
      enum: ['pending', 'processing', 'sent', 'partially_sent', 'failed', 'cancelled'],
      default: 'pending',
    },
    readAt: {
      type: Date,
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'notifications',
  }
);

// Indexes
notificationSchema.index({ recipientUserId: 1, createdAt: -1 });
notificationSchema.index({ recipientUserId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ deliveryStatus: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { sparse: true });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
