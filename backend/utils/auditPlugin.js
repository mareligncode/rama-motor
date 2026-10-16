import AuditLog from '../models/auditLog.js';
import { getAuditContext } from '../middleware/auditContext.js';

/**
 * Mongoose Schema Plugin for Automated Hands-free Audit Logging
 *
 * Hooks into Mongoose lifecycle events to capture document creations,
 * updates, soft deletes, and diffs, merging with the HTTP request-scoped
 * context from AsyncLocalStorage.
 *
 * @param {import('mongoose').Schema} schema
 * @param {object} [options]
 * @param {string} [options.entityName] - Custom entity name override
 * @param {string[]} [options.ignorePaths] - Fields to ignore when diffing
 */
export function auditPlugin(schema, options = {}) {
  const entityName = options.entityName;
  const ignorePaths = new Set(options.ignorePaths || ['updatedAt', '__v']);

  // 1. Capture original snapshot when document is loaded from MongoDB
  schema.post('init', function () {
    this._originalValues = this.toObject({ depopulate: true });
  });

  // 2. Pre-save hook: Determine action and snapshot previous state
  schema.pre('save', function () {
    if (this.isNew) {
      this._auditAction = 'CREATE';
      this._previousValues = null;
    } else {
      // Detect soft deletes if model uses deletedAt
      if (this.isModified('deletedAt') && this.deletedAt) {
        this._auditAction = 'SOFT_DELETE';
      } else if (
        this.isModified('accountStatus') ||
        this.isModified('deliveryStatus') ||
        this.isModified('status')
      ) {
        this._auditAction = 'STATUS_CHANGE';
      } else {
        this._auditAction = 'UPDATE';
      }

      // Preserve previous values from post('init') snapshot
      this._previousValues = this._originalValues || null;
    }
  });

  // 3. Post-save hook: Automatically persist AuditLog record
  schema.post('save', async function (doc) {
    try {
      const context = getAuditContext();
      const resolvedEntityName = entityName || doc.constructor?.modelName || 'Unknown';

      // For self-registration or public operations, fallback userId to doc._id if it's a User
      const actorUserId =
        context.userId ||
        (resolvedEntityName === 'User' ? doc._id : null);

      const actorRole =
        context.actorRole ||
        (doc.roles && doc.roles.length > 0 ? doc.roles[0] : 'system');

      await AuditLog.create({
        userId: actorUserId,
        actorRole,
        action: doc._auditAction || 'UPDATE',
        entityName: resolvedEntityName,
        entityId: doc._id,
        previousValues: doc._previousValues,
        newValues: doc.toObject ? doc.toObject() : doc,
        ipAddress: context.ipAddress || null,
        userAgent: context.userAgent || null,
        requestId: context.requestId || null,
      });

      // Update snapshot for any subsequent saves on this in-memory instance
      doc._originalValues = doc.toObject ? doc.toObject({ depopulate: true }) : null;
    } catch (auditError) {
      // Never let audit logging failure fail the primary database transaction/response
      console.error(
        `[AuditPlugin Error] Failed to write audit log for ${entityName || 'document'} ${doc._id}: ${auditError.message}`
      );
    }
  });

  // 4. Hook for query updates: findOneAndUpdate
  schema.pre('findOneAndUpdate', async function () {
    try {
      this._originalQueryDoc = await this.model.findOne(this.getQuery()).lean();
    } catch {
      this._originalQueryDoc = null;
    }
  });

  schema.post('findOneAndUpdate', async function (doc) {
    if (!doc) return;
    try {
      const context = getAuditContext();
      const resolvedEntityName = entityName || this.model?.modelName || 'Unknown';

      await AuditLog.create({
        userId: context.userId || null,
        actorRole: context.actorRole || 'system',
        action: 'UPDATE',
        entityName: resolvedEntityName,
        entityId: doc._id,
        previousValues: this._originalQueryDoc || null,
        newValues: doc.toObject ? doc.toObject() : doc,
        ipAddress: context.ipAddress || null,
        userAgent: context.userAgent || null,
        requestId: context.requestId || null,
      });
    } catch (auditError) {
      console.error(
        `[AuditPlugin Error] Failed to write audit log for query update on ${doc._id}: ${auditError.message}`
      );
    }
  });
}

export default auditPlugin;
