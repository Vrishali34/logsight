/**
 * Global Express error handling middleware.
 * 
 * Must be registered LAST in app.js — Express identifies error
 * handlers by their 4-parameter signature (err, req, res, next).
 * 
 * Trade-off: We hide stack traces in production to avoid leaking
 * implementation details to attackers, but log them internally.
 */

const logger = require('../utils/logger');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || err.status || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  // Always log the full error server-side
  logger.error('Unhandled error', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  res.status(statusCode).json({
    success: false,
    error: {
      message: err.message || 'Internal Server Error',
      // Never expose stack traces in production
      ...(isProduction ? {} : { stack: err.stack }),
    },
  });
}

module.exports = errorHandler;