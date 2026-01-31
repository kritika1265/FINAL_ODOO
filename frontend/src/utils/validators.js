/**
 * Validators Utility
 * Contains validation functions for forms, inputs, and business logic
 */

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {object} Validation result
 */
export const validateEmail = (email) => {
  if (!email) {
    return { valid: false, message: 'Email is required' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return { valid: false, message: 'Invalid email format' };
  }
  
  return { valid: true };
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} Validation result with strength score
 */
export const validatePassword = (password) => {
  if (!password) {
    return { valid: false, message: 'Password is required', strength: 0 };
  }
  
  if (password.length < 8) {
    return { 
      valid: false, 
      message: 'Password must be at least 8 characters long',
      strength: 0 
    };
  }
  
  let strength = 0;
  const checks = {
    hasLowercase: /[a-z]/.test(password),
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    isLongEnough: password.length >= 12,
  };
  
  // Calculate strength score
  Object.values(checks).forEach(check => {
    if (check) strength += 20;
  });
  
  let strengthLabel = 'Weak';
  if (strength >= 80) strengthLabel = 'Strong';
  else if (strength >= 60) strengthLabel = 'Medium';
  
  const missingRequirements = [];
  if (!checks.hasLowercase) missingRequirements.push('lowercase letter');
  if (!checks.hasUppercase) missingRequirements.push('uppercase letter');
  if (!checks.hasNumber) missingRequirements.push('number');
  if (!checks.hasSpecial) missingRequirements.push('special character');
  
  if (strength < 60) {
    return {
      valid: false,
      message: `Password should include: ${missingRequirements.join(', ')}`,
      strength,
      strengthLabel,
    };
  }
  
  return { valid: true, strength, strengthLabel };
};

/**
 * Validate password confirmation
 * @param {string} password - Original password
 * @param {string} confirmPassword - Confirmation password
 * @returns {object} Validation result
 */
export const validatePasswordMatch = (password, confirmPassword) => {
  if (!confirmPassword) {
    return { valid: false, message: 'Please confirm your password' };
  }
  
  if (password !== confirmPassword) {
    return { valid: false, message: 'Passwords do not match' };
  }
  
  return { valid: true };
};

/**
 * Validate GSTIN (Goods and Services Tax Identification Number)
 * Format: 22AAAAA0000A1Z5 (15 characters)
 * @param {string} gstin - GSTIN to validate
 * @returns {object} Validation result
 */
export const validateGSTIN = (gstin) => {
  if (!gstin) {
    return { valid: false, message: 'GSTIN is required' };
  }
  
  // Remove spaces and hyphens
  const cleanGSTIN = gstin.replace(/[\s-]/g, '').toUpperCase();
  
  if (cleanGSTIN.length !== 15) {
    return { valid: false, message: 'GSTIN must be 15 characters long' };
  }
  
  // GSTIN format: 22AAAAA0000A1Z5
  // First 2 digits: State code (01-37)
  // Next 10 characters: PAN
  // 13th character: Entity number
  // 14th character: Z (default)
  // 15th character: Check digit
  
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  
  if (!gstinRegex.test(cleanGSTIN)) {
    return { valid: false, message: 'Invalid GSTIN format' };
  }
  
  return { valid: true };
};

/**
 * Validate Indian phone number
 * @param {string} phone - Phone number to validate
 * @returns {object} Validation result
 */
export const validatePhoneNumber = (phone) => {
  if (!phone) {
    return { valid: false, message: 'Phone number is required' };
  }
  
  // Remove all non-numeric characters
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Indian phone numbers: 10 digits or 12 digits with country code (91)
  if (cleanPhone.length === 10) {
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      return { valid: false, message: 'Invalid phone number format' };
    }
    return { valid: true };
  }
  
  if (cleanPhone.length === 12) {
    if (!/^91[6-9]\d{9}$/.test(cleanPhone)) {
      return { valid: false, message: 'Invalid phone number format' };
    }
    return { valid: true };
  }
  
  return { valid: false, message: 'Phone number must be 10 digits' };
};

/**
 * Validate pincode
 * @param {string} pincode - Pincode to validate
 * @returns {object} Validation result
 */
export const validatePincode = (pincode) => {
  if (!pincode) {
    return { valid: false, message: 'Pincode is required' };
  }
  
  const cleanPincode = pincode.replace(/\s/g, '');
  
  if (!/^\d{6}$/.test(cleanPincode)) {
    return { valid: false, message: 'Pincode must be 6 digits' };
  }
  
  return { valid: true };
};

