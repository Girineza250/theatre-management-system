import apiClient from './client';

/**
 * Search API service
 * Handles all search-related operations
 */
const searchApi = {
  /**
   * Global search across all entities
   * @param {string} query - Search query
   * @param {number} [limit=3] - Number of results per category
   * @returns {Promise<Object>} Search results
   */
  globalSearch: async (query, limit = 3) => {
    try {
      const response = await apiClient.get('/search', {
        params: { query, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error in global search:', error);
      throw error;
    }
  },

  /**
   * Search movies
   * @param {string} query - Search query
   * @param {number} [limit=10] - Number of results
   * @returns {Promise<Object>} Movie search results
   */
  searchMovies: async (query, limit = 10) => {
    try {
      const response = await apiClient.get('/search/movies', {
        params: { query, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching movies:', error);
      throw error;
    }
  },

  /**
   * Search theatres
   * @param {string} query - Search query
   * @param {number} [limit=10] - Number of results
   * @returns {Promise<Object>} Theatre search results
   */
  searchTheatres: async (query, limit = 10) => {
    try {
      const response = await apiClient.get('/search/theatres', {
        params: { query, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching theatres:', error);
      throw error;
    }
  },

  /**
   * Search screenings
   * @param {string} query - Search query
   * @param {number} [limit=10] - Number of results
   * @returns {Promise<Object>} Screening search results
   */
  searchScreenings: async (query, limit = 10) => {
    try {
      const response = await apiClient.get('/search/screenings', {
        params: { query, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching screenings:', error);
      throw error;
    }
  },

  /**
   * Search users (Admin only)
   * @param {string} query - Search query
   * @param {number} [limit=10] - Number of results
   * @returns {Promise<Object>} User search results
   */
  searchUsers: async (query, limit = 10) => {
    try {
      const response = await apiClient.get('/search/users', {
        params: { query, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  },

  /**
   * Get search suggestions
   * @param {string} query - Search query
   * @param {number} [limit=5] - Number of suggestions
   * @returns {Promise<Object>} Search suggestions
   */
  getSearchSuggestions: async (query, limit = 5) => {
    try {
      const response = await apiClient.get('/search/suggestions', {
        params: { query, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting search suggestions:', error);
      return { movieTitles: [], theatreNames: [] };
    }
  }
};

export default searchApi;
