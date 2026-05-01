// src/api/auth.js - FIXED VERSION
import apiClient from './client';

/**
 * Authentication API service
 * Handles user registration, login, and related operations
 */
const authApi = {
  /**
   * Initiate login with 2FA
   * @param {Object} credentials - User credentials
   * @param {string} credentials.username - Username
   * @param {string} credentials.password - Password
   * @returns {Promise<Object>} Login response with 2FA status
   */
  initiateLogin: async (credentials) => {
    try {
      // Use the existing /auth/login endpoint (not /auth/2fa/initiate)
      const response = await apiClient.post('/auth/login', credentials);
      console.log('API initiate login response:', response);
      
      // Check if backend returned success (indicating OTP was sent)
      if (response.data && response.data.success === true) {
        console.log('OTP sent successfully, 2FA required');
        return {
          requires2FA: true,
          email: `${credentials.username}@theatresystem.com`,
          message: response.data.message
        };
      }
      
      // If we got a token directly (no 2FA), return that
      if (response.data && response.data.token) {
        console.log('Direct login without 2FA');
        return response.data;
      }
      
      // Unexpected response
      console.warn('Unexpected response structure:', response.data);
      return response.data;
      
    } catch (error) {
      console.error('API initiate login error:', error);
      
      // Check if it's a 401 (invalid credentials)
      if (error.response && error.response.status === 401) {
        throw new Error('Invalid username or password');
      }
      
      throw error;
    }
  },

  /**
   * Verify OTP for 2FA login
   * @param {Object} data - Verification data
   * @param {string} data.username - Username
   * @param {string} data.password - Password
   * @param {string} data.otp - OTP code
   * @returns {Promise<Object>} Login response with token and user info
   */
  verifyOtp: async (data) => {
    try {
      const response = await apiClient.post('/auth/2fa/verify', data);
      console.log('API verify OTP response:', response);
      return response.data;
    } catch (error) {
      console.error('API verify OTP error:', error);
      throw error;
    }
  },

  /**
   * Login a user with username and password (legacy method without 2FA)
   * @param {Object} credentials - User credentials
   * @param {string} credentials.username - Username
   * @param {string} credentials.password - Password
   * @returns {Promise<Object>} Login response with token and user info
   */
  login: async (credentials) => {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      console.log('API login response:', response);
      return response.data;
    } catch (error) {
      console.error('API login error:', error);
      throw error;
    }
  },

  /**
   * Register a new user
   * @param {Object} userData - User data for registration
   * @param {string} userData.username - Username
   * @param {string} userData.email - Email
   * @param {string} userData.password - Password
   * @param {string} userData.firstName - First name
   * @param {string} userData.lastName - Last name
   * @param {string} [userData.phoneNumber] - Optional phone number
   * @returns {Promise<Object>} Registration response
   */
  register: async (userData) => {
    try {
      const response = await apiClient.post('/auth/signup', userData);
      console.log('API register response:', response);
      return response.data;
    } catch (error) {
      console.error('API register error:', error);
      throw error;
    }
  },

  /**
   * Request password reset
   * @param {Object} data - Password reset request data
   * @param {string} data.email - User email
   * @returns {Promise<Object>} Response
   */
  requestPasswordReset: async (data) => {
    try {
      console.log('API requesting password reset for:', data.email);
      const response = await apiClient.post('/auth/password/forgot', data);
      console.log('API password reset request response:', response);
      return response.data;
    } catch (error) {
      console.error('API password reset request error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  },

  /**
   * Validate password reset token
   * @param {Object} data - Token validation data
   * @param {string} data.token - Reset token
   * @returns {Promise<Object>} Response with validation status
   */
  validateResetToken: async (data) => {
    try {
      console.log('API validating reset token:', data.token);
      const response = await apiClient.post('/auth/password/validate-token', data);
      console.log('API token validation response:', response);
      console.log('Raw response.data:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('API token validation error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      if (error.response?.data) {
        throw new Error(error.response.data.message || 'Token validation failed');
      }
      
      throw new Error('Unable to validate token. Please check your connection and try again.');
    }
  },

  /**
   * Reset password with token
   * @param {Object} data - Password reset data
   * @param {string} data.token - Reset token
   * @param {string} data.newPassword - New password
   * @returns {Promise<Object>} Response
   */
  resetPassword: async (data) => {
    try {
      console.log('API resetting password with token:', data.token);
      const response = await apiClient.post('/auth/password/reset', data);
      console.log('API password reset response:', response);
      return response.data;
    } catch (error) {
      console.error('API password reset error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      if (error.response?.data) {
        throw new Error(error.response.data.message || 'Password reset failed');
      }
      throw error;
    }
  }
};

export default authApi;