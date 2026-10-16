import OutboxEvent from '../models/outboxEvent.js';

/**
 * Mongoose Schema Plugin for Automated Transactional Outbox Events
 *
 * Enables models to automatically queue and flush OutboxEvent records upon save,
 * adhering to the Transactional Outbox pattern specified in Collection 36.
 *
 * @param {import('mongoose').Schema} schema
 * @param {object} [options]
 * @param {string} [options.aggregateType] - Name of aggregate (defaults to modelName)
 * @param {Array<{ on: 'create'|'update'|'statusChange', path?: string, eventType?: string, eventTypePrefix?: string }>} [options.autoEvents]
 */
export function outboxPlugin(schema, options = {}) {
  const aggregateType = options.aggregateType;
  const autoEvents = options.autoEvents || [];

  // Instance method: manually queue an event to be saved atomically with the document
  schema.methods.queueOutboxEvent = function (eventType, payload = {}, eventOptions = {}) {
    if (!this._queuedOutboxEvents) {
      this._queuedOutboxEvents = [];
    }
    this._queuedOutboxEvents.push({
      eventType,
      payload,
      availableAt: eventOptions.availableAt || new Date(),
    });
  };

  // Pre-save: Evaluate autoEvents configuration
  schema.pre('save', function () {
    if (!this._queuedOutboxEvents) {
      this._queuedOutboxEvents = [];
    }

    for (const rule of autoEvents) {
      if (rule.on === 'create' && this.isNew) {
        this._queuedOutboxEvents.push({
          eventType: rule.eventType || `${(aggregateType || this.constructor.modelName).toUpperCase()}_CREATED`,
          payload: {
            id: this._id,
            ...this.toObject(),
          },
        });
      } else if (rule.on === 'statusChange' && rule.path && this.isModified(rule.path)) {
        const newStatus = this.get(rule.path);
        const prefix = rule.eventTypePrefix || `${(aggregateType || this.constructor.modelName).toUpperCase()}_STATUS_`;
        this._queuedOutboxEvents.push({
          eventType: `${prefix}${String(newStatus).toUpperCase()}`,
          payload: {
            id: this._id,
            previousStatus: this._previousValues?.[rule.path] || null,
            currentStatus: newStatus,
          },
        });
      }
    }
  });

  // Post-save: Atomically flush queued events to `outbox_events` collection
  schema.post('save', async function (doc) {
    if (!doc._queuedOutboxEvents || doc._queuedOutboxEvents.length === 0) {
      return;
    }

    const eventsToInsert = doc._queuedOutboxEvents.map((evt) => ({
      eventType: evt.eventType,
      aggregateType: aggregateType || doc.constructor?.modelName || 'Unknown',
      aggregateId: doc._id,
      payload: evt.payload || {},
      status: 'pending',
      retryCount: 0,
      availableAt: evt.availableAt || new Date(),
    }));

    // Clear in-memory queue to prevent duplicate inserts on consecutive saves
    doc._queuedOutboxEvents = [];

    try {
      const session = doc.$session ? doc.$session() : null;
      await OutboxEvent.insertMany(eventsToInsert, session ? { session } : {});
    } catch (outboxError) {
      console.error(
        `[OutboxPlugin Error] Failed to persist outbox events for ${doc._id}: ${outboxError.message}`
      );
    }
  });
}

export default outboxPlugin;
