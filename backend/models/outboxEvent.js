import mongoose from 'mongoose';

const outboxEventSchema = new mongoose.Schema(
  {
    eventType: {
      type: String,
      required: true,
      trim: true,
    },
    aggregateType: {
      type: String,
      required: true,
      trim: true,
    },
    aggregateId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'processing', 'processed', 'failed'],
      default: 'pending',
    },
    retryCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    availableAt: {
      type: Date,
      default: Date.now,
    },
    lastError: {
      type: String,
      trim: true,
      default: null,
    },
    lastErrorAt: {
      type: Date,
      default: null,
    },
    processedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'outbox_events',
  }
);

// Indexes: status + availableAt; aggregateType + aggregateId; eventType + createdAt.
outboxEventSchema.index({ status: 1, availableAt: 1 });
outboxEventSchema.index({ aggregateType: 1, aggregateId: 1 });
outboxEventSchema.index({ eventType: 1, createdAt: -1 });

const OutboxEvent = mongoose.model('OutboxEvent', outboxEventSchema);

export default OutboxEvent;
