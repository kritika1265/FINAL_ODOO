const { body, param, query, validationResult } = require('express-validator');

/**
 * Validator Middleware
 * Handles request validation using express-validator
 */

// @desc    Handle validation errors
// @access  All validated routes
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.param,
      message: error.msg,
      value: error.value
    }));

    return res.status(400).json({
      message: 'Validation failed',
      errors: formattedErrors
    });
  }

  next();
};

// Authentication Validators

const signupValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail(),

  body('companyName')
    .trim()
    .notEmpty()
    .withMessage('Company name is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('Company name must be between 2 and 200 characters'),

  body('gstin')
    .trim()
    .notEmpty()
    .withMessage('GSTIN is required')
    .matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)
    .withMessage('Invalid GSTIN format. Must be a valid 15-character GST number'),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

  body('confirmPassword')
    .notEmpty()
    .withMessage('Password confirmation is required')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match'),

  body('couponCode')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Coupon code must not exceed 50 characters'),

  handleValidationErrors
];

const loginValidator = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),

  handleValidationErrors
];

const forgotPasswordValidator = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail(),

  handleValidationErrors
];

const resetPasswordValidator = [
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

  body('confirmPassword')
    .notEmpty()
    .withMessage('Password confirmation is required')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match'),

  handleValidationErrors
];

const changePasswordValidator = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),

  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number'),

  body('confirmPassword')
    .notEmpty()
    .withMessage('Password confirmation is required')
    .custom((value, { req }) => value === req.body.newPassword)
    .withMessage('Passwords do not match'),

  handleValidationErrors
];

// Product Validators

const createProductValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('Product name must be between 2 and 200 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must not exceed 2000 characters'),

  body('sku')
    .trim()
    .notEmpty()
    .withMessage('SKU is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('SKU must be between 2 and 50 characters')
    .matches(/^[A-Za-z0-9-_]+$/)
    .withMessage('SKU can only contain letters, numbers, hyphens, and underscores'),

  body('category')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Category must not exceed 100 characters'),

  body('isRentable')
    .optional()
    .isBoolean()
    .withMessage('isRentable must be a boolean'),

  body('quantityOnHand')
    .notEmpty()
    .withMessage('Quantity on hand is required')
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer'),

  body('costPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Cost price must be a positive number'),

  body('salesPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Sales price must be a positive number'),

  body('rentalPricing.hourly')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Hourly rental price must be a positive number'),

  body('rentalPricing.daily')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Daily rental price must be a positive number'),

  body('rentalPricing.weekly')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Weekly rental price must be a positive number'),

  body('isPublished')
    .optional()
    .isBoolean()
    .withMessage('isPublished must be a boolean'),

  handleValidationErrors
];

const updateProductValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Product name must be between 2 and 200 characters'),

  body('quantityOnHand')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer'),

  body('costPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Cost price must be a positive number'),

  body('salesPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Sales price must be a positive number'),

  handleValidationErrors
];

// Order Validators

const createOrderValidator = [
  body('deliveryAddress')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Delivery address must not exceed 500 characters'),

  body('pickupAddress')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Pickup address must not exceed 500 characters'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must not exceed 1000 characters'),

  handleValidationErrors
];

const updateOrderStatusValidator = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['draft', 'confirmed', 'pickup_ready', 'with_customer', 'returned', 'cancelled'])
    .withMessage('Invalid status value'),

  handleValidationErrors
];

// Quotation Validators

const createQuotationValidator = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('Quotation must have at least one item'),

  body('items.*.product')
    .notEmpty()
    .withMessage('Product ID is required')
    .isMongoId()
    .withMessage('Invalid product ID'),

  body('items.*.quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),

  body('items.*.rentalStartDate')
    .notEmpty()
    .withMessage('Rental start date is required')
    .isISO8601()
    .withMessage('Invalid start date format'),

  body('items.*.rentalEndDate')
    .notEmpty()
    .withMessage('Rental end date is required')
    .isISO8601()
    .withMessage('Invalid end date format'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must not exceed 1000 characters'),

  handleValidationErrors
];

// Invoice Validators

const createInvoiceValidator = [
  body('paymentType')
    .optional()
    .isIn(['full', 'partial'])
    .withMessage('Payment type must be either "full" or "partial"'),

  body('partialAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Partial amount must be a positive number'),

  body('securityDeposit')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Security deposit must be a positive number'),

  body('paymentTerms')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Payment terms must not exceed 200 characters'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must not exceed 1000 characters'),

  handleValidationErrors
];

const recordPaymentValidator = [
  body('amount')
    .notEmpty()
    .withMessage('Payment amount is required')
    .isFloat({ min: 0.01 })
    .withMessage('Payment amount must be greater than 0'),

  body('paymentMethod')
    .optional()
    .isIn(['cash', 'card', 'online', 'upi', 'bank_transfer'])
    .withMessage('Invalid payment method'),

  body('transactionId')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Transaction ID must not exceed 100 characters'),

  body('paymentDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid payment date format'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must not exceed 500 characters'),

  handleValidationErrors
];

// Payment Validators

const initializePaymentValidator = [
  body('invoiceId')
    .notEmpty()
    .withMessage('Invoice ID is required')
    .isMongoId()
    .withMessage('Invalid invoice ID'),

  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),

  body('paymentMethod')
    .optional()
    .isIn(['razorpay', 'stripe', 'paypal'])
    .withMessage('Invalid payment method'),

  handleValidationErrors
];

const verifyPaymentValidator = [
  body('paymentId')
    .notEmpty()
    .withMessage('Payment ID is required'),

  body('gatewayPaymentId')
    .notEmpty()
    .withMessage('Gateway payment ID is required'),

  body('gatewayOrderId')
    .notEmpty()
    .withMessage('Gateway order ID is required'),

  body('gatewaySignature')
    .notEmpty()
    .withMessage('Gateway signature is required'),

  handleValidationErrors
];

// ID Validators

const mongoIdValidator = (paramName = 'id') => [
  param(paramName)
    .isMongoId()
    .withMessage(`Invalid ${paramName}`),

  handleValidationErrors
];

// Query Validators

const paginationValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  handleValidationErrors
];

const dateRangeValidator = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid start date format'),

  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid end date format')
    .custom((value, { req }) => {
      if (req.query.startDate && new Date(value) < new Date(req.query.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),

  handleValidationErrors
];

// Custom Validators

const customValidator = (validationRules) => {
  return [
    ...validationRules,
    handleValidationErrors
  ];
};

// Sanitization Middleware

const sanitizeInput = (req, res, next) => {
  // Remove any potentially dangerous characters
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, ''); // Remove event handlers
  };

  const sanitizeObject = (obj) => {
    if (typeof obj !== 'object' || obj === null) {
      return sanitizeString(obj);
    }

    const sanitized = Array.isArray(obj) ? [] : {};
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
    }

    return sanitized;
  };

  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  if (req.params) {
    req.params = sanitizeObject(req.params);
  }

  next();
};

module.exports = {
  // Error handler
  handleValidationErrors,

  // Authentication
  signupValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  changePasswordValidator,

  // Products
  createProductValidator,
  updateProductValidator,

  // Orders
  createOrderValidator,
  updateOrderStatusValidator,

  // Quotations
  createQuotationValidator,

  // Invoices
  createInvoiceValidator,
  recordPaymentValidator,

  // Payments
  initializePaymentValidator,
  verifyPaymentValidator,

  // General
  mongoIdValidator,
  paginationValidator,
  dateRangeValidator,
  customValidator,
  sanitizeInput
};