import apiClient from './client';

/**
 * Movie API service with pagination support
 * Handles all movie-related operations
 */
const movieApi = {
  /**
   * Get all movies with optional filtering and pagination
   * @param {Object} params - Query parameters
   * @param {string} [params.query] - Search query
   * @param {string} [params.genre] - Filter by genre
   * @param {string} [params.status] - Filter by status (NOW_PLAYING, UPCOMING)
   * @param {string} [params.sortBy='title'] - Sort field
   * @param {string} [params.sortOrder='asc'] - Sort order (asc/desc)
   * @param {number} [params.page=0] - Page number (0-based)
   * @param {number} [params.size=10] - Page size
   * @returns {Promise<Object>} Paginated movies response
   */
  getMovies: async (params = {}) => {
    const response = await apiClient.get('/movies', { params });
    return response.data;
  },

  /**
   * Get admin movies with pagination (for admin panel)
   * @param {Object} params - Query parameters
   * @param {string} [params.search] - Search query
   * @param {string} [params.genre] - Filter by genre
   * @param {string} [params.sortBy='title'] - Sort field
   * @param {string} [params.sortOrder='asc'] - Sort order (asc/desc)
   * @param {number} [params.page=0] - Page number (0-based)
   * @param {number} [params.size=10] - Page size
   * @returns {Promise<Object>} Paginated movies response with metadata
   */
  getAdminMovies: async (params = {}) => {
    const response = await apiClient.get('/admin/movies', { params });
    return response.data;
  },

  /**
   * Get a movie by ID
   * @param {number|string} id - Movie ID
   * @returns {Promise<Object>} Movie details
   */
  getMovieById: async (id) => {
    const response = await apiClient.get(`/movies/${id}`);
    return response.data;
  },

  /**
   * Search movies by title with pagination
   * @param {string} query - Search query
   * @param {Object} [pagination] - Pagination options
   * @param {number} [pagination.page=0] - Page number
   * @param {number} [pagination.size=10] - Page size
   * @returns {Promise<Object>} Paginated search results
   */
  searchMovies: async (query, pagination = {}) => {
    const params = {
      query,
      page: pagination.page || 0,
      size: pagination.size || 10
    };
    const response = await apiClient.get('/movies/search', { params });
    return response.data;
  },

  /**
   * Get movies by genre with pagination
   * @param {string} genre - Genre name
   * @param {Object} [pagination] - Pagination options
   * @returns {Promise<Object>} Paginated movies by genre
   */
  getMoviesByGenre: async (genre, pagination = {}) => {
    const params = {
      genre,
      page: pagination.page || 0,
      size: pagination.size || 10
    };
    const response = await apiClient.get(`/movies/genre/${genre}`, { params });
    return response.data;
  },

  /**
   * Get movies by IDs (no pagination needed)
   * @param {Set|Array} ids - Set or array of movie IDs
   * @returns {Promise<Array>} List of movies
   */
  getMoviesByIds: async (ids) => {
    if (!ids || ids.size === 0 || ids.length === 0) {
      return [];
    }
    
    const idsArray = Array.from(ids);
    const response = await apiClient.get('/movies/batch', { params: { ids: idsArray.join(',') } });
    return response.data;
  },

  /**
   * Get upcoming movies with pagination
   * @param {Object} [pagination] - Pagination options
   * @returns {Promise<Object>} Paginated upcoming movies
   */
  getUpcomingMovies: async (pagination = {}) => {
    const params = {
      status: 'UPCOMING',
      page: pagination.page || 0,
      size: pagination.size || 10
    };
    const response = await apiClient.get('/movies', { params });
    return response.data;
  },

  /**
   * Get now playing movies with pagination
   * @param {Object} [pagination] - Pagination options
   * @returns {Promise<Object>} Paginated now playing movies
   */
  getNowPlayingMovies: async (pagination = {}) => {
    const params = {
      status: 'NOW_PLAYING',
      page: pagination.page || 0,
      size: pagination.size || 10
    };
    const response = await apiClient.get('/movies', { params });
    return response.data;
  },

  /**
   * Get all movie genres
   * @returns {Promise<Array>} List of genres
   */
  getGenres: async () => {
    const response = await apiClient.get('/movies/genres');
    return response.data;
  },

  /**
   * Create a new movie (Admin only)
   * @param {Object} movieData - Movie data
   * @returns {Promise<Object>} Created movie
   */
  createMovie: async (movieData) => {
    const response = await apiClient.post('/movies', movieData);
    return response.data;
  },

  /**
   * Update a movie (Admin only)
   * @param {number|string} id - Movie ID
   * @param {Object} movieData - Updated movie data
   * @returns {Promise<Object>} Updated movie
   */
  updateMovie: async (id, movieData) => {
    const response = await apiClient.put(`/movies/${id}`, movieData);
    return response.data;
  },

  /**
   * Delete a movie (Admin only)
   * @param {number|string} id - Movie ID
   * @returns {Promise<Object>} Response
   */
  deleteMovie: async (id) => {
    const response = await apiClient.delete(`/movies/${id}`);
    return response.data;
  },

  /**
   * Get screenings for a movie
   * @param {number|string} id - Movie ID
   * @param {number} [days=7] - Number of days to include
   * @returns {Promise<Object>} Movie screenings
   */
  getMovieScreenings: async (id, days = 7) => {
    const response = await apiClient.get(`/movies/${id}/screenings`, { params: { days } });
    return response.data;
  }
};

export default movieApi;