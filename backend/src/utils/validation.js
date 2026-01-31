/**
 * Validation Utilities
 * Common validation functions used across the application
 */

/**
 * Validate email format
 * @param {string} email - Email address to validate
 * @returns {boolean} - True if valid email
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate GSTIN format
 * @param {string} gstin - GSTIN to validate
 * @returns {boolean} - True if valid GSTIN
 */
const isValidGSTIN = (gstin) => {
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstinRegex.test(gstin);
};

/**
 * Validate phone number (Indian format)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid phone number
 */
const isValidPhone = (phone) => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/\s+/g, ''));
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} - Validation result with details
 */
const validatePassword = (password) => {
  const result = {
    valid: true,
    errors: []
  };

  if (password.length < 6) {
    result.valid = false;
    result.errors.push('Password must be at least 6 characters long');
  }

  if (!/[a-z]/.test(password)) {
    result.valid = false;
    result.errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[A-Z]/.test(password)) {
    result.valid = false;
    result.errors.push('Password must contain at least one uppercase letter');
  }

  if (!/\d/.test(password)) {
    result.valid = false;
    result.errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    result.errors.push('Password should contain at least one special character (recommended)');
  }

  return result;
};

/**
 * Validate MongoDB ObjectId
 * @param {string} id - ID to validate
 * @returns {boolean} - True if valid ObjectId
 */
const isValidObjectId = (id) => {
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  return objectIdRegex.test(id);
};

/**
 * Validate date range
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date
 * @returns {object} - Validation result
 */
const validateDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const result = {
    valid: true,
    errors: []
  };

  if (isNaN(start.getTime())) {
    result.valid = false;
    result.errors.push('Invalid start date');
  }

  if (isNaN(end.getTime())) {
    result.valid = false;
    result.errors.push('Invalid end date');
  }

  if (result.valid && start >= end) {
    result.valid = false;
    result.errors.push('End date must be after start date');
  }

  return result;
};

/**
 * Validate rental period
 * @param {Date|string} startDate - Rental start date
 * @param {Date|string} endDate - Rental end date
 * @returns {object} - Validation result with duration
 */
const validateRentalPeriod = (startDate, endDate) => {
  const dateValidation = validateDateRange(startDate, endDate);
  
  if (!dateValidation.valid) {
    return dateValidation;
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();

  const result = {
    valid: true,
    errors: [],
    durationHours: 0,
    durationDays: 0
  };

  // Check if start date is in the past
  if (start < now) {
    result.valid = false;
    result.errors.push('Rental start date cannot be in the past');
  }

  // Calculate duration
  const durationMs = end - start;
  result.durationHours = Math.ceil(durationMs / (1000 * 60 * 60));
  result.durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));

  // Minimum rental period (1 hour)
  if (result.durationHours < 1) {
    result.valid = false;
    result.errors.push('Rental period must be at least 1 hour');
  }

  // Maximum rental period (365 days)
  if (result.durationDays > 365) {
    result.valid = false;
    result.errors.push('Rental period cannot exceed 365 days');
  }

  return result;
};

/**
 * Validate price value
 * @param {number} price - Price to validate
 * @param {number} min - Minimum allowed price
 * @param {number} max - Maximum allowed price
 * @returns {object} - Validation result
 */
const validatePrice = (price, min = 0, max = 10000000) => {
  const result = {
    valid: true,
    errors: []
  };

  if (typeof price !== 'number' || isNaN(price)) {
    result.valid = false;
    result.errors.push('Price must be a valid number');
    return result;
  }

  if (price < min) {
    result.valid = false;
    result.errors.push(`Price must be at least ₹${min}`);
  }

  if (price > max) {
    result.valid = false;
    result.errors.push(`Price cannot exceed ₹${max}`);
  }

  // Check for more than 2 decimal places
  if ((price * 100) % 1 !== 0) {
    result.valid = false;
    result.errors.push('Price can have at most 2 decimal places');
  }

  return result;
};

/**
 * Validate quantity
 * @param {number} quantity - Quantity to validate
 * @param {number} min - Minimum quantity
 * @param {number} max - Maximum quantity
 * @returns {object} - Validation result
 */
