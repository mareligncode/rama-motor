import { errorResponse } from '../utils/apiResponse.js';

/**
 * 404 Route Not Found Middleware
 */
export function notFound(req, res, next) {
  return errorResponse(res, {
    statusCode: 404,
    message: `Not Found - ${req.originalUrl}`,
  });
}

/**
 * Centralized Express Error Handling Middleware
 */
export function errorHandler(err, req, res, next) {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';
  let errors = null;

  // Handle Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Resource not found with id of ${err.value}`;
  }

  // Handle Mongoose Duplicate Key Error (E11000)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `Duplicate value entered for ${field}. Please use another value.`;
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    errors = Object.values(err.errors).map((val) => val.message);
  }

  return errorResponse(res, {
    statusCode,
    message,
    error: process.env.NODE_ENV === 'production' ? undefined : err.stack,
    errors,
  });
}

export default {
  notFound,
  errorHandler,
};
