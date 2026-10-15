import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    deliveryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Delivery',
      default: null,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    purpose: {
      type: String,
      required: true,
      enum: [
        'login',
        'phone_verification',
        'password_reset',
        'delivery_pickup',
        'delivery_dropoff',
      ],
    },
    codeHash: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
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
    status: {
      type: String,
      enum: ['pending', 'verified', 'expired', 'locked', 'consumed'],
      default: 'pending',
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    consumedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
    collection: 'otps',
  }
);

// Indexes
// TTL index for automatic expiration cleanup by MongoDB
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
otpSchema.index({ phoneNumber: 1, purpose: 1, status: 1 });
otpSchema.index({ deliveryId: 1, purpose: 1 }, { sparse: true });

const Otp = mongoose.model('Otp', otpSchema);

export default Otp;
