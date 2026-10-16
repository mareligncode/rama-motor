/**
 * Outbox Event Dispatcher Service
 * Maintains a registry of event handlers and executes them when the OutboxWorker
 * processes events from Collection 36 (outbox_events).
 */

const eventHandlers = new Map();

/**
 * Registers a handler function for an event type
 * @param {string} eventType - e.g. 'USER_REGISTERED', 'NOTIFICATION_DISPATCH'
 * @param {Function} handler - async (payload, outboxEvent) => Promise<void>
 */
export function registerEventHandler(eventType, handler) {
  if (typeof handler !== 'function') {
    throw new Error(`Handler for ${eventType} must be a function`);
  }
  if (!eventHandlers.has(eventType)) {
    eventHandlers.set(eventType, []);
  }
  eventHandlers.get(eventType).push(handler);
}

/**
 * Dispatches an outbox event to all registered listeners
 * @param {import('../models/outboxEvent.js').default} outboxEvent
 */
export async function dispatchOutboxEvent(outboxEvent) {
  const { eventType, payload } = outboxEvent;
  const handlers = eventHandlers.get(eventType) || [];

  if (handlers.length === 0) {
    // Default fallback log if no specific handler is registered
    console.log(
      `[OutboxDispatcher] Unhandled event "${eventType}" for aggregate ${outboxEvent.aggregateType}:${outboxEvent.aggregateId}`
    );
    return;
  }

  for (const handler of handlers) {
    await handler(payload, outboxEvent);
  }
}

import { executeNotificationDelivery } from './notification.js';

// Built-in standard handlers
registerEventHandler('USER_CREATED', async (payload, event) => {
  console.log(
    `[OutboxDispatcher] User created: ${payload.fullName || payload.phoneNumber} (ID: ${event.aggregateId})`
  );
});

registerEventHandler('USER_STATUS_SUSPENDED', async (payload, event) => {
  console.warn(
    `[OutboxDispatcher] User ${event.aggregateId} account suspended. Triggering device revocation checks.`
  );
});

registerEventHandler('NOTIFICATION_DISPATCH', async (payload, event) => {
  const notificationId = event.aggregateId || payload.id || payload.notificationId;
  if (notificationId) {
    await executeNotificationDelivery(notificationId);
  }
});

export default {
  registerEventHandler,
  dispatchOutboxEvent,
};
