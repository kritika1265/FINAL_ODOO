import api from './api';

/**
 * Quotation Service
 * Handles all quotation-related API calls
 */

const quotationService = {
  /**
   * Get all quotations with filters and pagination
   * @param {object} params - Query parameters
   * @returns {Promise} Quotations list
   */
  getAllQuotations: async (params = {}) => {
    try {
      const response = await api.get('/quotations', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get single quotation by ID
   * @param {string} id - Quotation ID
   * @returns {Promise} Quotation data
   */
  getQuotationById: async (id) => {
    try {
      const response = await api.get(`/quotations/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Create new quotation
   * @param {object} quotationData - Quotation data
   * @returns {Promise} Created quotation
   */
  createQuotation: async (quotationData) => {
    try {
      const response = await api.post('/quotations', quotationData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Create quotation from cart items
   * @param {array} items - Cart items
   * @returns {Promise} Created quotation
   */
  createQuotationFromCart: async (items) => {
    try {
      const response = await api.post('/quotations/from-cart', { items });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update existing quotation
   * @param {string} id - Quotation ID
   * @param {object} quotationData - Updated quotation data
   * @returns {Promise} Updated quotation
   */
  updateQuotation: async (id, quotationData) => {
    try {
      const response = await api.put(`/quotations/${id}`, quotationData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete quotation
   * @param {string} id - Quotation ID
   * @returns {Promise} Delete confirmation
   */
  deleteQuotation: async (id) => {
    try {
      const response = await api.delete(`/quotations/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Add item to quotation
   * @param {string} quotationId - Quotation ID
   * @param {object} item - Item data
   * @returns {Promise} Updated quotation
   */
  addItemToQuotation: async (quotationId, item) => {
    try {
      const response = await api.post(`/quotations/${quotationId}/items`, item);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update item in quotation
   * @param {string} quotationId - Quotation ID
   * @param {string} itemId - Item ID
   * @param {object} itemData - Updated item data
   * @returns {Promise} Updated quotation
   */
  updateQuotationItem: async (quotationId, itemId, itemData) => {
    try {
      const response = await api.put(
        `/quotations/${quotationId}/items/${itemId}`,
        itemData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Remove item from quotation
   * @param {string} quotationId - Quotation ID
   * @param {string} itemId - Item ID
   * @returns {Promise} Updated quotation
   */
  removeItemFromQuotation: async (quotationId, itemId) => {
    try {
      const response = await api.delete(`/quotations/${quotationId}/items/${itemId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Send quotation to customer
   * @param {string} id - Quotation ID
   * @returns {Promise} Send confirmation
   */
  sendQuotation: async (id) => {
    try {
      const response = await api.post(`/quotations/${id}/send`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Confirm quotation and convert to order
   * @param {string} id - Quotation ID
   * @returns {Promise} Created order
   */
  confirmQuotation: async (id) => {
    try {
      const response = await api.post(`/quotations/${id}/confirm`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Cancel quotation
   * @param {string} id - Quotation ID
   * @param {string} reason - Cancellation reason
   * @returns {Promise} Updated quotation
   */
  cancelQuotation: async (id, reason) => {
    try {
      const response = await api.post(`/quotations/${id}/cancel`, { reason });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Duplicate quotation
   * @param {string} id - Quotation ID
   * @returns {Promise} New quotation
   */
  duplicateQuotation: async (id) => {
    try {
      const response = await api.post(`/quotations/${id}/duplicate`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Download quotation as PDF
   * @param {string} id - Quotation ID
   * @returns {Promise} PDF file download
   */
  downloadQuotationPDF: async (id) => {
    try {
      const response = await api.get(`/quotations/${id}/download`, {
        responseType: 'blob',
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `quotation-${id}.pdf`);
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
   * Get quotation statistics
   * @param {object} params - Filter parameters
   * @returns {Promise} Quotation statistics
   */
  getQuotationStats: async (params = {}) => {
    try {
      const response = await api.get('/quotations/stats', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Apply discount to quotation
   * @param {string} id - Quotation ID
   * @param {object} discountData - Discount details
   * @returns {Promise} Updated quotation
   */
  applyDiscount: async (id, discountData) => {
    try {
      const response = await api.post(`/quotations/${id}/apply-discount`, discountData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Remove discount from quotation
   * @param {string} id - Quotation ID
   * @returns {Promise} Updated quotation
   */
  removeDiscount: async (id) => {
    try {
      const response = await api.delete(`/quotations/${id}/discount`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get customer quotations
   * @param {string} customerId - Customer ID
   * @param {object} params - Query parameters
   * @returns {Promise} Customer quotations
   */
  getCustomerQuotations: async (customerId, params = {}) => {
    try {
      const response = await api.get(`/quotations/customer/${customerId}`, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get vendor quotations
   * @param {string} vendorId - Vendor ID
   * @param {object} params - Query parameters
   * @returns {Promise} Vendor quotations
   */
  getVendorQuotations: async (vendorId, params = {}) => {
    try {
      const response = await api.get(`/quotations/vendor/${vendorId}`, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update quotation status
   * @param {string} id - Quotation ID
   * @param {string} status - New status (draft, sent, confirmed, cancelled)
   * @returns {Promise} Updated quotation
   */
  updateQuotationStatus: async (id, status) => {
    try {
      const response = await api.patch(`/quotations/${id}/status`, { status });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Add notes to quotation
   * @param {string} id - Quotation ID
   * @param {string} notes - Notes content
   * @returns {Promise} Updated quotation
   */
  addNotes: async (id, notes) => {
    try {
      const response = await api.post(`/quotations/${id}/notes`, { notes });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Set quotation validity period
   * @param {string} id - Quotation ID
   * @param {string} validUntil - Valid until date
   * @returns {Promise} Updated quotation
   */
  setValidity: async (id, validUntil) => {
    try {
      const response = await api.patch(`/quotations/${id}/validity`, { validUntil });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Export quotations to CSV/Excel
   * @param {object} filters - Export filters
   * @param {string} format - Export format (csv/xlsx)
   * @returns {Promise} File download
   */
  exportQuotations: async (filters = {}, format = 'csv') => {
    try {
      const response = await api.get('/quotations/export', {
        params: { ...filters, format },
        responseType: 'blob',
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `quotations.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      return { success: true };
    } catch (error) {
      throw error;
    }
  },
};

export default quotationService;