/**
 * Validate rental dates
 * @param {string|Date} startDate - Rental start date
 * @param {string|Date} endDate - Rental end date
 * @returns {object} Validation result
 */
export const validateRentalDates = (startDate, endDate) => {
  if (!startDate) {
    return { valid: false, message: 'Start date is required' };
  }
  
  if (!endDate) {
    return { valid: false, message: 'End date is required' };
  }
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();
  
  // Reset time to compare only dates
  now.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  
  if (start < now) {
    return { valid: false, message: 'Start date cannot be in the past' };
  }
  
  if (end <= start) {
    return { valid: false, message: 'End date must be after start date' };
  }
  
  // Optional: Check maximum rental period (e.g., 1 year)
  const maxRentalDays = 365;
  const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  
  if (diffDays > maxRentalDays) {
    return { 
      valid: false, 
      message: `Rental period cannot exceed ${maxRentalDays} days` 
    };
  }
  
  return { valid: true, duration: diffDays };
};

/**
 * Validate quantity
 * @param {number} quantity - Quantity to validate
 * @param {number} maxQuantity - Maximum available quantity
 * @returns {object} Validation result
 */
export const validateQuantity = (quantity, maxQuantity = null) => {
  if (!quantity || quantity < 1) {
    return { valid: false, message: 'Quantity must be at least 1' };
  }
  
  if (!Number.isInteger(Number(quantity))) {
    return { valid: false, message: 'Quantity must be a whole number' };
  }
  
  if (maxQuantity !== null && quantity > maxQuantity) {
    return { 
      valid: false, 
      message: `Only ${maxQuantity} units available` 
    };
  }
  
  return { valid: true };
};

/**
 * Validate price
 * @param {number} price - Price to validate
 * @returns {object} Validation result
 */
export const validatePrice = (price) => {
  if (price === null || price === undefined || price === '') {
    return { valid: false, message: 'Price is required' };
  }
  
  const numPrice = Number(price);
  
  if (isNaN(numPrice)) {
    return { valid: false, message: 'Price must be a valid number' };
  }
  
  if (numPrice < 0) {
    return { valid: false, message: 'Price cannot be negative' };
  }
  
  return { valid: true };
};

/**
 * Validate required field
 * @param {any} value - Value to validate
 * @param {string} fieldName - Name of the field
 * @returns {object} Validation result
 */
export const validateRequired = (value, fieldName = 'This field') => {
  if (value === null || value === undefined || value === '') {
    return { valid: false, message: `${fieldName} is required` };
  }
  
  if (typeof value === 'string' && value.trim() === '') {
    return { valid: false, message: `${fieldName} cannot be empty` };
  }
  
  return { valid: true };
};

/**
 * Validate minimum length
 * @param {string} value - Value to validate
 * @param {number} minLength - Minimum length required
 * @param {string} fieldName - Name of the field
 * @returns {object} Validation result
 */
export const validateMinLength = (value, minLength, fieldName = 'This field') => {
  if (!value) {
    return { valid: false, message: `${fieldName} is required` };
  }
  
  if (value.length < minLength) {
    return { 
      valid: false, 
      message: `${fieldName} must be at least ${minLength} characters long` 
    };
  }
  
  return { valid: true };
};

/**
 * Validate maximum length
 * @param {string} value - Value to validate
 * @param {number} maxLength - Maximum length allowed
 * @param {string} fieldName - Name of the field
 * @returns {object} Validation result
 */
export const validateMaxLength = (value, maxLength, fieldName = 'This field') => {
  if (!value) {
    return { valid: true };
  }
  
  if (value.length > maxLength) {
    return { 
      valid: false, 
      message: `${fieldName} cannot exceed ${maxLength} characters` 
    };
  }
  
  return { valid: true };
};

/**
 * Validate URL
 * @param {string} url - URL to validate
 * @returns {object} Validation result
 */
export const validateURL = (url) => {
  if (!url) {
    return { valid: false, message: 'URL is required' };
  }
  
  try {
    new URL(url);
    return { valid: true };
  } catch (err) {
    return { valid: false, message: 'Invalid URL format' };
  }
};

/**
 * Validate file type
 * @param {File} file - File to validate
 * @param {Array} allowedTypes - Array of allowed MIME types
 * @returns {object} Validation result
 */
