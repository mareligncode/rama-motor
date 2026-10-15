import mongoose from 'mongoose';

const userDeviceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    deviceToken: {
      type: String,
      required: true,
      trim: true,
    },
    platform: {
      type: String,
      required: true,
      enum: ['android', 'ios', 'web'],
    },
    provider: {
      type: String,
      enum: ['fcm', 'expo'],
      default: 'fcm',
    },
    lastSeenAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: 'user_devices',
  }
);

// Indexes
userDeviceSchema.index({ deviceToken: 1 }, { unique: true });
userDeviceSchema.index({ userId: 1, platform: 1 });

const UserDevice = mongoose.model('UserDevice', userDeviceSchema);

export default UserDevice;
