import apiClient from './client';

/**
 * API service for dashboard data
 * Provides statistics and metrics for the admin dashboard
 */
const dashboardApi = {
  /**
   * Get dashboard summary data
   * @returns {Promise<Object>} Dashboard summary with counts and statistics
   */
  getDashboardSummary: async () => {
    const response = await apiClient.get('/admin/dashboard');
    return response.data;
  },

  /**
   * Get revenue statistics for a specific period
   * @param {string} period - Period to get stats for (daily, weekly, monthly, yearly)
   * @param {number} [limit=7] - Number of data points to return
   * @returns {Promise<Object>} Revenue statistics
   */
  getRevenueStats: async (period = 'daily', limit = 7) => {
    const response = await apiClient.get('/admin/dashboard/revenue', {
      params: { period, limit }
    });
    return response.data;
  },

  /**
   * Get booking statistics by status
   * @returns {Promise<Object>} Booking statistics by status
   */
  getBookingStats: async () => {
    const response = await apiClient.get('/admin/dashboard/bookings/stats');
    return response.data;
  },

  /**
   * Get popular movies (most booked)
   * @param {number} [limit=5] - Number of movies to return
   * @returns {Promise<Array>} List of popular movies with booking counts
   */
  getPopularMovies: async (limit = 5) => {
    const response = await apiClient.get('/admin/dashboard/movies/popular', {
      params: { limit }
    });
    return response.data;
  },

  /**
   * Get recent bookings
   * @param {number} [limit=5] - Number of bookings to return
   * @returns {Promise<Array>} List of recent bookings
   */
  getRecentBookings: async (limit = 5) => {
    const response = await apiClient.get('/admin/dashboard/bookings/recent', {
      params: { limit }
    });
    return response.data;
  },

  /**
   * Get new users
   * @param {number} [limit=5] - Number of users to return
   * @returns {Promise<Array>} List of recently created users
   */
  getNewUsers: async (limit = 5) => {
    const response = await apiClient.get('/admin/dashboard/users/new', {
      params: { limit }
    });
    return response.data;
  }
};

export default dashboardApi;