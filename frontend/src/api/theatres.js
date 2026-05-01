import apiClient from './client';

/**
 * Theatre API service
 * Handles all theatre-related operations
 */
const theatreApi = {
  /**
   * Get all theatres
   * @param {Object} params - Query parameters
   * @param {string} [params.search] - Search query
   * @returns {Promise<Array>} List of theatres
   */
  getAllTheatres: async (params = {}) => {
    const response = await apiClient.get('/admin/theatres', { params });
    return response.data;
  },

  /**
   * Get a theatre by ID
   * @param {number|string} id - Theatre ID
   * @returns {Promise<Object>} Theatre details
   */
  getTheatreById: async (id) => {
    const response = await apiClient.get(`/admin/theatres/${id}`);
    return response.data;
  },

  /**
   * Search theatres by name
   * @param {string} name - Theatre name to search for
   * @returns {Promise<Array>} List of theatres matching the search
   */
  searchTheatresByName: async (name) => {
    const response = await apiClient.get('/admin/theatres/search', { params: { name } });
    return response.data;
  },

  /**
   * Get theatres that show a specific movie
   * @param {number|string} movieId - Movie ID
   * @returns {Promise<Array>} List of theatres showing the movie
   */
  getTheatresByMovie: async (movieId) => {
    const response = await apiClient.get(`/admin/theatres/movie/${movieId}`);
    return response.data;
  },

  /**
   * Create a new theatre (Admin only)
   * @param {Object} theatreData - Theatre data
   * @returns {Promise<Object>} Created theatre
   */
  createTheatre: async (theatreData) => {
    const response = await apiClient.post('/admin/theatres', theatreData);
    return response.data;
  },

  /**
   * Update a theatre (Admin only)
   * @param {number|string} id - Theatre ID
   * @param {Object} theatreData - Updated theatre data
   * @returns {Promise<Object>} Updated theatre
   */
  updateTheatre: async (id, theatreData) => {
    const response = await apiClient.put(`/admin/theatres/${id}`, theatreData);
    return response.data;
  },

  /**
   * Delete a theatre (Admin only)
   * @param {number|string} id - Theatre ID
   * @returns {Promise<Object>} Response
   */
  deleteTheatre: async (id) => {
    const response = await apiClient.delete(`/admin/theatres/${id}`);
    return response.data;
  },

  /**
   * Get seating layout for a theatre's screen
   * @param {number|string} theatreId - Theatre ID
   * @param {number} screenNumber - Screen number
   * @returns {Promise<Object>} Seating layout
   */
  getSeatingLayout: async (theatreId, screenNumber) => {
    const response = await apiClient.get(`/admin/theatres/${theatreId}/screens/${screenNumber}/layout`);
    console.log(response.data);
    return response.data;
  },

  /**
   * Get seats for a specific theatre screen - FIXED VERSION
   * @param {number|string} theatreId - Theatre ID
   * @param {number} screenNumber - Screen number
   * @returns {Promise<Array>} List of seats
   */
  getSeatsByTheatreAndScreen: async (theatreId, screenNumber) => {
    try {
        const response = await apiClient.get(`/admin/seats/theatre/${theatreId}/screen/${screenNumber}`);
        console.log('Seats API response:', response);
        
        // Handle both wrapped and unwrapped responses
        const seats = response.data || response;
        
        // Ensure we return an array
        if (Array.isArray(seats)) {
          console.log('Returning', seats.length, 'seats for screen', screenNumber);
          return seats;
        }
        
        // If it's still wrapped in a data property
        if (seats.data && Array.isArray(seats.data)) {
          console.log('Returning', seats.data.length, 'seats for screen', screenNumber);
          return seats.data;
        }
        
        console.warn('Unexpected seats response format:', seats);
        return [];
    } catch (error) {
        console.error("Error fetching seats:", error);
        return []; // Return empty array instead of throwing
    }
  },

  /**
   * Get seat by ID
   * @param {number|string} id - Seat ID
   * @returns {Promise<Object>} Seat details
   */
  getSeatById: async (id) => {
    const response = await apiClient.get(`/admin/seats/${id}`);
    return response.data;
  },

  /**
   * Get seat map for a theatre screen
   * @param {number|string} theatreId - Theatre ID
   * @param {number} screenNumber - Screen number
   * @returns {Promise<Object>} Seat map with rows and seats
   */
  getSeatMapByTheatreAndScreen: async (theatreId, screenNumber) => {
    const response = await apiClient.get(`/admin/seats/theatre/${theatreId}/screen/${screenNumber}/map`);
    return response.data;
  },

  /**
   * Initialize seats for a theatre screen (Admin only)
   * @param {number|string} theatreId - Theatre ID
   * @param {number} screenNumber - Screen number
   * @param {number} rows - Number of rows
   * @param {number} seatsPerRow - Number of seats per row
   * @returns {Promise<Object>} Response with initialized seats
   */
  initializeSeatsForTheatre: async (theatreId, screenNumber, rows, seatsPerRow) => {
    // Using URL parameters instead of request body
    const response = await apiClient.post(
      `/admin/seats/theatre/${theatreId}/screen/${screenNumber}/initialize`, 
      null, // No request body
      { 
        params: { rows, seatsPerRow } // Send as URL parameters
      }
    );
    return response.data;
  },

  /**
   * Update seat type (Admin only)
   * @param {number|string} seatId - Seat ID
   * @param {string} seatType - New seat type
   * @param {number} priceMultiplier - Price multiplier for the seat type
   * @returns {Promise<Object>} Updated seat
   */
  updateSeatType: async (seatId, seatType, priceMultiplier) => {
    const response = await apiClient.put(`/admin/seats/${seatId}`, null, {
      params: {
        seatType,
        priceMultiplier
      }
    });
    return response.data;
  },

  /**
   * Update all seats in a row (Admin only)
   * @param {number|string} theatreId - Theatre ID
   * @param {number} screenNumber - Screen number
   * @param {string} rowName - Row name
   * @param {string} seatType - New seat type
   * @param {number} priceMultiplier - Price multiplier for the seat type
   * @returns {Promise<Object>} Response with updated seats
   */
  updateSeatRowType: async (theatreId, screenNumber, rowName, seatType, priceMultiplier) => {
    const response = await apiClient.put(`/admin/seats/updateRow`, null, {
      params: {
        theatreId,
        screenNumber,
        rowName,
        seatType,
        priceMultiplier
      }
    });
    return response.data;
  },

  /**
   * Bulk update multiple seats (Admin only) - FIXED VERSION
   * @param {number|string} theatreId - Theatre ID
   * @param {number} screenNumber - Screen number
   * @param {Array<number>} seatIds - Array of seat IDs
   * @param {string} seatType - New seat type
   * @param {number} priceMultiplier - Price multiplier for the seat type
   * @returns {Promise<Object>} Response with updated seats
   */
  bulkUpdateSeats: async (theatreId, screenNumber, seatIds, seatType, priceMultiplier) => {
    // Backend expects: theatreId, screenNumber, selection (comma-separated IDs), seatType, priceMultiplier
    const selection = seatIds.join(','); // Convert array to comma-separated string
    
    console.log('Bulk updating seats:', { theatreId, screenNumber, selection, seatType, priceMultiplier });
    
    const response = await apiClient.put(`/admin/seats/bulkUpdate`, null, {
      params: {
        theatreId,
        screenNumber,
        selection,
        seatType,
        priceMultiplier
      }
    });
    return response.data;
  },

  /**
   * Update seats for a theatre screen (Admin only)
   * This is a more general function that can be used by the hooks
   * @param {number|string} theatreId - Theatre ID
   * @param {number} screenNumber - Screen number
   * @param {Object} seatsData - Seats data for update
   * @returns {Promise<Object>} Response with updated seats
   */
  updateSeats: async (theatreId, screenNumber, seatsData) => {
    // If seatsData has seatIds property, use bulkUpdateSeats
    if (seatsData.seatIds && Array.isArray(seatsData.seatIds)) {
      return theatreApi.bulkUpdateSeats(
        theatreId,
        screenNumber,
        seatsData.seatIds,
        seatsData.seatType,
        seatsData.priceMultiplier
      );
    }

    // If seatsData has rowName property, update entire row
    if (seatsData.rowName) {
      return theatreApi.updateSeatRowType(
        theatreId,
        screenNumber,
        seatsData.rowName,
        seatsData.seatType,
        seatsData.priceMultiplier
      );
    }

    // Default to updating a single seat if only one ID is provided
    if (seatsData.seatIds && seatsData.seatIds.length === 1) {
      return theatreApi.updateSeatType(
        seatsData.seatIds[0],
        seatsData.seatType,
        seatsData.priceMultiplier
      );
    }

    throw new Error('Invalid seats data for update');
  },

  /**
   * Delete all seats in a theatre screen (Admin only)
   * @param {number|string} theatreId - Theatre ID
   * @param {number} screenNumber - Screen number
   * @returns {Promise<Object>} Response
   */
  deleteScreenSeats: async (theatreId, screenNumber) => {
    const response = await apiClient.delete(`/admin/seats/theatre/${theatreId}/screen/${screenNumber}`);
    return response.data;
  }
};

export default theatreApi;