// src/api/screenings.js - Updated with pagination support
import apiClient from './client';

/**
 * Screening API service with pagination support
 * Handles all screening-related operations
 */
const screeningApi = {
  /**
   * Get all screenings with optional filtering and pagination
   * @param {Object} params - Query parameters
   * @param {number} [params.movieId] - Filter by movie ID
   * @param {number} [params.theatreId] - Filter by theatre ID
   * @param {string} [params.date] - Filter by date (YYYY-MM-DD)
   * @param {string} [params.search] - Search query
   * @param {string} [params.sortBy='startTime'] - Sort field
   * @param {string} [params.sortOrder='asc'] - Sort order (asc/desc)
   * @param {number} [params.page=0] - Page number (0-based)
   * @param {number} [params.size=10] - Page size
   * @returns {Promise<Object>} Paginated screenings response
   */
  getScreenings: async (params = {}) => {
    try {
      const response = await apiClient.get('/screenings', { params });
      
      // Normalize response data - handle both paginated and non-paginated responses
      const responseData = response.data || {};
      
      // If it's a paginated response from admin endpoint
      if (responseData.screenings && Array.isArray(responseData.screenings)) {
        return {
          screenings: responseData.screenings,
          currentPage: responseData.currentPage || 0,
          totalPages: responseData.totalPages || 1,
          totalElements: responseData.totalElements || responseData.screenings.length,
          pageSize: responseData.pageSize || params.size || 10,
          hasNext: responseData.hasNext || false,
          hasPrevious: responseData.hasPrevious || false,
          isFirst: responseData.isFirst || true,
          isLast: responseData.isLast || true
        };
      }
      
      // If it's a simple array response
      if (Array.isArray(responseData)) {
        return {
          screenings: responseData,
          currentPage: 0,
          totalPages: 1,
          totalElements: responseData.length,
          pageSize: responseData.length,
          hasNext: false,
          hasPrevious: false,
          isFirst: true,
          isLast: true
        };
      }
      
      // Fallback
      return {
        screenings: [],
        currentPage: 0,
        totalPages: 0,
        totalElements: 0,
        pageSize: params.size || 10,
        hasNext: false,
        hasPrevious: false,
        isFirst: true,
        isLast: true
      };
    } catch (error) {
      console.error('Error fetching screenings:', error);
      throw error;
    }
  },

  /**
   * Get admin screenings with pagination (for admin panel)
   * @param {Object} params - Query parameters
   * @param {number} [params.movieId] - Filter by movie ID
   * @param {number} [params.theatreId] - Filter by theatre ID
   * @param {string} [params.date] - Filter by date (YYYY-MM-DD)
   * @param {string} [params.search] - Search query
   * @param {string} [params.sortBy='startTime'] - Sort field
   * @param {string} [params.sortOrder='asc'] - Sort order (asc/desc)
   * @param {number} [params.page=0] - Page number (0-based)
   * @param {number} [params.size=10] - Page size
   * @returns {Promise<Object>} Paginated screenings response with metadata
   */
  getAdminScreenings: async (params = {}) => {
    try {
      const response = await apiClient.get('/admin/screenings', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching admin screenings:', error);
      throw error;
    }
  },

  /**
   * Get a screening by ID
   * @param {number|string} id - Screening ID
   * @returns {Promise<Object>} Screening details
   */
  getScreeningById: async (id) => {
    try {
      const response = await apiClient.get(`/screenings/${id}`);
      
      // Normalize response data
      const responseData = response.data || {};
      
      // Check for different response formats
      const screeningData = responseData.data || responseData;
      
      // Ensure dates are in ISO format for consistency
      if (screeningData.startTime && typeof screeningData.startTime === 'string') {
        try {
          // Check if the date needs ISO formatting
          if (!screeningData.startTime.includes('T')) {
            const dateParts = screeningData.startTime.split(/[- :]/);
            if (dateParts.length >= 3) {
              const year = parseInt(dateParts[0]);
              const month = parseInt(dateParts[1]) - 1; // Month is 0-based in Date constructor
              const day = parseInt(dateParts[2]);
              const hour = dateParts.length > 3 ? parseInt(dateParts[3]) : 0;
              const minute = dateParts.length > 4 ? parseInt(dateParts[4]) : 0;
              
              const date = new Date(year, month, day, hour, minute);
              screeningData.startTime = date.toISOString();
            }
          }
        } catch (dateError) {
          console.error('Error normalizing date format:', dateError);
          // Keep the original format if conversion fails
        }
      }
      
      return screeningData;
    } catch (error) {
      console.error(`Error fetching screening with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get screenings for a movie with pagination
   * @param {number|string} movieId - Movie ID
   * @param {Object} [pagination] - Pagination options
   * @param {number} [pagination.page=0] - Page number
   * @param {number} [pagination.size=10] - Page size
   * @param {number} [days=7] - Number of days to include
   * @returns {Promise<Object>} Movie screenings grouped by date
   */
  getMovieScreenings: async (movieId, pagination = {}, days = 7) => {
    try {
      const params = {
        days,
        page: pagination.page || 0,
        size: pagination.size || 10
      };
      const response = await apiClient.get(`/movies/${movieId}/screenings`, { params });
      
      // Normalize response data
      const responseData = response.data || {};
      
      // Check for different response formats
      return responseData.data || responseData;
    } catch (error) {
      console.error(`Error fetching screenings for movie ${movieId}:`, error);
      return {};
    }
  },

  /**
   * Get screenings for a theatre with pagination
   * @param {number|string} theatreId - Theatre ID
   * @param {Object} [pagination] - Pagination options
   * @returns {Promise<Object>} Paginated theatre screenings
   */
  getTheatreScreenings: async (theatreId, pagination = {}) => {
    try {
      const params = {
        page: pagination.page || 0,
        size: pagination.size || 10
      };
      const response = await apiClient.get(`/theatres/${theatreId}/screenings`, { params });
      
      // Normalize response data
      const responseData = response.data || {};
      
      // Check for different response formats
      const screeningsData = responseData.data || responseData;
      
      return Array.isArray(screeningsData) ? screeningsData : 
             Array.isArray(screeningsData.screenings) ? screeningsData.screenings : [];
    } catch (error) {
      console.error(`Error fetching screenings for theatre ${theatreId}:`, error);
      return [];
    }
  },

  /**
   * Get screenings by date range with pagination
   * @param {Date|string} startDate - Start date
   * @param {Date|string} endDate - End date
   * @param {Object} [pagination] - Pagination options
   * @returns {Promise<Object>} Paginated screenings
   */
  getScreeningsByDateRange: async (startDate, endDate, pagination = {}) => {
    try {
      const formattedStartDate = formatDateParam(startDate);
      const formattedEndDate = formatDateParam(endDate);
      
      const params = {
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        page: pagination.page || 0,
        size: pagination.size || 10
      };
      
      const response = await apiClient.get('/screenings', { params });
      
      // Normalize response data
      const responseData = response.data || {};
      
      // Check for different response formats
      const screeningsData = responseData.data || responseData;
      
      return Array.isArray(screeningsData) ? screeningsData : 
             Array.isArray(screeningsData.screenings) ? screeningsData.screenings : [];
    } catch (error) {
      console.error('Error fetching screenings by date range:', error);
      return [];
    }
  },

  /**
   * Get upcoming screenings with pagination
   * @param {Object} [pagination] - Pagination options
   * @param {number} [days=7] - Number of days to include
   * @returns {Promise<Object>} Upcoming screenings grouped by date
   */
  getUpcomingScreenings: async (pagination = {}, days = 7) => {
    try {
      // Try the primary endpoint
      try {
        const params = {
          days,
          page: pagination.page || 0,
          size: pagination.size || 10
        };
        const response = await apiClient.get('/screenings/upcoming', { params });
        
        // Normalize response data
        const responseData = response.data || {};
        
        // Return the data if successful
        return responseData.data || responseData;
      } catch (primaryError) {
        console.warn('Primary upcoming screenings endpoint failed, trying alternative:', primaryError);
        
        // Try alternative endpoint (common in Spring Boot APIs)
        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0]; // YYYY-MM-DD
        
        const params = {
          startDate: formattedDate,
          days,
          page: pagination.page || 0,
          size: pagination.size || 10
        };
        
        const response = await apiClient.get('/screenings', { params });
        
        // Normalize response data
        const responseData = response.data || {};
        
        // Check for different response formats and convert to grouped by date format
        const screeningsData = responseData.data || responseData;
        
        if (Array.isArray(screeningsData)) {
          // Convert array of screenings to object grouped by date
          return screeningsData.reduce((acc, screening) => {
            if (screening.startTime) {
              const date = new Date(screening.startTime);
              const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD
              
              if (!acc[dateString]) {
                acc[dateString] = [];
              }
              
              acc[dateString].push(screening);
            }
            return acc;
          }, {});
        }
        
        return screeningsData;
      }
    } catch (error) {
      console.error('Error fetching upcoming screenings:', error);
      return {};
    }
  },

  /**
   * Get available seats for a screening
   * @param {number|string} screeningId - Screening ID
   * @returns {Promise<Array>} List of available seats
   */
  getScreeningSeats: async (screeningId) => {
    try {
      const response = await apiClient.get(`/screenings/${screeningId}/seats`);
      
      // Normalize response data
      const responseData = response.data || {};
      
      // Check for different response formats
      const seatsData = responseData.data || responseData;
      
      return Array.isArray(seatsData) ? seatsData : 
             Array.isArray(seatsData.seats) ? seatsData.seats : [];
    } catch (error) {
      console.error(`Error fetching seats for screening ${screeningId}:`, error);
      return [];
    }
  },

  /**
   * Get booked seats for a screening
   * @param {number|string} screeningId - Screening ID
   * @returns {Promise<Array>} List of booked seats
   */
  getBookedSeats: async (screeningId) => {
    try {
      // Try getting booked seats using the primary endpoint
      try {
        const response = await apiClient.get(`/screenings/${screeningId}/booked-seats`);
        
        // Normalize response data
        const responseData = response.data || {};
        
        // Check for different response formats
        const seatsData = responseData.data || responseData;
        
        return Array.isArray(seatsData) ? seatsData : 
               Array.isArray(seatsData.seats) ? seatsData.seats : 
               Array.isArray(seatsData.bookedSeats) ? seatsData.bookedSeats : [];
      } catch (primaryError) {
        // Try the alternative endpoint (sometimes used in Spring Boot APIs)
        console.warn('Primary booked seats endpoint failed, trying alternative:', primaryError);
        
        const response = await apiClient.get(`/bookings/screening/${screeningId}/seats`);
        
        // Normalize response data
        const responseData = response.data || {};
        
        // Check for different response formats
        const seatsData = responseData.data || responseData;
        
        return Array.isArray(seatsData) ? seatsData : 
               Array.isArray(seatsData.seats) ? seatsData.seats : 
               Array.isArray(seatsData.bookedSeats) ? seatsData.bookedSeats : [];
      }
    } catch (error) {
      console.error(`Error fetching booked seats for screening ${screeningId}:`, error);
      return [];
    }
  },

  /**
   * Get seating layout for a screening
   * @param {number|string} screeningId - Screening ID
   * @returns {Promise<Object>} Seating layout
   */
  getSeatingLayout: async (screeningId) => {
    try {
      // Try the primary endpoint
      try {
        const response = await apiClient.get(`/screenings/${screeningId}/layout`);
        
        // Normalize response data
        const responseData = response.data || {};
        
        // Check for different response formats
        const layoutData = responseData.data || responseData;
        
        return layoutData;
      } catch (primaryError) {
        console.warn('Primary layout endpoint failed, trying alternative:', primaryError);
        
        // Try alternative endpoint sometimes used in Spring Boot APIs
        const response = await apiClient.get(`/admin/seats/theatre/1/screen/1`);
        
        // This endpoint might return a different format that needs conversion
        const seatsData = response.data || [];
        
        // Convert to the expected layout format
        if (Array.isArray(seatsData) && seatsData.length > 0) {
          // Group seats by row
          const seatsByRow = seatsData.reduce((acc, seat) => {
            if (!acc[seat.rowName]) {
              acc[seat.rowName] = {
                seats: [],
                seatType: seat.seatType,
                priceMultiplier: seat.priceMultiplier || 1.0
              };
            }
            
            acc[seat.rowName].seats.push(seat);
            return acc;
          }, {});
          
          // Convert to layout format with rows
          const rows = Object.entries(seatsByRow).map(([name, rowData]) => ({
            name,
            seatsCount: rowData.seats.length,
            seatType: rowData.seatType,
            priceMultiplier: rowData.priceMultiplier
          }));
          
          return {
            rows,
            basePrice: 10.99 // Assume a default base price
          };
        }
        
        // If conversion fails, return a default layout
        return {
          rows: [
            { name: "A", seatsCount: 8, priceMultiplier: 1.0, seatType: "STANDARD" },
            { name: "B", seatsCount: 8, priceMultiplier: 1.0, seatType: "STANDARD" },
            { name: "C", seatsCount: 8, priceMultiplier: 1.2, seatType: "PREMIUM" }
          ],
          basePrice: 10.99
        };
      }
    } catch (error) {
      console.error(`Error fetching seating layout for screening ${screeningId}:`, error);
      
      // Return a default layout if all attempts fail
      return {
        rows: [
          { name: "A", seatsCount: 8, priceMultiplier: 1.0, seatType: "STANDARD" },
          { name: "B", seatsCount: 8, priceMultiplier: 1.0, seatType: "STANDARD" },
          { name: "C", seatsCount: 8, priceMultiplier: 1.2, seatType: "PREMIUM" }
        ],
        basePrice: 10.99
      };
    }
  },

  /**
   * Get all screening formats
   * @returns {Promise<Array>} List of screening formats
   */
  getScreeningFormats: async () => {
    try {
      const response = await apiClient.get('/admin/screenings/formats');
      
      // Normalize response data
      const responseData = response.data || {};
      
      // Check for different response formats
      const formatsData = responseData.data || responseData;
      
      // Return the list of formats, or a default list if the API fails
      return Array.isArray(formatsData) ? formatsData : ['STANDARD', 'IMAX', '3D', 'DOLBY'];
    } catch (error) {
      console.error('Error fetching screening formats:', error);
      return ['STANDARD', 'IMAX', '3D', 'DOLBY'];
    }
  },

  /**
   * Create a new screening (Admin only)
   * @param {Object} screeningData - Screening data
   * @returns {Promise<Object>} Created screening
   */
  createScreening: async (screeningData) => {
    try {
      const response = await apiClient.post('/admin/screenings', screeningData);
      return response.data;
    } catch (error) {
      console.error('Error creating screening:', error);
      throw error;
    }
  },

  /**
   * Update a screening (Admin only)
   * @param {number|string} id - Screening ID
   * @param {Object} screeningData - Updated screening data
   * @returns {Promise<Object>} Updated screening
   */
  updateScreening: async (id, screeningData) => {
    try {
      const response = await apiClient.put(`/admin/screenings/${id}`, screeningData);
      return response.data;
    } catch (error) {
      console.error(`Error updating screening ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a screening (Admin only)
   * @param {number|string} id - Screening ID
   * @returns {Promise<Object>} Response
   */
  deleteScreening: async (id) => {
    try {
      const response = await apiClient.delete(`/admin/screenings/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting screening ${id}:`, error);
      throw error;
    }
  }
};

/**
 * Helper function to format date parameters
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 */
function formatDateParam(date) {
  if (!date) return '';
  
  if (typeof date === 'string') {
    // Check if already in ISO format
    if (date.includes('T')) {
      return date;
    }
    return `${date}T00:00:00`;
  }
  
  return date.toISOString();
}

export default screeningApi;