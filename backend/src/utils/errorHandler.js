/**
 * Error Handler Utility
 * Centralized error handling for the application
 */

/**
 * Custom Error Classes
 */

class AppError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();
    
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, errors = []) {
    super(message, 400);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'Access forbidden') {
    super(message, 403);
    this.name = 'AuthorizationError';
  }
}

class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404);
    this.name = 'NotFoundError';
  }
}

class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(message, 409);
    this.name = 'ConflictError';
  }
}

class DatabaseError extends AppError {
  constructor(message = 'Database operation failed') {
    super(message, 500);
    this.name = 'DatabaseError';
  }
}

class ExternalServiceError extends AppError {
  constructor(service = 'External service', message = 'Service unavailable') {
    super(`${service}: ${message}`, 503);
    this.name = 'ExternalServiceError';
    this.service = service;
  }
}

class RateLimitError extends AppError {
  constructor(retryAfter = 60) {
    super('Too many requests. Please try again later.', 429);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

class PaymentError extends AppError {
  constructor(message = 'Payment processing failed') {
    super(message, 402);
    this.name = 'PaymentError';
  }
}

/**
 * Error Handler Middleware
 * Central error handling for Express
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.stack = err.stack;

  // Log error
  logError(err, req);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Invalid resource ID';
    error = new ValidationError(message);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    error = new ConflictError(message);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message
    }));
    error = new ValidationError('Validation failed', errors);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new AuthenticationError('Invalid token');
  }

  if (err.name === 'TokenExpiredError') {
    error = new AuthenticationError('Token has expired');
  }

  // Multer errors (file upload)
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      error = new ValidationError('File size too large');
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      error = new ValidationError('Unexpected file field');
    } else {
      error = new ValidationError('File upload failed');
    }
  }

  // Send error response
  const statusCode = error.statusCode || 500;
  
  const response = {
    success: false,
    message: error.message || 'Internal server error',
    timestamp: new Date().toISOString()
  };

  // Add error details in development
  if (process.env.NODE_ENV === 'development') {
    response.error = {
      name: err.name,
      statusCode,
      stack: error.stack
    };
  }

  // Add validation errors if present
  if (error.errors) {
    response.errors = error.errors;
  }

  // Add retry-after header for rate limit errors
  if (error.retryAfter) {
    res.setHeader('Retry-After', error.retryAfter);
  }

  res.status(statusCode).json(response);
};

/**
 * Not Found Handler
 * Handle 404 errors for undefined routes
 */
const notFoundHandler = (req, res, next) => {
  const error = new NotFoundError(`Route ${req.originalUrl}`);
  next(error);
};

/**
 * Async Error Catcher
 * Wrapper for async route handlers to catch errors
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Log Error
 * Log errors with context information
 */
const logError = (err, req = null) => {
  const errorLog = {
    timestamp: new Date().toISOString(),
    name: err.name,
    message: err.message,
    statusCode: err.statusCode,
    stack: err.stack
  };

  if (req) {
    errorLog.request = {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip || req.connection.remoteAddress,
      userId: req.user ? req.user.id : 'anonymous'
    };

    // Add request body in development (excluding sensitive data)
    if (process.env.NODE_ENV === 'development') {
      const sanitizedBody = { ...req.body };
      delete sanitizedBody.password;
      delete sanitizedBody.confirmPassword;
      delete sanitizedBody.currentPassword;
      delete sanitizedBody.newPassword;
      errorLog.request.body = sanitizedBody;
    }
  }

  // Console log in development
  if (process.env.NODE_ENV === 'development') {
    console.error('=== ERROR ===');
    console.error(JSON.stringify(errorLog, null, 2));
    console.error('=============');
  } else {
    // In production, log to file or external service
    console.error(JSON.stringify(errorLog));
  }

  // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
  // if (process.env.NODE_ENV === 'production') {
  //   sendToErrorTracking(errorLog);
  // }
};

/**
 * Handle Unhandled Promise Rejections
 */
const handleUnhandledRejection = (server) => {
  process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION! Shutting down...');
    console.error(err.name, err.message);
    console.error(err.stack);

    // Close server gracefully
    server.close(() => {
      process.exit(1);
    });
  });
};

