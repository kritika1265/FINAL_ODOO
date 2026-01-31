/**
 * Formatters Utility
 * Contains formatting functions for currency, dates, numbers, etc.
 */

/**
 * Format currency with INR symbol
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: INR)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'INR') => {
  if (amount === null || amount === undefined) return '₹0.00';
  
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  return formatter.format(amount);
};

/**
 * Format date to readable string
 * @param {string|Date} date - Date to format
 * @param {string} format - Format type ('short', 'long', 'medium')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = 'medium') => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) return '';
  
  const options = {
    short: { year: 'numeric', month: '2-digit', day: '2-digit' },
    medium: { year: 'numeric', month: 'short', day: 'numeric' },
    long: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' },
  };
  
  return new Intl.DateFormat('en-IN', options[format] || options.medium).format(dateObj);
};

/**
 * Format date and time
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date-time string
 */
export const formatDateTime = (date) => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) return '';
  
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
};

/**
 * Format time only
 * @param {string|Date} date - Date to extract time from
 * @returns {string} Formatted time string
 */
export const formatTime = (date) => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) return '';
  
  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
};

/**
 * Format date for input fields (YYYY-MM-DD)
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string for inputs
 */
export const formatDateForInput = (date) => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) return '';
  
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Calculate and format rental duration
 * @param {string|Date} startDate - Rental start date
 * @param {string|Date} endDate - Rental end date
 * @returns {object} Duration breakdown
 */
export const formatRentalDuration = (startDate, endDate) => {
  if (!startDate || !endDate) return null;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;
  
  const diffMs = end - start;
  const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(diffDays / 7);
  const remainingDays = diffDays % 7;
  
  let formatted = '';
  
  if (weeks > 0) {
    formatted += `${weeks} week${weeks > 1 ? 's' : ''}`;
    if (remainingDays > 0) {
      formatted += ` ${remainingDays} day${remainingDays > 1 ? 's' : ''}`;
    }
  } else if (diffDays > 0) {
    formatted = `${diffDays} day${diffDays > 1 ? 's' : ''}`;
  } else {
    formatted = `${diffHours} hour${diffHours > 1 ? 's' : ''}`;
  }
  
  return {
    hours: diffHours,
    days: diffDays,
    weeks,
    remainingDays,
    formatted,
  };
};

/**
 * Format phone number
 * @param {string} phone - Phone number to format
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format as +91-XXXXX-XXXXX for Indian numbers
  if (cleaned.length === 10) {
    return `+91-${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
  }
  
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return `+${cleaned.slice(0, 2)}-${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  
  return phone;
};

/**
 * Format GSTIN
 * @param {string} gstin - GSTIN to format
 * @returns {string} Formatted GSTIN
 */
export const formatGSTIN = (gstin) => {
  if (!gstin) return '';
  
  // Format as XX-XXXXX-XXXXX-X-XX
  const cleaned = gstin.replace(/[^A-Z0-9]/gi, '').toUpperCase();
  
  if (cleaned.length === 15) {
    return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 7)}-${cleaned.slice(7, 12)}-${cleaned.slice(12, 13)}-${cleaned.slice(13, 15)}`;
  }
  
  return gstin.toUpperCase();
};

/**
 * Format file size
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Format number with thousand separators
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  
  return new Intl.NumberFormat('en-IN').format(num);
};

/**
 * Format percentage
 * @param {number} value - Value to format as percentage
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage
 */
export const formatPercentage = (value, decimals = 2) => {
  if (value === null || value === undefined) return '0%';
  
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format order status with proper casing
 * @param {string} status - Order status
 * @returns {string} Formatted status
 */
export const formatOrderStatus = (status) => {
  if (!status) return '';
  
  const statusMap = {
    draft: 'Draft',
    sent: 'Sent',
    confirmed: 'Confirmed',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
    returned: 'Returned',
  };
  
  return statusMap[status.toLowerCase()] || status;
};

/**
 * Format payment status
 * @param {string} status - Payment status
 * @returns {string} Formatted payment status
 */
export const formatPaymentStatus = (status) => {
  if (!status) return '';
  
  const statusMap = {
    pending: 'Pending',
    paid: 'Paid',
    partial: 'Partially Paid',
    failed: 'Failed',
    refunded: 'Refunded',
  };
  
  return statusMap[status.toLowerCase()] || status;
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  
  if (text.length <= maxLength) return text;
  
  return `${text.slice(0, maxLength)}...`;
};

/**
 * Format address into single line
 * @param {object} address - Address object
 * @returns {string} Formatted address
 */
export const formatAddress = (address) => {
  if (!address) return '';
  
  const parts = [
    address.street,
    address.city,
    address.state,
    address.pincode,
  ].filter(Boolean);
  
  return parts.join(', ');
};

/**
 * Format name (capitalize first letter of each word)
 * @param {string} name - Name to format
 * @returns {string} Formatted name
 */
export const formatName = (name) => {
  if (!name) return '';
  
  return name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Format relative time (e.g., "2 hours ago")
 * @param {string|Date} date - Date to format
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (date) => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  const now = new Date();
  const diffMs = now - dateObj;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSecs < 60) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return formatDate(date);
};

/**
 * Format invoice number with prefix
 * @param {number} number - Invoice number
 * @param {string} prefix - Prefix (default: INV)
 * @returns {string} Formatted invoice number
 */
export const formatInvoiceNumber = (number, prefix = 'INV') => {
  if (!number) return '';
  
  return `${prefix}-${String(number).padStart(6, '0')}`;
};

/**
 * Format quotation number with prefix
 * @param {number} number - Quotation number
 * @param {string} prefix - Prefix (default: QT)
 * @returns {string} Formatted quotation number
 */
export const formatQuotationNumber = (number, prefix = 'QT') => {
  if (!number) return '';
  
  return `${prefix}-${String(number).padStart(6, '0')}`;
};

/**
 * Format order number with prefix
 * @param {number} number - Order number
 * @param {string} prefix - Prefix (default: ORD)
 * @returns {string} Formatted order number
 */
export const formatOrderNumber = (number, prefix = 'ORD') => {
  if (!number) return '';
  
  return `${prefix}-${String(number).padStart(6, '0')}`;
};

export default {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatTime,
  formatDateForInput,
  formatRentalDuration,
  formatPhoneNumber,
  formatGSTIN,
  formatFileSize,
  formatNumber,
  formatPercentage,
  formatOrderStatus,
  formatPaymentStatus,
  truncateText,
  formatAddress,
  formatName,
  formatRelativeTime,
  formatInvoiceNumber,
  formatQuotationNumber,
  formatOrderNumber,
};