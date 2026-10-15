import mongoose from 'mongoose';

const nationalIdDetailSchema = new mongoose.Schema(
  {
    fanNumber: {
      type: String,
      trim: true,
      default: null,
    },
    finNumber: {
      type: String,
      trim: true,
      default: null,
    },
    image: {
      front: {
        type: String,
        trim: true,
        default: null,
      },
      back: {
        type: String,
        trim: true,
        default: null,
      },
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    nationalIdDetail: {
      type: nationalIdDetailSchema,
      default: null,
    },
    nationalIdVerifiedAt: {
      type: Date,
      default: null,
    },
    phoneCountryCode: {
      type: String,
      default: '+251',
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    normalizedPhone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    phoneVerifiedAt: {
      type: Date,
      default: null,
    },
    profileImageUrl: {
      type: String,
      trim: true,
      default: null,
    },
    roles: {
      type: [String],
      enum: ['sender', 'driver', 'vehicle_owner', 'staff'],
      default: ['sender'],
    },
    accountStatus: {
      type: String,
      enum: ['pending', 'active', 'suspended', 'deactivated'],
      default: 'pending',
    },
    suspensionReason: {
      type: String,
      trim: true,
      default: null,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'users',
  }
);

// Indexes
userSchema.index({ normalizedPhone: 1 }, { unique: true });
userSchema.index({ accountStatus: 1 });
userSchema.index({ roles: 1 });
userSchema.index({ createdAt: 1 });

const User = mongoose.model('User', userSchema);

export default User;