const validateQuantity = (quantity, min = 1, max = 10000) => {
  const result = {
    valid: true,
    errors: []
  };

  if (!Number.isInteger(quantity)) {
    result.valid = false;
    result.errors.push('Quantity must be a whole number');
    return result;
  }

  if (quantity < min) {
    result.valid = false;
    result.errors.push(`Quantity must be at least ${min}`);
  }

  if (quantity > max) {
    result.valid = false;
    result.errors.push(`Quantity cannot exceed ${max}`);
  }

  return result;
};

/**
 * Validate SKU format
 * @param {string} sku - SKU to validate
 * @returns {object} - Validation result
 */
const validateSKU = (sku) => {
  const result = {
    valid: true,
    errors: []
  };

  if (!sku || typeof sku !== 'string') {
    result.valid = false;
    result.errors.push('SKU is required');
    return result;
  }

  // SKU should be alphanumeric with hyphens/underscores
  const skuRegex = /^[A-Za-z0-9-_]+$/;
  if (!skuRegex.test(sku)) {
    result.valid = false;
    result.errors.push('SKU can only contain letters, numbers, hyphens, and underscores');
  }

  if (sku.length < 2 || sku.length > 50) {
    result.valid = false;
    result.errors.push('SKU must be between 2 and 50 characters');
  }

  return result;
};

/**
 * Validate rental pricing structure
 * @param {object} rentalPricing - Rental pricing object
 * @returns {object} - Validation result
 */
const validateRentalPricing = (rentalPricing) => {
  const result = {
    valid: true,
    errors: []
  };

  if (!rentalPricing || typeof rentalPricing !== 'object') {
    result.valid = false;
    result.errors.push('Rental pricing is required');
    return result;
  }

  const { hourly, daily, weekly } = rentalPricing;

  // At least one pricing option must be provided
  if (!hourly && !daily && !weekly) {
    result.valid = false;
    result.errors.push('At least one rental pricing option (hourly, daily, or weekly) must be provided');
  }

  // Validate each pricing option if provided
  if (hourly !== undefined) {
    const hourlyValidation = validatePrice(hourly);
    if (!hourlyValidation.valid) {
      result.valid = false;
      result.errors.push('Invalid hourly pricing: ' + hourlyValidation.errors.join(', '));
    }
  }

  if (daily !== undefined) {
    const dailyValidation = validatePrice(daily);
    if (!dailyValidation.valid) {
      result.valid = false;
      result.errors.push('Invalid daily pricing: ' + dailyValidation.errors.join(', '));
    }
  }

  if (weekly !== undefined) {
    const weeklyValidation = validatePrice(weekly);
    if (!weeklyValidation.valid) {
      result.valid = false;
      result.errors.push('Invalid weekly pricing: ' + weeklyValidation.errors.join(', '));
    }
  }

  // Logical pricing validation (weekly should be less than 7 * daily, etc.)
  if (daily && weekly && weekly > daily * 7) {
    result.errors.push('Warning: Weekly price is higher than 7 days of daily rental');
  }

  if (hourly && daily && daily > hourly * 24) {
    result.errors.push('Warning: Daily price is higher than 24 hours of hourly rental');
  }

  return result;
};

/**
 * Validate address
 * @param {string} address - Address to validate
 * @returns {object} - Validation result
 */
const validateAddress = (address) => {
  const result = {
    valid: true,
    errors: []
  };

  if (!address || typeof address !== 'string') {
    result.valid = false;
    result.errors.push('Address is required');
    return result;
  }

  const trimmedAddress = address.trim();

  if (trimmedAddress.length < 10) {
    result.valid = false;
    result.errors.push('Address must be at least 10 characters long');
  }

  if (trimmedAddress.length > 500) {
    result.valid = false;
    result.errors.push('Address cannot exceed 500 characters');
  }

  return result;
};

/**
 * Validate payment amount against invoice
 * @param {number} amount - Payment amount
 * @param {number} balanceDue - Invoice balance due
 * @returns {object} - Validation result
 */
