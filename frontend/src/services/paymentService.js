import api from './api';

/**
 * Payment Service
 * Handles all payment-related API calls
 */

const paymentService = {
  /**
   * Create payment order
   * @param {object} paymentData - Payment order data
   * @returns {Promise} Payment order details
   */
  createPaymentOrder: async (paymentData) => {
    try {
      const response = await api.post('/payments/create-order', paymentData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Verify payment signature (Razorpay)
   * @param {object} paymentDetails - Payment verification details
   * @returns {Promise} Verification result
   */
  verifyPayment: async (paymentDetails) => {
    try {
      const response = await api.post('/payments/verify', paymentDetails);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Process payment
   * @param {string} invoiceId - Invoice ID
   * @param {object} paymentData - Payment details
   * @returns {Promise} Payment result
   */
  processPayment: async (invoiceId, paymentData) => {
    try {
      const response = await api.post('/payments/process', {
        invoiceId,
        ...paymentData,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get payment methods
   * @returns {Promise} Available payment methods
   */
  getPaymentMethods: async () => {
    try {
      const response = await api.get('/payments/methods');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Save payment method
   * @param {object} methodData - Payment method details
   * @returns {Promise} Saved payment method
   */
  savePaymentMethod: async (methodData) => {
    try {
      const response = await api.post('/payments/methods', methodData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete payment method
   * @param {string} methodId - Payment method ID
   * @returns {Promise} Delete confirmation
   */
  deletePaymentMethod: async (methodId) => {
    try {
      const response = await api.delete(`/payments/methods/${methodId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get payment by ID
   * @param {string} id - Payment ID
   * @returns {Promise} Payment details
   */
  getPaymentById: async (id) => {
    try {
      const response = await api.get(`/payments/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get all payments with filters
   * @param {object} params - Query parameters
   * @returns {Promise} Payments list
   */
  getAllPayments: async (params = {}) => {
    try {
      const response = await api.get('/payments', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get invoice payments
   * @param {string} invoiceId - Invoice ID
   * @returns {Promise} Invoice payments
   */
  getInvoicePayments: async (invoiceId) => {
    try {
      const response = await api.get(`/payments/invoice/${invoiceId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Refund payment
   * @param {string} paymentId - Payment ID
   * @param {object} refundData - Refund details
   * @returns {Promise} Refund result
   */
  refundPayment: async (paymentId, refundData) => {
    try {
      const response = await api.post(`/payments/${paymentId}/refund`, refundData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get payment status
   * @param {string} paymentId - Payment ID
   * @returns {Promise} Payment status
   */
  getPaymentStatus: async (paymentId) => {
    try {
      const response = await api.get(`/payments/${paymentId}/status`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Calculate payment amount
   * @param {string} invoiceId - Invoice ID
   * @param {object} paymentData - Payment calculation data
   * @returns {Promise} Calculated amount
   */
  calculatePaymentAmount: async (invoiceId, paymentData) => {
    try {
      const response = await api.post('/payments/calculate', {
        invoiceId,
        ...paymentData,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Create payment link
   * @param {string} invoiceId - Invoice ID
   * @param {object} linkData - Payment link configuration
   * @returns {Promise} Payment link
   */
  createPaymentLink: async (invoiceId, linkData) => {
    try {
      const response = await api.post('/payments/create-link', {
        invoiceId,
        ...linkData,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Send payment link to customer
   * @param {string} invoiceId - Invoice ID
   * @returns {Promise} Send confirmation
   */
  sendPaymentLink: async (invoiceId) => {
    try {
      const response = await api.post(`/payments/send-link/${invoiceId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Process partial payment
   * @param {string} invoiceId - Invoice ID
   * @param {object} paymentData - Partial payment details
   * @returns {Promise} Payment result
   */
  processPartialPayment: async (invoiceId, paymentData) => {
    try {
      const response = await api.post('/payments/partial', {
        invoiceId,
        ...paymentData,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Process security deposit payment
   * @param {string} orderId - Order ID
   * @param {object} paymentData - Deposit payment details
   * @returns {Promise} Payment result
   */
  processSecurityDeposit: async (orderId, paymentData) => {
    try {
      const response = await api.post('/payments/security-deposit', {
        orderId,
        ...paymentData,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get payment gateway config
   * @returns {Promise} Gateway configuration
   */
  getGatewayConfig: async () => {
    try {
      const response = await api.get('/payments/gateway-config');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Webhook handler for payment updates
   * @param {object} webhookData - Webhook payload
   * @returns {Promise} Webhook processing result
   */
  handleWebhook: async (webhookData) => {
    try {
      const response = await api.post('/payments/webhook', webhookData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get payment receipt
   * @param {string} paymentId - Payment ID
   * @returns {Promise} Payment receipt
   */
  getPaymentReceipt: async (paymentId) => {
    try {
      const response = await api.get(`/payments/${paymentId}/receipt`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Download payment receipt
   * @param {string} paymentId - Payment ID
   * @returns {Promise} PDF file download
   */
  downloadPaymentReceipt: async (paymentId) => {
    try {
      const response = await api.get(`/payments/${paymentId}/download-receipt`, {
        responseType: 'blob',
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `receipt-${paymentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get payment statistics
   * @param {object} params - Filter parameters
   * @returns {Promise} Payment statistics
   */
  getPaymentStats: async (params = {}) => {
    try {
      const response = await api.get('/payments/stats', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get customer payment history
   * @param {string} customerId - Customer ID
   * @param {object} params - Query parameters
   * @returns {Promise} Payment history
   */
  getCustomerPaymentHistory: async (customerId, params = {}) => {
    try {
      const response = await api.get(`/payments/customer/${customerId}`, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get vendor payment history
   * @param {string} vendorId - Vendor ID
   * @param {object} params - Query parameters
   * @returns {Promise} Payment history
   */
  getVendorPaymentHistory: async (vendorId, params = {}) => {
    try {
      const response = await api.get(`/payments/vendor/${vendorId}`, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Retry failed payment
   * @param {string} paymentId - Payment ID
   * @returns {Promise} Retry result
   */
  retryFailedPayment: async (paymentId) => {
    try {
      const response = await api.post(`/payments/${paymentId}/retry`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Export payments to CSV/Excel
   * @param {object} filters - Export filters
   * @param {string} format - Export format (csv/xlsx)
   * @returns {Promise} File download
   */
  exportPayments: async (filters = {}, format = 'csv') => {
    try {
      const response = await api.get('/payments/export', {
        params: { ...filters, format },
        responseType: 'blob',
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `payments.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      return { success: true };
    } catch (error) {
      throw error;
    }
  },
};

export default paymentService;