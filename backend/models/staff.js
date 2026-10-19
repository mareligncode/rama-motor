import mongoose from 'mongoose';
import { auditPlugin } from '../utils/auditPlugin.js';
import { outboxPlugin } from '../utils/outboxPlugin.js';

/**
 * Collection 4: `staffs`
 * Staff profile linking users to specific roles, codes, and operational departments.
 */
const staffSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role',
      required: true,
    },
    staffCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    department: {
      type: String,
      required: true,
      enum: [
        'operations',
        'finance',
        'accounting',
        'audit',
        'legal',
        'customer_support',
        'security',
        'management',
      ],
      default: 'operations',
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    status: {
      type: String,
      enum: ['active', 'suspended', 'inactive'],
      default: 'active',
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'staffs',
  }
);

// Indexes
staffSchema.index({ roleId: 1, status: 1 });
staffSchema.index({ department: 1 });
staffSchema.index({ status: 1 });
staffSchema.index({ createdAt: 1 });

// Automated hands-free AuditLog and OutboxEvent plugins
staffSchema.plugin(auditPlugin, { entityName: 'Staff' });
staffSchema.plugin(outboxPlugin, {
  aggregateType: 'Staff',
  autoEvents: [
    { on: 'create', eventType: 'STAFF_CREATED' },
    { on: 'statusChange', path: 'status', eventTypePrefix: 'STAFF_STATUS_' },
  ],
});

const Staff = mongoose.model('Staff', staffSchema);

export default Staff;
