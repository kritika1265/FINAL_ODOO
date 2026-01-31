import api from './api';

/**
 * Order Service
 * Handles all rental order-related API calls
 */

const orderService = {
  /**
   * Get all orders with filters and pagination
   * @param {object} params - Query parameters
   * @returns {Promise} Orders list
   */
  getAllOrders: async (params = {}) => {
    try {
      const response = await api.get('/orders', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get single order by ID
   * @param {string} id - Order ID
   * @returns {Promise} Order data
   */
  getOrderById: async (id) => {
    try {
      const response = await api.get(`/orders/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Create new order
   * @param {object} orderData - Order data
   * @returns {Promise} Created order
   */
  createOrder: async (orderData) => {
    try {
      const response = await api.post('/orders', orderData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Create order from quotation
   * @param {string} quotationId - Quotation ID
   * @returns {Promise} Created order
   */
  createOrderFromQuotation: async (quotationId) => {
    try {
      const response = await api.post('/orders/from-quotation', { quotationId });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update existing order
   * @param {string} id - Order ID
   * @param {object} orderData - Updated order data
   * @returns {Promise} Updated order
   */
  updateOrder: async (id, orderData) => {
    try {
      const response = await api.put(`/orders/${id}`, orderData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Cancel order
   * @param {string} id - Order ID
   * @param {string} reason - Cancellation reason
   * @returns {Promise} Updated order
   */
  cancelOrder: async (id, reason) => {
    try {
      const response = await api.post(`/orders/${id}/cancel`, { reason });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Confirm order
   * @param {string} id - Order ID
   * @returns {Promise} Updated order
   */
  confirmOrder: async (id) => {
    try {
      const response = await api.post(`/orders/${id}/confirm`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Process pickup for order
   * @param {string} id - Order ID
   * @param {object} pickupData - Pickup details
   * @returns {Promise} Updated order with pickup document
   */
  processPickup: async (id, pickupData) => {
    try {
      const response = await api.post(`/orders/${id}/pickup`, pickupData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get pickup document
   * @param {string} id - Order ID
   * @returns {Promise} Pickup document
   */
  getPickupDocument: async (id) => {
    try {
      const response = await api.get(`/orders/${id}/pickup-document`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Process return for order
   * @param {string} id - Order ID
   * @param {object} returnData - Return details
   * @returns {Promise} Updated order with return document
   */
  processReturn: async (id, returnData) => {
    try {
      const response = await api.post(`/orders/${id}/return`, returnData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get return document
   * @param {string} id - Order ID
   * @returns {Promise} Return document
   */
  getReturnDocument: async (id) => {
    try {
      const response = await api.get(`/orders/${id}/return-document`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Calculate late return fees
   * @param {string} id - Order ID
   * @returns {Promise} Late fee calculation
   */
  calculateLateFees: async (id) => {
    try {
      const response = await api.get(`/orders/${id}/late-fees`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Apply late return fees
   * @param {string} id - Order ID
   * @param {number} amount - Late fee amount
   * @returns {Promise} Updated order
   */
  applyLateFees: async (id, amount) => {
    try {
      const response = await api.post(`/orders/${id}/apply-late-fees`, { amount });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update order status
   * @param {string} id - Order ID
   * @param {string} status - New status
   * @returns {Promise} Updated order
   */
  updateOrderStatus: async (id, status) => {
    try {
      const response = await api.patch(`/orders/${id}/status`, { status });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Extend rental period
   * @param {string} id - Order ID
   * @param {string} newEndDate - New end date
   * @returns {Promise} Updated order
   */
  extendRentalPeriod: async (id, newEndDate) => {
    try {
      const response = await api.post(`/orders/${id}/extend`, { newEndDate });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get customer orders
   * @param {string} customerId - Customer ID
   * @param {object} params - Query parameters
   * @returns {Promise} Customer orders
   */
  getCustomerOrders: async (customerId, params = {}) => {
    try {
      const response = await api.get(`/orders/customer/${customerId}`, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get vendor orders
   * @param {string} vendorId - Vendor ID
   * @param {object} params - Query parameters
   * @returns {Promise} Vendor orders
   */
  getVendorOrders: async (vendorId, params = {}) => {
    try {
      const response = await api.get(`/orders/vendor/${vendorId}`, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get order statistics
   * @param {object} params - Filter parameters
   * @returns {Promise} Order statistics
   */
  getOrderStats: async (params = {}) => {
    try {
      const response = await api.get('/orders/stats', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get upcoming pickups
   * @param {object} params - Filter parameters
   * @returns {Promise} Upcoming pickups list
   */
  getUpcomingPickups: async (params = {}) => {
    try {
      const response = await api.get('/orders/upcoming-pickups', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get upcoming returns
   * @param {object} params - Filter parameters
   * @returns {Promise} Upcoming returns list
   */
  getUpcomingReturns: async (params = {}) => {
    try {
      const response = await api.get('/orders/upcoming-returns', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get overdue returns
   * @param {object} params - Filter parameters
   * @returns {Promise} Overdue returns list
   */
  getOverdueReturns: async (params = {}) => {
    try {
      const response = await api.get('/orders/overdue-returns', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Send return reminder
   * @param {string} id - Order ID
   * @returns {Promise} Send confirmation
   */
  sendReturnReminder: async (id) => {
    try {
      const response = await api.post(`/orders/${id}/send-reminder`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Add notes to order
   * @param {string} id - Order ID
   * @param {string} notes - Notes content
   * @returns {Promise} Updated order
   */
  addNotes: async (id, notes) => {
    try {
      const response = await api.post(`/orders/${id}/notes`, { notes });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update delivery address
   * @param {string} id - Order ID
   * @param {object} address - New address
   * @returns {Promise} Updated order
   */
  updateDeliveryAddress: async (id, address) => {
    try {
      const response = await api.put(`/orders/${id}/delivery-address`, address);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get order timeline/history
   * @param {string} id - Order ID
   * @returns {Promise} Order timeline
   */
  getOrderTimeline: async (id) => {
    try {
      const response = await api.get(`/orders/${id}/timeline`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Download order confirmation
   * @param {string} id - Order ID
   * @returns {Promise} PDF file download
   */
  downloadOrderConfirmation: async (id) => {
    try {
      const response = await api.get(`/orders/${id}/download`, {
        responseType: 'blob',
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `order-${id}.pdf`);
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
   * Export orders to CSV/Excel
   * @param {object} filters - Export filters
   * @param {string} format - Export format (csv/xlsx)
   * @returns {Promise} File download
   */
  exportOrders: async (filters = {}, format = 'csv') => {
    try {
      const response = await api.get('/orders/export', {
        params: { ...filters, format },
        responseType: 'blob',
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `orders.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      return { success: true };
    } catch (error) {
      throw error;
    }
  },
};

export default orderService;