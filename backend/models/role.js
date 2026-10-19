import mongoose from 'mongoose';
import { auditPlugin } from '../utils/auditPlugin.js';
import { outboxPlugin } from '../utils/outboxPlugin.js';

/**
 * Collection 3: `roles`
 * Role definitions and permission sets for staff and administrative access control.
 */
const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    permissions: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: true,
    collection: 'roles',
  }
);

// Indexes
roleSchema.index({ name: 1 }, { unique: true });
roleSchema.index({ status: 1 });
roleSchema.index({ createdAt: 1 });

// Automated hands-free AuditLog and OutboxEvent plugins
roleSchema.plugin(auditPlugin, { entityName: 'Role' });
roleSchema.plugin(outboxPlugin, {
  aggregateType: 'Role',
  autoEvents: [
    { on: 'create', eventType: 'ROLE_CREATED' },
    { on: 'statusChange', path: 'status', eventTypePrefix: 'ROLE_STATUS_' },
  ],
});

const Role = mongoose.model('Role', roleSchema);

export default Role;
