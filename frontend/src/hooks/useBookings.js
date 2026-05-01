// src/hooks/useBookings.js - FIXED VERSION with filter support
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useToast } from '@contexts/ToastContext';
import bookingApi from '@api/bookings';

/**
 * Custom hook for managing bookings
 * Centralizes all booking-related data fetching and mutations with improved error handling
 */
export const useBookings = () => {
  const queryClient = useQueryClient();
  const { showError } = useToast();

  /**
   * Get user's bookings
   */
  const useGetUserBookings = (options = {}) => {
    return useQuery({
      queryKey: ['user-bookings'],
      queryFn: async () => {
        try {
          const data = await bookingApi.getUserBookings();
          return Array.isArray(data) ? data : [];
        } catch (error) {
          console.error('Error fetching user bookings:', error);
          return []; // Return empty array instead of throwing
        }
      },
      ...options
    });
  };
  
  /**
   * Get all bookings (Admin only) - FIXED with filter support
   */
  const useGetAllBookings = (filters = {}, options = {}) => {
    return useQuery({
      queryKey: ['admin-bookings', filters],  // ✅ Include filters in query key
      queryFn: async () => {
        try {
          console.log('Fetching bookings with filters:', filters);
          
          // Build query string from filters
          const params = new URLSearchParams();
          if (filters.status) params.append('status', filters.status);
          if (filters.fromDate) params.append('fromDate', filters.fromDate);
          if (filters.toDate) params.append('toDate', filters.toDate);
          if (filters.movieId) params.append('movieId', filters.movieId);
          if (filters.theatreId) params.append('theatreId', filters.theatreId);
          
          const queryString = params.toString();
          const url = `/api/admin/bookings${queryString ? `?${queryString}` : ''}`;
          
          console.log('Fetching from URL:', url);
          
          // Fetch with filters
          const response = await fetch(`http://localhost:8084${url}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const result = await response.json();
          const data = result.data || result;
          
          console.log('Fetched bookings:', Array.isArray(data) ? data.length : 0);
          
          return Array.isArray(data) ? data : [];
          
        } catch (error) {
          console.error('Error in useGetAllBookings:', error);
          return []; // Return empty array instead of throwing
        }
      },
      staleTime: 1000 * 30, // 30 seconds (shorter to see filter changes faster)
      cacheTime: 1000 * 60 * 5, // 5 minutes
      ...options
    });
  };

  /**
   * Get a booking by ID
   */
  const useGetBooking = (id, options = {}) => {
    return useQuery({
      queryKey: ['booking', id],
      queryFn: async () => {
        try {
          return await bookingApi.getBookingById(id);
        } catch (error) {
          console.error(`Error fetching booking ${id}:`, error);
          throw error;
        }
      },
      enabled: !!id,
      ...options
    });
  };

  /**
   * Get booked seats for a screening
   */
  const useGetBookedSeats = (screeningId, options = {}) => {
    return useQuery({
      queryKey: ['booked-seats', screeningId],
      queryFn: async () => {
        try {
          return await bookingApi.getBookedSeatsByScreeningId(screeningId);
        } catch (error) {
          console.error(`Error fetching booked seats for screening ${screeningId}:`, error);
          return [];
        }
      },
      enabled: !!screeningId,
      ...options
    });
  };

  /**
   * Get seating layout for a screening
   */
  const useGetSeatingLayout = (screeningId, options = {}) => {
    return useQuery({
      queryKey: ['seating-layout', screeningId],
      queryFn: async () => {
        try {
          return await bookingApi.getSeatingLayout(screeningId);
        } catch (error) {
          console.error(`Error fetching seating layout for screening ${screeningId}:`, error);
          // Return default layout if API fails
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
      enabled: !!screeningId,
      ...options
    });
  };

  /**
   * Calculate total price for selected seats
   */
  const useCalculatePrice = (screeningId, selectedSeats, options = {}) => {
    return useQuery({
      queryKey: ['calculate-price', screeningId, selectedSeats],
      queryFn: async () => {
        try {
          // Check if we can calculate the price ourselves based on the layout
          const layoutQuery = queryClient.getQueryData(['seating-layout', screeningId]);
          
          if (layoutQuery && layoutQuery.rows && layoutQuery.basePrice) {
            // Simple price calculation without API call
            let totalPrice = 0;
            
            selectedSeats.forEach(seat => {
              const rowName = seat.charAt(0);
              const row = layoutQuery.rows.find(r => r.name === rowName);
              
              if (row) {
                totalPrice += layoutQuery.basePrice * (row.priceMultiplier || 1.0);
              } else {
                totalPrice += layoutQuery.basePrice;
              }
            });
            
            return {
              basePrice: layoutQuery.basePrice,
              totalPrice,
              seats: selectedSeats
            };
          }
          
          // Fall back to API call if we can't calculate ourselves
          return await bookingApi.calculatePrice(screeningId, selectedSeats);
        } catch (error) {
          console.error(`Error calculating price for screening ${screeningId}:`, error);
          
          // Always return a valid price object even if the API fails
          const totalPrice = selectedSeats.length * 10.99;
          
          return {
            basePrice: 10.99,
            totalPrice,
            seats: selectedSeats
          };
        }
      },
      enabled: !!screeningId && Array.isArray(selectedSeats) && selectedSeats.length > 0,
      ...options
    });
  };

  /**
   * Create a new booking
   */
  const useCreateBooking = (options = {}) => {
    return useMutation({
      mutationFn: async (data) => {
        try {
          // Ensure we have the required data
          if (!data.screeningId) {
            throw new Error('Screening ID is required');
          }
          
          if (!data.selectedSeats || data.selectedSeats.length === 0) {
            throw new Error('Selected seats are required');
          }
          
          if (!data.paymentMethod) {
            throw new Error('Payment method is required');
          }
          
          // Use the bookingApi which handles token validation internally
          return await bookingApi.createBooking(
            data.screeningId, 
            data.selectedSeats, 
            data.paymentMethod
          );
        } catch (error) {
          console.error('Error creating booking:', error);
          throw error;
        }
      },
      onSuccess: () => {
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: ['user-bookings'] });
        queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      },
      onError: (error) => {
        showError(error.message || 'Failed to create booking. Please try again.');
      },
      ...options
    });
  };

  /**
   * Cancel a booking
   */
  const useCancelBooking = (options = {}) => {
    return useMutation({
      mutationFn: async (id) => {
        try {
          return await bookingApi.cancelBooking(id);
        } catch (error) {
          console.error(`Error cancelling booking ${id}:`, error);
          throw error;
        }
      },
      onSuccess: (_, id) => {
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: ['user-bookings'] });
        queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
        queryClient.invalidateQueries({ queryKey: ['booking', id] });
      },
      onError: (error) => {
        showError(error.message || 'Failed to cancel booking. Please try again.');
      },
      ...options
    });
  };

  /**
   * Update booking status (Admin only)
   */
  const useUpdateBookingStatus = (options = {}) => {
    return useMutation({
      mutationFn: async ({ id, status }) => {
        try {
          const response = await fetch(`http://localhost:8084/api/admin/bookings/${id}/status`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            },
            body: JSON.stringify({ status })
          });
          
          if (!response.ok) {
            throw new Error('Failed to update booking status');
          }
          
          return await response.json();
        } catch (error) {
          console.error(`Error updating booking ${id} status:`, error);
          throw error;
        }
      },
      onSuccess: () => {
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
        queryClient.invalidateQueries({ queryKey: ['user-bookings'] });
      },
      ...options
    });
  };

  /**
   * Delete booking (Admin only)
   */
  const useDeleteBooking = (options = {}) => {
    return useMutation({
      mutationFn: async (id) => {
        try {
          const response = await fetch(`http://localhost:8084/api/admin/bookings/${id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            }
          });
          
          if (!response.ok) {
            throw new Error('Failed to delete booking');
          }
          
          return await response.json();
        } catch (error) {
          console.error(`Error deleting booking ${id}:`, error);
          throw error;
        }
      },
      onSuccess: () => {
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
        queryClient.invalidateQueries({ queryKey: ['user-bookings'] });
      },
      ...options
    });
  };

  /**
   * Get booking statistics by status
   */
  const useGetBookingStats = (options = {}) => {
    return useQuery({
      queryKey: ['booking-stats'],
      queryFn: async () => {
        try {
          // Try to get the stats from the API first
          try {
            const data = await bookingApi.getBookingStats();
            return data;
          } catch (error) {
            // If API fails, calculate from all bookings
            console.warn('Booking stats endpoint failed, calculating manually:', error);
            
            const bookings = await bookingApi.getAllBookings();
            
            if (!Array.isArray(bookings)) return { completed: 0, pending: 0, cancelled: 0 };
            
            const completed = bookings.filter(b => b.paymentStatus === 'COMPLETED').length;
            const pending = bookings.filter(b => b.paymentStatus === 'PENDING').length;
            const cancelled = bookings.filter(b => b.paymentStatus === 'CANCELLED').length;
            
            return { completed, pending, cancelled };
          }
        } catch (error) {
          console.error('Error getting booking stats:', error);
          return { completed: 0, pending: 0, cancelled: 0 };
        }
      },
      ...options
    });
  };

  // Return all hooks
  return {
    useGetUserBookings,
    useGetAllBookings,
    useGetBooking,
    useGetBookedSeats,
    useGetSeatingLayout,
    useCalculatePrice,
    useCreateBooking,
    useCancelBooking,
    useUpdateBookingStatus,
    useDeleteBooking,
    useGetBookingStats
  };
};

export default useBookings;