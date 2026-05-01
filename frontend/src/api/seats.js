import apiClient from './client';

/**
 * API service for seating-related operations
 * Handles seat layout and management
 */
const seatApi = {
  /**
   * Get seats for a specific theatre screen
   * @param {number|string} theatreId - Theatre ID
   * @param {number} screenNumber - Screen number
   * @returns {Promise<Array>} List of seats
   */
  getSeatsByTheatreAndScreen: async (theatreId, screenNumber) => {
    const response = await apiClient.get(`/admin/seats/theatre/${theatreId}/screen/${screenNumber}`);
    return response.data;
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
    const response = await apiClient.post(`/admin/seats/theatre/${theatreId}/screen/${screenNumber}/initialize`, {
      rows,
      seatsPerRow
    });
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
    const response = await apiClient.put(`/admin/seats/${seatId}`, {
      seatType,
      priceMultiplier
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
    const response = await apiClient.put(`/admin/seats/updateRow`, {
      theatreId,
      screenNumber,
      rowName,
      seatType,
      priceMultiplier
    });
    return response.data;
  },

  /**
   * Bulk update multiple seats (Admin only)
   * @param {Array<string>} seatIds - Array of seat IDs
   * @param {number|string} theatreId - Theatre ID
   * @param {number} screenNumber - Screen number
   * @param {string} seatType - New seat type
   * @param {number} priceMultiplier - Price multiplier for the seat type
   * @returns {Promise<Object>} Response with updated seats
   */
  bulkUpdateSeats: async (seatIds, theatreId, screenNumber, seatType, priceMultiplier) => {
    const response = await apiClient.put(`/admin/seats/bulkUpdate`, {
      selection: seatIds.join(','),
      theatreId,
      screenNumber,
      seatType,
      priceMultiplier
    });
    return response.data;
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

export default seatApi;