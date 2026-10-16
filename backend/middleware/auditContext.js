import { AsyncLocalStorage } from 'async_hooks';

/**
 * AsyncLocalStorage instance for request-scoped audit logging context.
 * Enables Mongoose lifecycle hooks to automatically read actor/HTTP request metadata
 * without manually passing `req` across controllers, services, and models.
 */
export const auditContextStorage = new AsyncLocalStorage();

/**
 * Express Middleware to initialize the audit context for each incoming HTTP request.
 */
export function auditContextMiddleware(req, res, next) {
  const store = {
    // Dynamic getters ensure user and role are evaluated at query/save time,
    // even if `req.user` is populated later by auth middleware or controllers.
    get userId() {
      return req.user?._id || req.auditUserId || null;
    },
    get actorRole() {
      return (
        req.user?.roles?.[0] ||
        req.auditActorRole ||
        (req.user ? 'sender' : 'system')
      );
    },
    ipAddress:
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.socket?.remoteAddress ||
      req.ip ||
      null,
    userAgent: req.headers['user-agent'] || null,
    requestId:
      req.headers['x-request-id'] ||
      `req_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
  };

  auditContextStorage.run(store, () => {
    next();
  });
}

/**
 * Helper to retrieve active audit context anywhere in the execution stack
 * @returns {object}
 */
export function getAuditContext() {
  return auditContextStorage.getStore() || {};
}

/**
 * Helper to imperatively attach user or role to current request's audit context
 * @param {object} overrides
 * @param {string} [overrides.userId]
 * @param {string} [overrides.actorRole]
 */
export function setAuditContext(overrides = {}) {
  const store = auditContextStorage.getStore();
  if (store) {
    if (overrides.userId) store.auditUserId = overrides.userId;
    if (overrides.actorRole) store.auditActorRole = overrides.actorRole;
  }
}

export default {
  auditContextStorage,
  auditContextMiddleware,
  getAuditContext,
  setAuditContext,
};
