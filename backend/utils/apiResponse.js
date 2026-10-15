/**
 * Standardized API Response Helpers
 */

export function successResponse(res, { statusCode = 200, message = 'Success', data = null, meta = null }) {
  const payload = {
    success: true,
    message,
  };
  if (data !== null && data !== undefined) {
    payload.data = data;
  }
  if (meta !== null && meta !== undefined) {
    payload.meta = meta;
  }
  return res.status(statusCode).json(payload);
}

export function errorResponse(res, { statusCode = 500, message = 'Internal Server Error', error = null, errors = null }) {
  const payload = {
    success: false,
    message,
  };
  if (error) {
    payload.error = typeof error === 'string' ? error : error.message || error;
  }
  if (errors) {
    payload.errors = errors;
  }
  return res.status(statusCode).json(payload);
}

export default {
  successResponse,
  errorResponse,
};