const validatePaymentAmount = (amount, balanceDue) => {
  const result = {
    valid: true,
    errors: []
  };

  const amountValidation = validatePrice(amount, 0.01);
  if (!amountValidation.valid) {
    return amountValidation;
  }

  if (amount > balanceDue) {
    result.valid = false;
    result.errors.push(`Payment amount (₹${amount}) cannot exceed balance due (₹${balanceDue})`);
  }

  return result;
};

/**
 * Validate invoice number format
 * @param {string} invoiceNumber - Invoice number
 * @returns {boolean} - True if valid format
 */
const isValidInvoiceNumber = (invoiceNumber) => {
  // Format: INV-YYYYMM-0001
  const invoiceRegex = /^INV-\d{6}-\d{4}$/;
  return invoiceRegex.test(invoiceNumber);
};

/**
 * Validate order number format
 * @param {string} orderNumber - Order number
 * @returns {boolean} - True if valid format
 */
const isValidOrderNumber = (orderNumber) => {
  // Format: ORD-YYYYMM-0001
  const orderRegex = /^ORD-\d{6}-\d{4}$/;
  return orderRegex.test(orderNumber);
};

/**
 * Sanitize string input
 * @param {string} input - Input to sanitize
 * @returns {string} - Sanitized string
 */
const sanitizeString = (input) => {
  if (typeof input !== 'string') {
    return input;
  }

  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
};

/**
 * Validate file upload
 * @param {object} file - File object
 * @param {array} allowedTypes - Allowed MIME types
 * @param {number} maxSize - Maximum file size in bytes
 * @returns {object} - Validation result
 */
const validateFileUpload = (file, allowedTypes = [], maxSize = 5 * 1024 * 1024) => {
  const result = {
    valid: true,
    errors: []
  };

  if (!file) {
    result.valid = false;
    result.errors.push('No file provided');
    return result;
  }

  if (allowedTypes.length > 0 && !allowedTypes.includes(file.mimetype)) {
    result.valid = false;
    result.errors.push(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`);
  }

  if (file.size > maxSize) {
    result.valid = false;
    result.errors.push(`File size exceeds maximum allowed size of ${maxSize / (1024 * 1024)}MB`);
  }

  return result;
};

/**
 * Validate coupon code format
 * @param {string} code - Coupon code
 * @returns {object} - Validation result
 */
const validateCouponCode = (code) => {
  const result = {
    valid: true,
    errors: []
  };

  if (!code || typeof code !== 'string') {
    result.valid = false;
    result.errors.push('Coupon code is required');
    return result;
  }

  const trimmedCode = code.trim().toUpperCase();

  if (trimmedCode.length < 3 || trimmedCode.length > 20) {
    result.valid = false;
    result.errors.push('Coupon code must be between 3 and 20 characters');
  }

  // Alphanumeric only
  if (!/^[A-Z0-9]+$/.test(trimmedCode)) {
    result.valid = false;
    result.errors.push('Coupon code can only contain letters and numbers');
  }

  return result;
};

/**
 * Batch validation - validate multiple fields
 * @param {object} validations - Object with field names and validation functions
 * @param {object} data - Data to validate
 * @returns {object} - Combined validation result
 */
const batchValidate = (validations, data) => {
  const result = {
    valid: true,
    errors: {},
    hasErrors: false
  };

  for (const [field, validator] of Object.entries(validations)) {
    const fieldResult = validator(data[field]);
    
    if (fieldResult && !fieldResult.valid) {
      result.valid = false;
      result.hasErrors = true;
      result.errors[field] = fieldResult.errors;
    }
  }

  return result;
};

module.exports = {
  // Basic validations
  isValidEmail,
  isValidGSTIN,
  isValidPhone,
  validatePassword,
  isValidObjectId,

  // Date validations
  validateDateRange,
  validateRentalPeriod,

  // Number validations
  validatePrice,
  validateQuantity,

  // Product validations
  validateSKU,
  validateRentalPricing,

  // Address validation
  validateAddress,

  // Payment validations
  validatePaymentAmount,

  // Format validations
  isValidInvoiceNumber,
  isValidOrderNumber,

  // Security
  sanitizeString,

  // File upload
  validateFileUpload,

  // Coupon
  validateCouponCode,

  // Batch validation
  batchValidate
};