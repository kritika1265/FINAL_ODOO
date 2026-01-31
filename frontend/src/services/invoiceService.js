import api, { uploadFile } from './api';

/**
 * Product Service
 * Handles all product-related API calls
 */

const productService = {
  /**
   * Get all products with filters and pagination
   * @param {object} params - Query parameters
   * @returns {Promise} Products list
   */
  getAllProducts: async (params = {}) => {
    try {
      const response = await api.get('/products', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get single product by ID
   * @param {string} id - Product ID
   * @returns {Promise} Product data
   */
  getProductById: async (id) => {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Create new product
   * @param {object} productData - Product data
   * @returns {Promise} Created product
   */
  createProduct: async (productData) => {
    try {
      const response = await api.post('/products', productData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update existing product
   * @param {string} id - Product ID
   * @param {object} productData - Updated product data
   * @returns {Promise} Updated product
   */
  updateProduct: async (id, productData) => {
    try {
      const response = await api.put(`/products/${id}`, productData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete product
   * @param {string} id - Product ID
   * @returns {Promise} Delete confirmation
   */
  deleteProduct: async (id) => {
    try {
      const response = await api.delete(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Check product availability for rental period
   * @param {string} productId - Product ID
   * @param {string} variantId - Variant ID (optional)
   * @param {string} startDate - Rental start date
   * @param {string} endDate - Rental end date
   * @param {number} quantity - Requested quantity
   * @returns {Promise} Availability status
   */
  checkAvailability: async (productId, variantId, startDate, endDate, quantity) => {
    try {
      const response = await api.post('/products/check-availability', {
        productId,
        variantId,
        startDate,
        endDate,
        quantity,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get product variants
   * @param {string} productId - Product ID
   * @returns {Promise} Product variants
   */
  getProductVariants: async (productId) => {
    try {
      const response = await api.get(`/products/${productId}/variants`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Add product variant
   * @param {string} productId - Product ID
   * @param {object} variantData - Variant data
   * @returns {Promise} Created variant
   */
  addProductVariant: async (productId, variantData) => {
    try {
      const response = await api.post(`/products/${productId}/variants`, variantData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update product variant
   * @param {string} productId - Product ID
   * @param {string} variantId - Variant ID
   * @param {object} variantData - Updated variant data
   * @returns {Promise} Updated variant
   */
  updateProductVariant: async (productId, variantId, variantData) => {
    try {
      const response = await api.put(
        `/products/${productId}/variants/${variantId}`,
        variantData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete product variant
   * @param {string} productId - Product ID
   * @param {string} variantId - Variant ID
   * @returns {Promise} Delete confirmation
   */
  deleteProductVariant: async (productId, variantId) => {
    try {
      const response = await api.delete(`/products/${productId}/variants/${variantId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Upload product image
   * @param {string} productId - Product ID
   * @param {File} file - Image file
   * @param {function} onProgress - Progress callback
   * @returns {Promise} Upload result
   */
  uploadProductImage: async (productId, file, onProgress) => {
    try {
      const response = await uploadFile(
        `/products/${productId}/upload-image`,
        file,
        onProgress
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete product image
   * @param {string} productId - Product ID
   * @param {string} imageId - Image ID
   * @returns {Promise} Delete confirmation
   */
  deleteProductImage: async (productId, imageId) => {
    try {
      const response = await api.delete(`/products/${productId}/images/${imageId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get product attributes
   * @returns {Promise} Available attributes
   */
  getAttributes: async () => {
    try {
      const response = await api.get('/products/attributes');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get product categories
   * @returns {Promise} Available categories
   */
  getCategories: async () => {
    try {
      const response = await api.get('/products/categories');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Publish/Unpublish product on website
   * @param {string} id - Product ID
   * @param {boolean} published - Published status
   * @returns {Promise} Updated product
   */
  togglePublishStatus: async (id, published) => {
    try {
      const response = await api.patch(`/products/${id}/publish`, { published });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get rental pricing for product
   * @param {string} productId - Product ID
   * @param {string} startDate - Rental start date
   * @param {string} endDate - Rental end date
   * @param {number} quantity - Quantity
   * @returns {Promise} Calculated pricing
   */
  getRentalPricing: async (productId, startDate, endDate, quantity = 1) => {
    try {
      const response = await api.post(`/products/${productId}/calculate-price`, {
        startDate,
        endDate,
        quantity,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Search products
   * @param {string} query - Search query
   * @param {object} filters - Additional filters
   * @returns {Promise} Search results
   */
  searchProducts: async (query, filters = {}) => {
    try {
      const response = await api.get('/products/search', {
        params: { q: query, ...filters },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get featured products
   * @param {number} limit - Number of products to fetch
   * @returns {Promise} Featured products
   */
  getFeaturedProducts: async (limit = 10) => {
    try {
      const response = await api.get('/products/featured', {
        params: { limit },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get most rented products
   * @param {number} limit - Number of products to fetch
   * @returns {Promise} Most rented products
   */
  getMostRentedProducts: async (limit = 10) => {
    try {
      const response = await api.get('/products/most-rented', {
        params: { limit },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get related products
   * @param {string} productId - Product ID
   * @param {number} limit - Number of products to fetch
   * @returns {Promise} Related products
   */
  getRelatedProducts: async (productId, limit = 5) => {
    try {
      const response = await api.get(`/products/${productId}/related`, {
        params: { limit },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Bulk update products
   * @param {array} updates - Array of product updates
   * @returns {Promise} Update result
   */
  bulkUpdateProducts: async (updates) => {
    try {
      const response = await api.post('/products/bulk-update', { updates });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Export products to CSV/Excel
   * @param {object} filters - Export filters
   * @param {string} format - Export format (csv/xlsx)
   * @returns {Promise} File download
   */
  exportProducts: async (filters = {}, format = 'csv') => {
    try {
      const response = await api.get('/products/export', {
        params: { ...filters, format },
        responseType: 'blob',
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `products.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      return { success: true };
    } catch (error) {
      throw error;
    }
  },
};

export default productService;