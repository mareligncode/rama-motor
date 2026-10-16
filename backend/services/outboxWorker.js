import OutboxEvent from '../models/outboxEvent.js';
import { dispatchOutboxEvent } from './outboxDispatcher.js';
import { retryPendingDeliveries } from './notification.js';

let workerIntervalId = null;
let isProcessing = false;

const DEFAULT_OPTIONS = {
  pollIntervalMs: 2000,
  batchSize: 10,
  maxRetries: 5,
};

/**
 * Processes a single batch of pending outbox events and notification delivery retries
 * @param {object} options
 */
export async function processOutboxBatch(options = DEFAULT_OPTIONS) {
  if (isProcessing) return;
  isProcessing = true;

  try {
    const now = new Date();
    const batchSize = options.batchSize || DEFAULT_OPTIONS.batchSize;

    // 1. Process pending outbox events
    const pendingEvents = await OutboxEvent.find({
      status: 'pending',
      availableAt: { $lte: now },
    })
      .sort({ createdAt: 1 })
      .limit(batchSize)
      .lean();

    if (pendingEvents && pendingEvents.length > 0) {
      for (const evt of pendingEvents) {
        // Atomic compare-and-swap lock
        const lockedEvent = await OutboxEvent.findOneAndUpdate(
          {
            _id: evt._id,
            status: 'pending',
          },
          {
            $set: { status: 'processing' },
          },
          { new: true }
        );

        if (!lockedEvent) {
          // Another worker instance picked this event up concurrently
          continue;
        }

        try {
          // Dispatch to handlers
          await dispatchOutboxEvent(lockedEvent);

          // Mark as processed successfully
          lockedEvent.status = 'processed';
          lockedEvent.processedAt = new Date();
          lockedEvent.lastError = null;
          await lockedEvent.save();
        } catch (dispatchError) {
          const nextRetry = lockedEvent.retryCount + 1;
          const hasExceededRetries = nextRetry >= (options.maxRetries || DEFAULT_OPTIONS.maxRetries);

          lockedEvent.retryCount = nextRetry;
          lockedEvent.lastError = dispatchError.message || 'Dispatch error';
          lockedEvent.lastErrorAt = new Date();

          if (hasExceededRetries) {
            lockedEvent.status = 'failed';
            console.error(
              `[OutboxWorker] Event ${lockedEvent._id} (${lockedEvent.eventType}) failed after ${nextRetry} attempts.`
            );
          } else {
            // Exponential backoff retry: 2s, 4s, 8s, 16s... up to 5 min
            const backoffSeconds = Math.min(300, Math.pow(2, nextRetry) * 2);
            lockedEvent.status = 'pending';
            lockedEvent.availableAt = new Date(Date.now() + backoffSeconds * 1000);
            console.warn(
              `[OutboxWorker] Event ${lockedEvent._id} (${lockedEvent.eventType}) failed attempt ${nextRetry}. Retrying in ${backoffSeconds}s.`
            );
          }

          await lockedEvent.save();
        }
      }
    }

    // 2. Process automated NotificationDelivery retries matching Collection 38 index { deliveryStatus: 1, nextRetryAt: 1 }
    try {
      await retryPendingDeliveries(batchSize);
    } catch (deliveryRetryError) {
      console.error(
        `[OutboxWorker] NotificationDelivery retry error: ${deliveryRetryError.message}`
      );
    }
  } catch (error) {
    console.error(`[OutboxWorker Error] ${error.message}`);
  } finally {
    isProcessing = false;
  }
}

/**
 * Starts the automated background outbox worker
 * @param {object} [options]
 */
export function startOutboxWorker(options = {}) {
  if (workerIntervalId) {
    return;
  }

  const interval = options.pollIntervalMs || DEFAULT_OPTIONS.pollIntervalMs;
  console.log(`[OutboxWorker] Starting outbox background worker (poll interval: ${interval}ms)...`);

  // Run initial tick immediately
  processOutboxBatch(options).catch((err) =>
    console.error(`[OutboxWorker] Initial batch error: ${err.message}`)
  );

  // Poll on interval
  workerIntervalId = setInterval(() => {
    processOutboxBatch(options);
  }, interval);
}

/**
 * Stops the automated background outbox worker
 */
export function stopOutboxWorker() {
  if (workerIntervalId) {
    clearInterval(workerIntervalId);
    workerIntervalId = null;
    console.log('[OutboxWorker] Outbox background worker stopped.');
  }
}

export default {
  startOutboxWorker,
  stopOutboxWorker,
  processOutboxBatch,
};