export const validateFileType = (file, allowedTypes = []) => {
  if (!file) {
    return { valid: false, message: 'No file selected' };
  }
  
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return { 
      valid: false, 
      message: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}` 
    };
  }
  
  return { valid: true };
};

/**
 * Validate file size
 * @param {File} file - File to validate
 * @param {number} maxSizeMB - Maximum file size in MB
 * @returns {object} Validation result
 */
export const validateFileSize = (file, maxSizeMB = 5) => {
  if (!file) {
    return { valid: false, message: 'No file selected' };
  }
  
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  
  if (file.size > maxSizeBytes) {
    return { 
      valid: false, 
      message: `File size cannot exceed ${maxSizeMB}MB` 
    };
  }
  
  return { valid: true };
};

/**
 * Validate signup form
 * @param {object} formData - Form data to validate
 * @returns {object} Validation result with errors object
 */
export const validateSignupForm = (formData) => {
  const errors = {};
  
  // Validate name
  const nameValidation = validateRequired(formData.name, 'Name');
  if (!nameValidation.valid) errors.name = nameValidation.message;
  
  // Validate email
  const emailValidation = validateEmail(formData.email);
  if (!emailValidation.valid) errors.email = emailValidation.message;
  
  // Validate company name
  const companyValidation = validateRequired(formData.companyName, 'Company name');
  if (!companyValidation.valid) errors.companyName = companyValidation.message;
  
  // Validate GSTIN
  const gstinValidation = validateGSTIN(formData.gstin);
  if (!gstinValidation.valid) errors.gstin = gstinValidation.message;
  
  // Validate password
  const passwordValidation = validatePassword(formData.password);
  if (!passwordValidation.valid) errors.password = passwordValidation.message;
  
  // Validate password confirmation
  const confirmValidation = validatePasswordMatch(
    formData.password, 
    formData.confirmPassword
  );
  if (!confirmValidation.valid) errors.confirmPassword = confirmValidation.message;
  
  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate login form
 * @param {object} formData - Form data to validate
 * @returns {object} Validation result with errors object
 */
export const validateLoginForm = (formData) => {
  const errors = {};
  
  // Validate email
  const emailValidation = validateEmail(formData.email);
  if (!emailValidation.valid) errors.email = emailValidation.message;
  
  // Validate password
  const passwordValidation = validateRequired(formData.password, 'Password');
  if (!passwordValidation.valid) errors.password = passwordValidation.message;
  
  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate product form
 * @param {object} formData - Form data to validate
 * @returns {object} Validation result with errors object
 */
export const validateProductForm = (formData) => {
  const errors = {};
  
  // Validate product name
  const nameValidation = validateRequired(formData.name, 'Product name');
  if (!nameValidation.valid) errors.name = nameValidation.message;
  
  // Validate quantity
  const qtyValidation = validateQuantity(formData.quantity);
  if (!qtyValidation.valid) errors.quantity = qtyValidation.message;
  
  // Validate pricing
  if (formData.rentalPricing) {
    if (formData.rentalPricing.hour) {
      const hourValidation = validatePrice(formData.rentalPricing.hour);
      if (!hourValidation.valid) errors.hourlyPrice = hourValidation.message;
    }
    
    if (formData.rentalPricing.day) {
      const dayValidation = validatePrice(formData.rentalPricing.day);
      if (!dayValidation.valid) errors.dailyPrice = dayValidation.message;
    }
    
    if (formData.rentalPricing.week) {
      const weekValidation = validatePrice(formData.rentalPricing.week);
      if (!weekValidation.valid) errors.weeklyPrice = weekValidation.message;
    }
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate rental order form
 * @param {object} formData - Form data to validate
 * @returns {object} Validation result with errors object
 */
export const validateRentalOrderForm = (formData) => {
  const errors = {};
  
  // Validate dates
  const dateValidation = validateRentalDates(formData.startDate, formData.endDate);
  if (!dateValidation.valid) {
    errors.dates = dateValidation.message;
  }
  
  // Validate quantity
  const qtyValidation = validateQuantity(
    formData.quantity, 
    formData.maxQuantity
  );
  if (!qtyValidation.valid) errors.quantity = qtyValidation.message;
  
  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

export default {
  validateEmail,
  validatePassword,
  validatePasswordMatch,
  validateGSTIN,
  validatePhoneNumber,
  validatePincode,
  validateRentalDates,
  validateQuantity,
  validatePrice,
  validateRequired,
  validateMinLength,
  validateMaxLength,
  validateURL,
  validateFileType,
  validateFileSize,
  validateSignupForm,
  validateLoginForm,
  validateProductForm,
  validateRentalOrderForm,
};