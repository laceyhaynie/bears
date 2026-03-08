/**
 * Global Error Handler Middleware
 *
 * This middleware catches all errors that occur in route handlers.
 * It must be registered LAST in the middleware stack (after all routes).
 *
 * How error handling works in Express:
 * 1. Route handler throws an error or calls next(error)
 * 2. Express skips all remaining regular middleware
 * 3. Express calls error-handling middleware (functions with 4 parameters)
 * 4. Error handler sends appropriate response to client
 */

import logger from '../utils/logger.js';

/**
 * Global error handling middleware
 *
 * @param {Error} err - The error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function (required by Express but not used)
 */
export function errorHandler(err, req, res, next) {
  // Log the error for debugging
  logger.error('Error occurred:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method
  });

  // Determine status code
  // If error has a statusCode property, use it; otherwise default to 500
  const statusCode = err.statusCode || err.status || 500;

  // Determine error message
  // In production, don't leak internal error details
  const message =
    process.env.NODE_ENV === 'development'
      ? err.message
      : statusCode === 500
      ? 'Internal server error'
      : err.message;

  // Send error response
  res.status(statusCode).json({
    error: {
      message: message,
      // Include stack trace only in development
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
      // Include validation errors if present (from Joi)
      ...(err.details && { details: err.details })
    }
  });
}

/**
 * 404 Not Found handler
 *
 * This catches requests to routes that don't exist.
 * Place this BEFORE the error handler but AFTER all route definitions.
 */
export function notFoundHandler(req, res) {
  logger.warn(`404 Not Found: ${req.method} ${req.path}`);

  res.status(404).json({
    error: {
      message: 'Route not found',
      path: req.path,
      method: req.method
    }
  });
}

export default { errorHandler, notFoundHandler };
