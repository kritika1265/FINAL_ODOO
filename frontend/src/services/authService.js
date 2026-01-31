import api from './api';

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

const authService = {
  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise} User data and token
   */
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      
      // Store token in localStorage
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Register new user
   * @param {object} userData - User registration data
   * @returns {Promise} User data and token
   */
  signup: async (userData) => {
    try {
      const response = await api.post('/auth/signup', userData);
      
      // Store token in localStorage
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Logout user
   * @returns {Promise} Logout confirmation
   */
  logout: async () => {
    try {
      const response = await api.post('/auth/logout');
      
      // Clear token from localStorage
      localStorage.removeItem('authToken');
      
      return response.data;
    } catch (error) {
      // Clear token even if request fails
      localStorage.removeItem('authToken');
      throw error;
    }
  },

  /**
   * Verify authentication token
   * @returns {Promise} User data
   */
  verifyToken: async () => {
    try {
      const response = await api.get('/auth/verify');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Send forgot password email
   * @param {string} email - User email
   * @returns {Promise} Success message
   */
  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Reset password with token
   * @param {string} token - Reset token
   * @param {string} password - New password
   * @returns {Promise} Success message
   */
  resetPassword: async (token, password) => {
    try {
      const response = await api.post('/auth/reset-password', {
        token,
        password,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Change password for logged-in user
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise} Success message
   */
  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get current user profile
   * @returns {Promise} User data
   */
  getProfile: async () => {
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update user profile
   * @param {object} updates - Profile updates
   * @returns {Promise} Updated user data
   */
  updateProfile: async (updates) => {
    try {
      const response = await api.put('/auth/profile', updates);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update company information
   * @param {object} companyData - Company information
   * @returns {Promise} Updated user data
   */
  updateCompanyInfo: async (companyData) => {
    try {
      const response = await api.put('/auth/company', companyData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Refresh authentication token
   * @returns {Promise} New token
   */
  refreshToken: async () => {
    try {
      const response = await api.post('/auth/refresh-token');
      
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Verify coupon code during signup
   * @param {string} code - Coupon code
   * @returns {Promise} Coupon validity and details
   */
  verifyCoupon: async (code) => {
    try {
      const response = await api.post('/auth/verify-coupon', { code });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Check if email is already registered
   * @param {string} email - Email to check
   * @returns {Promise} Availability status
   */
  checkEmailAvailability: async (email) => {
    try {
      const response = await api.post('/auth/check-email', { email });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Resend email verification
   * @returns {Promise} Success message
   */
  resendVerificationEmail: async () => {
    try {
      const response = await api.post('/auth/resend-verification');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Verify email with token
   * @param {string} token - Verification token
   * @returns {Promise} Success message
   */
  verifyEmail: async (token) => {
    try {
      const response = await api.post('/auth/verify-email', { token });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default authService;