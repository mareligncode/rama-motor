import mongoose from 'mongoose';

const SENSITIVE_KEYS = new Set([
  'password',
  'code',
  'token',
  'codeHash',
  'secret',
  'jwt',
  'apiKey',
  'authorization',
  'privateKey',
  'fanNumber',
  'finNumber',
]);

/**
 * Recursively strips sensitive keys from objects before storing in audit logs
 * to guarantee compliance with database schema security rules.
 */
export function sanitizeAuditData(data) {
  if (!data || typeof data !== 'object') {
    return data;
  }
  if (Array.isArray(data)) {
    return data.map(sanitizeAuditData);
  }
  const clean = {};
  for (const [key, value] of Object.entries(data)) {
    if (SENSITIVE_KEYS.has(key)) {
      clean[key] = '[REDACTED]';
    } else if (value && typeof value === 'object') {
      clean[key] = sanitizeAuditData(value);
    } else {
      clean[key] = value;
    }
  }
  return clean;
}

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    actorRole: {
      type: String,
      required: true,
      trim: true,
    },
    action: {
      type: String,
      required: true,
      trim: true,
    },
    entityName: {
      type: String,
      required: true,
      trim: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    previousValues: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    newValues: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    ipAddress: {
      type: String,
      trim: true,
      default: null,
    },
    userAgent: {
      type: String,
      trim: true,
      default: null,
    },
    requestId: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'audit_logs',
  }
);

// Indexes: entityName + entityId + createdAt; userId + createdAt; action + createdAt.
auditLogSchema.index({ entityName: 1, entityId: 1, createdAt: -1 });
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });

// Protect audit records from ordinary edits and sanitize sensitive values
auditLogSchema.pre('save', function () {
  if (!this.isNew) {
    throw new Error('Audit logs are immutable and cannot be updated');
  }
  if (this.previousValues) {
    this.previousValues = sanitizeAuditData(this.previousValues);
  }
  if (this.newValues) {
    this.newValues = sanitizeAuditData(this.newValues);
  }
});

auditLogSchema.pre(
  ['updateOne', 'updateMany', 'findOneAndUpdate', 'findByIdAndUpdate'],
  function () {
    throw new Error('Audit logs are immutable and cannot be updated');
  }
);

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
