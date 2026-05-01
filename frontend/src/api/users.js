import apiClient from './client';

/**
 * API service for user-related operations
 * Handles user management and profile operations
 */
const userApi = {
  /**
   * Get current user's profile
   * @returns {Promise<Object>} User profile
   */
  getCurrentUser: async () => {
    const response = await apiClient.get('/user/profile');
    return response.data;
  },

  /**
   * Update current user's profile
   * @param {Object} profileData - Updated profile data
   * @returns {Promise<Object>} Updated profile
   */
  updateProfile: async (profileData) => {
    const response = await apiClient.put('/user/profile', profileData);
    return response.data;
  },

  /**
   * Change current user's password
   * @param {Object} passwordData - Password change data
   * @param {string} passwordData.currentPassword - Current password
   * @param {string} passwordData.newPassword - New password
   * @returns {Promise<Object>} Response
   */
  changePassword: async (passwordData) => {
    const response = await apiClient.post('/user/change-password', passwordData);
    return response.data;
  },

  /**
   * Get all users (Admin only)
   * @param {Object} params - Query parameters
   * @param {string} [params.search] - Search query
   * @param {string} [params.role] - Filter by role
   * @param {string} [params.sortBy] - Sort field
   * @param {string} [params.sortOrder] - Sort order (asc/desc)
   * @param {number} [params.page] - Page number
   * @param {number} [params.size] - Page size
   * @returns {Promise<Array>} List of users
   */
  getAllUsers: async (params = {}) => {
    const response = await apiClient.get('/admin/users', { params });
    return response.data;
  },

  /**
   * Get a user by ID (Admin only)
   * @param {number|string} id - User ID
   * @returns {Promise<Object>} User details with bookings
   */
  getUserById: async (id) => {
    const response = await apiClient.get(`/admin/users/${id}`);
    return response.data;
  },

  /**
   * Create a new user (Admin only)
   * @param {Object} userData - User data
   * @param {string} userData.username - Username
   * @param {string} userData.email - Email
   * @param {string} userData.password - Password
   * @param {string} userData.firstName - First name
   * @param {string} userData.lastName - Last name
   * @param {string} [userData.phoneNumber] - Phone number
   * @param {string} [userData.role] - User role
   * @returns {Promise<Object>} Created user
   */
  createUser: async (userData) => {
    const response = await apiClient.post('/admin/users', userData);
    return response.data;
  },

  /**
   * Update a user (Admin only)
   * @param {number|string} id - User ID
   * @param {Object} userData - Updated user data
   * @returns {Promise<Object>} Updated user
   */
  updateUser: async (id, userData) => {
    const response = await apiClient.put(`/admin/users/${id}`, userData);
    return response.data;
  },

  /**
   * Delete a user (Admin only)
   * @param {number|string} id - User ID
   * @returns {Promise<Object>} Response
   */
  deleteUser: async (id) => {
    const response = await apiClient.delete(`/admin/users/${id}`);
    return response.data;
  },

  /**
   * Check if a username exists
   * @param {string} username - Username to check
   * @returns {Promise<Object>} Object with exists and available properties
   */
  existsByUsername: async (username) => {
    const response = await apiClient.get('/admin/users/check-username', { params: { username } });
    return response.data;
  },

  /**
   * Check if an email exists
   * @param {string} email - Email to check
   * @returns {Promise<Object>} Object with exists and available properties
   */
  existsByEmail: async (email) => {
    const response = await apiClient.get('/admin/users/check-email', { params: { email } });
    return response.data;
  },

  /**
   * Get user statistics
   * @returns {Promise<Object>} User statistics by role
   */
  getUserStats: async () => {
    const response = await apiClient.get('/admin/users/stats');
    return response.data;
  },

  /**
   * Update user role (Admin only)
   * @param {number|string} id - User ID
   * @param {string} role - New role
   * @returns {Promise<Object>} Updated user
   */
  updateUserRole: async (id, role) => {
    const response = await apiClient.put(`/admin/users/${id}/role`, { role });
    return response.data;
  },

  // Additional utility methods for form validation

  /**
   * Validate username availability (debounced check)
   * @param {string} username - Username to validate
   * @param {string} [currentUsername] - Current username (for edit forms)
   * @returns {Promise<boolean>} Whether username is available
   */
  validateUsername: async (username, currentUsername = null) => {
    if (!username || username.length < 3) {
      return false;
    }
    
    // If it's the same as current username, it's valid
    if (currentUsername && username === currentUsername) {
      return true;
    }
    
    try {
      const result = await userApi.existsByUsername(username);
      return !result.exists;
    } catch (error) {
      console.error('Error validating username:', error);
      return false;
    }
  },

  /**
   * Validate email availability (debounced check)
   * @param {string} email - Email to validate
   * @param {string} [currentEmail] - Current email (for edit forms)
   * @returns {Promise<boolean>} Whether email is available
   */
  validateEmail: async (email, currentEmail = null) => {
    if (!email || !email.includes('@')) {
      return false;
    }
    
    // If it's the same as current email, it's valid
    if (currentEmail && email === currentEmail) {
      return true;
    }
    
    try {
      const result = await userApi.existsByEmail(email);
      return !result.exists;
    } catch (error) {
      console.error('Error validating email:', error);
      return false;
    }
  },

  /**
   * Search users by query
   * @param {string} query - Search query
   * @param {Object} options - Additional options
   * @returns {Promise<Array>} Filtered users
   */
  searchUsers: async (query, options = {}) => {
    const params = {
      search: query,
      ...options
    };
    return userApi.getAllUsers(params);
  },

  /**
   * Get users by role
   * @param {string} role - User role
   * @param {Object} options - Additional options
   * @returns {Promise<Array>} Users with specified role
   */
  getUsersByRole: async (role, options = {}) => {
    const params = {
      role,
      ...options
    };
    return userApi.getAllUsers(params);
  },

  /**
   * Bulk operations for users (future enhancement)
   * @param {Array<number>} userIds - Array of user IDs
   * @param {string} action - Action to perform
   * @param {Object} data - Additional data for the action
   * @returns {Promise<Object>} Bulk operation result
   */
  bulkAction: async (userIds, action, data = {}) => {
    // This would be implemented when bulk operations are needed
    const response = await apiClient.post('/admin/users/bulk', {
      userIds,
      action,
      data
    });
    return response.data;
  },

  /**
   * Export users data (future enhancement)
   * @param {Object} params - Export parameters
   * @returns {Promise<Blob>} Export file
   */
  exportUsers: async (params = {}) => {
    const response = await apiClient.get('/admin/users/export', {
      params,
      responseType: 'blob'
    });
    return response.data;
  },

  /**
   * Get user activity log (future enhancement)
   * @param {number|string} id - User ID
   * @returns {Promise<Array>} User activity log
   */
  getUserActivity: async (id) => {
    const response = await apiClient.get(`/admin/users/${id}/activity`);
    return response.data;
  }
};

export default userApi;