/**
 * Handle Uncaught Exceptions
 */
const handleUncaughtException = () => {
  process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION! Shutting down...');
    console.error(err.name, err.message);
    console.error(err.stack);
    
    process.exit(1);
  });
};

/**
 * Create Error Response Object
 */
const createErrorResponse = (message, statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message,
    statusCode,
    timestamp: new Date().toISOString()
  };

  if (errors) {
    response.errors = errors;
  }

  return response;
};

/**
 * Handle Database Connection Errors
 */
const handleDatabaseError = (err) => {
  console.error('Database connection error:');
  console.error(err);

  if (err.name === 'MongoNetworkError') {
    console.error('Cannot connect to MongoDB. Please check your connection string.');
  } else if (err.name === 'MongooseServerSelectionError') {
    console.error('MongoDB server selection failed. Is MongoDB running?');
  }

  // TODO: Implement reconnection logic or alert system
};

/**
 * Validate Error Object
 * Check if error is operational or programming error
 */
const isOperationalError = (error) => {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
};

/**
 * Format Mongoose Validation Errors
 */
const formatMongooseErrors = (err) => {
  const errors = {};
  
  Object.keys(err.errors).forEach((key) => {
    errors[key] = err.errors[key].message;
  });

  return errors;
};

/**
 * Error Response for API
 */
const sendErrorResponse = (res, error) => {
  const statusCode = error.statusCode || 500;
  
  const response = {
    success: false,
    message: error.message || 'Internal server error',
    timestamp: new Date().toISOString()
  };

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development' && error.stack) {
    response.stack = error.stack;
  }

  // Include validation errors if present
  if (error.errors) {
    response.errors = error.errors;
  }

  res.status(statusCode).json(response);
};

/**
 * Graceful Shutdown Handler
 */
const gracefulShutdown = (server, signal) => {
  console.log(`${signal} received. Starting graceful shutdown...`);

  server.close(() => {
    console.log('HTTP server closed');

    // Close database connections
    // mongoose.connection.close(false, () => {
    //   console.log('MongoDB connection closed');
    //   process.exit(0);
    // });

    process.exit(0);
  });

  // Force shutdown after 30 seconds
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
};

/**
 * Setup Process Handlers
 */
const setupProcessHandlers = (server) => {
  // Unhandled promise rejections
  handleUnhandledRejection(server);

  // Uncaught exceptions
  handleUncaughtException();

  // Graceful shutdown signals
  process.on('SIGTERM', () => gracefulShutdown(server, 'SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown(server, 'SIGINT'));
};

/**
 * Error Type Checker
 */
const errorTypes = {
  isValidationError: (err) => err instanceof ValidationError || err.name === 'ValidationError',
  isAuthError: (err) => err instanceof AuthenticationError || err.name === 'AuthenticationError',
  isNotFoundError: (err) => err instanceof NotFoundError || err.statusCode === 404,
  isDatabaseError: (err) => err instanceof DatabaseError || err.name === 'MongoError',
  isNetworkError: (err) => err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT'
};

module.exports = {
  // Error classes
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  DatabaseError,
  ExternalServiceError,
  RateLimitError,
  PaymentError,

  // Middleware
  errorHandler,
  notFoundHandler,
  catchAsync,

  // Utilities
  logError,
  createErrorResponse,
  handleDatabaseError,
  isOperationalError,
  formatMongooseErrors,
  sendErrorResponse,

  // Process handlers
  setupProcessHandlers,
  handleUnhandledRejection,
  handleUncaughtException,
  gracefulShutdown,

  // Type checkers
  errorTypes
};