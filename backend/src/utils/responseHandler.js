/**
 * Response Handler Utility
 * Standardizes API response formats across the application
 */

/**
 * Success response
 * @param {object} res - Express response object
 * @param {string} message - Success message
 * @param {any} data - Response data
 * @param {number} statusCode - HTTP status code
 */
const successResponse = (res, message = 'Success', data = null, statusCode = 200) => {
  const response = {
    success: true,
    message,
    timestamp: new Date().toISOString()
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

/**
 * Created response (201)
 * @param {object} res - Express response object
 * @param {string} message - Success message
 * @param {any} data - Created resource data
 */
const createdResponse = (res, message = 'Resource created successfully', data = null) => {
  return successResponse(res, message, data, 201);
};

/**
 * Error response
 * @param {object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {any} errors - Detailed error information
 */
const errorResponse = (res, message = 'An error occurred', statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message,
    timestamp: new Date().toISOString()
  };

  if (errors !== null) {
    response.errors = errors;
  }

  // Log error in production
  if (process.env.NODE_ENV === 'production' && statusCode >= 500) {
    console.error(`[ERROR] ${statusCode} - ${message}`, errors);
  }

  return res.status(statusCode).json(response);
};

/**
 * Bad request response (400)
 * @param {object} res - Express response object
 * @param {string} message - Error message
 * @param {any} errors - Validation errors
 */
const badRequestResponse = (res, message = 'Bad request', errors = null) => {
  return errorResponse(res, message, 400, errors);
};

/**
 * Unauthorized response (401)
 * @param {object} res - Express response object
 * @param {string} message - Error message
 */
const unauthorizedResponse = (res, message = 'Unauthorized access') => {
  return errorResponse(res, message, 401);
};

/**
 * Forbidden response (403)
 * @param {object} res - Express response object
 * @param {string} message - Error message
 */
const forbiddenResponse = (res, message = 'Access forbidden') => {
  return errorResponse(res, message, 403);
};

/**
 * Not found response (404)
 * @param {object} res - Express response object
 * @param {string} message - Error message
 */
const notFoundResponse = (res, message = 'Resource not found') => {
  return errorResponse(res, message, 404);
};

/**
 * Conflict response (409)
 * @param {object} res - Express response object
 * @param {string} message - Error message
 */
const conflictResponse = (res, message = 'Resource conflict') => {
  return errorResponse(res, message, 409);
};

/**
 * Validation error response (422)
 * @param {object} res - Express response object
 * @param {array} errors - Array of validation errors
 */
const validationErrorResponse = (res, errors = []) => {
  return errorResponse(res, 'Validation failed', 422, errors);
};

/**
 * Internal server error response (500)
 * @param {object} res - Express response object
 * @param {string} message - Error message
 */
const serverErrorResponse = (res, message = 'Internal server error') => {
  return errorResponse(res, message, 500);
};

/**
 * Paginated response
 * @param {object} res - Express response object
 * @param {array} data - Array of items
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @param {number} total - Total number of items
 * @param {string} message - Success message
 */
const paginatedResponse = (res, data, page, limit, total, message = 'Success') => {
  const totalPages = Math.ceil(total / limit);
  
  const response = {
    success: true,
    message,
    data,
    pagination: {
      currentPage: parseInt(page),
      totalPages,
      totalItems: total,
      itemsPerPage: parseInt(limit),
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
      nextPage: page < totalPages ? parseInt(page) + 1 : null,
      previousPage: page > 1 ? parseInt(page) - 1 : null
    },
    timestamp: new Date().toISOString()
  };

  return res.status(200).json(response);
};

/**
 * File download response
 * @param {object} res - Express response object
 * @param {Buffer|Stream} fileData - File data or stream
 * @param {string} filename - File name
 * @param {string} mimeType - MIME type of file
 */
const fileDownloadResponse = (res, fileData, filename, mimeType = 'application/octet-stream') => {
  res.setHeader('Content-Type', mimeType);
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  
  if (Buffer.isBuffer(fileData)) {
    return res.send(fileData);
  } else {
    return fileData.pipe(res);
  }
};

/**
 * No content response (204)
 * @param {object} res - Express response object
 */
const noContentResponse = (res) => {
  return res.status(204).send();
};

/**
 * Redirect response (302)
 * @param {object} res - Express response object
 * @param {string} url - URL to redirect to
 */
const redirectResponse = (res, url) => {
  return res.redirect(302, url);
};

/**
 * Custom response with flexible structure
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {object} responseData - Custom response data
 */
const customResponse = (res, statusCode, responseData) => {
  return res.status(statusCode).json({
    ...responseData,
    timestamp: new Date().toISOString()
  });
};

/**
 * Rate limit exceeded response (429)
 * @param {object} res - Express response object
 * @param {number} retryAfter - Seconds until retry is allowed
 */
const rateLimitResponse = (res, retryAfter = 60) => {
  res.setHeader('Retry-After', retryAfter);
  return errorResponse(
    res, 
    'Too many requests. Please try again later.', 
    429, 
    { retryAfter }
  );
};

/**
 * Service unavailable response (503)
 * @param {object} res - Express response object
 * @param {string} message - Error message
 */
const serviceUnavailableResponse = (res, message = 'Service temporarily unavailable') => {
  return errorResponse(res, message, 503);
};

/**
 * Accepted response (202)
 * @param {object} res - Express response object
 * @param {string} message - Message about accepted request
 * @param {any} data - Optional data
 */
const acceptedResponse = (res, message = 'Request accepted for processing', data = null) => {
  return successResponse(res, message, data, 202);
};

/**
 * Partial content response (206)
 * @param {object} res - Express response object
 * @param {any} data - Partial data
 * @param {number} start - Start index
 * @param {number} end - End index
 * @param {number} total - Total items
 */
const partialContentResponse = (res, data, start, end, total) => {
  res.setHeader('Content-Range', `items ${start}-${end}/${total}`);
  
  return res.status(206).json({
    success: true,
    data,
    range: {
      start,
      end,
      total
    },
    timestamp: new Date().toISOString()
  });
};

/**
 * Bulk operation response
 * @param {object} res - Express response object
 * @param {number} successful - Number of successful operations
 * @param {number} failed - Number of failed operations
 * @param {array} errors - Array of error details
 */
const bulkOperationResponse = (res, successful, failed, errors = []) => {
  const statusCode = failed === 0 ? 200 : 207; // Multi-status if some failed
  
  return res.status(statusCode).json({
    success: failed === 0,
    message: `Bulk operation completed: ${successful} successful, ${failed} failed`,
    summary: {
      successful,
      failed,
      total: successful + failed
    },
    errors: errors.length > 0 ? errors : undefined,
    timestamp: new Date().toISOString()
  });
};

/**
 * Async handler wrapper to avoid try-catch in routes
 * @param {function} fn - Async function to wrap
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Create consistent API response structure
 * @param {boolean} success - Success status
 * @param {string} message - Response message
 * @param {any} data - Response data
 * @param {any} errors - Error details
 * @param {object} meta - Additional metadata
 */
const createResponse = (success, message, data = null, errors = null, meta = {}) => {
  const response = {
    success,
    message,
    timestamp: new Date().toISOString(),
    ...meta
  };

  if (data !== null) {
    response.data = data;
  }

  if (errors !== null) {
    response.errors = errors;
  }

  return response;
};

/**
 * Send JSON response with proper headers
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {object} data - Response data
 */
const sendJSON = (res, statusCode, data) => {
  res.setHeader('Content-Type', 'application/json');
  return res.status(statusCode).json(data);
};

/**
 * Health check response
 * @param {object} res - Express response object
 * @param {object} checks - Health check results
 */
const healthCheckResponse = (res, checks = {}) => {
  const allHealthy = Object.values(checks).every(check => check.status === 'healthy');
  
  return res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    checks,
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
};

/**
 * API version response
 * @param {object} res - Express response object
 * @param {string} version - API version
 */
const apiVersionResponse = (res, version) => {
  return res.status(200).json({
    version,
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  // Success responses
  successResponse,
  createdResponse,
  acceptedResponse,
  noContentResponse,

  // Error responses
  errorResponse,
  badRequestResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  conflictResponse,
  validationErrorResponse,
  serverErrorResponse,
  rateLimitResponse,
  serviceUnavailableResponse,

  // Special responses
  paginatedResponse,
  fileDownloadResponse,
  redirectResponse,
  customResponse,
  partialContentResponse,
  bulkOperationResponse,
  healthCheckResponse,
  apiVersionResponse,

  // Utilities
  asyncHandler,
  createResponse,
  sendJSON
};