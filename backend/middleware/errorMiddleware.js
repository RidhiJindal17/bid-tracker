/**
 * Custom Error class for operational exceptions
 */
export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Centrally managed Global Error Handler Middleware
 */
export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log severe system errors in console
  if (err.statusCode === 500) {
    console.error('[CENTRAL ERROR LOG] Critical system exception occurred:', err);
  } else {
    console.warn(`[API WARNING] Client error (${err.statusCode}):`, err.message);
  }

  // Mongoose validation errors (e.g. required field missing)
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    err = new AppError(message, 400);
  }

  // Mongoose duplicate key errors (e.g. email already exists)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    const message = `Duplicate field value: "${value}". Please use another value for field "${field}".`;
    err = new AppError(message, 400);
  }

  // Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    const message = `Invalid Resource ID format for ${err.path}: ${err.value}`;
    err = new AppError(message, 400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    err = new AppError('Invalid auth token signature. Please log in again.', 401);
  }
  if (err.name === 'TokenExpiredError') {
    err = new AppError('Your authentication session has expired. Please log in again.', 401);
  }

  const isDev = process.env.NODE_ENV === 'development';

  res.status(err.statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(isDev && { stack: err.stack }),
  });
};
