// src/hooks/useTheatres.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import theatreApi from '@api/theatres';

/**
 * Custom hook for managing theatres
 * Centralizes all theatre-related data fetching and mutations
 */
export const useTheatres = () => {
  const queryClient = useQueryClient();

  /**
   * Get all theatres
   */
  const useGetTheatres = (options = {}) => {
    return useQuery({
      queryKey: ['theatres'],
      queryFn: () => theatreApi.getAllTheatres(),
      ...options
    });
  };

  /**
   * Get a theatre by ID
   */
  const useGetTheatre = (id, options = {}) => {
    return useQuery({
      queryKey: ['theatres', id],
      queryFn: () => theatreApi.getTheatreById(id),
      enabled: !!id,
      ...options
    });
  };

  /**
   * Search theatres by name
   */
  const useSearchTheatres = (name, options = {}) => {
    return useQuery({
      queryKey: ['theatres', 'search', name],
      queryFn: () => theatreApi.searchTheatresByName(name),
      enabled: !!name,
      ...options
    });
  };

  /**
   * Create a new theatre
   */
  const useCreateTheatre = (options = {}) => {
    return useMutation({
      mutationFn: (theatreData) => theatreApi.createTheatre(theatreData),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['theatres'] });
      },
      ...options
    });
  };

  /**
   * Update a theatre
   */
  const useUpdateTheatre = (options = {}) => {
    return useMutation({
      mutationFn: ({ id, theatreData }) => theatreApi.updateTheatre(id, theatreData),
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries({ queryKey: ['theatres'] });
        queryClient.invalidateQueries({ queryKey: ['theatres', variables.id] });
      },
      ...options
    });
  };

  /**
   * Delete a theatre
   */
  const useDeleteTheatre = (options = {}) => {
    return useMutation({
      mutationFn: (id) => theatreApi.deleteTheatre(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['theatres'] });
      },
      ...options
    });
  };

  /**
   * Get theatre seats for a specific screen
   */
  const useGetTheatreSeats = (theatreId, screenNumber, options = {}) => {
    return useQuery({
      queryKey: ['theatres', theatreId, 'screens', screenNumber, 'seats'],
      queryFn: () => theatreApi.getSeatsByTheatreAndScreen(theatreId, screenNumber),
      enabled: !!theatreId && !!screenNumber,
      ...options
    });
  };

  /**
   * Get seating layout for a theatre screen
   */
  const useGetSeatingLayout = (theatreId, screenNumber, options = {}) => {
    return useQuery({
      queryKey: ['theatres', theatreId, 'screens', screenNumber, 'layout'],
      queryFn: () => theatreApi.getSeatingLayout(theatreId, screenNumber),
      enabled: !!theatreId && !!screenNumber,
      ...options
    });
  };

  /**
   * Initialize seats for a theatre screen
   */
  const useInitializeSeats = (options = {}) => {
    return useMutation({
      mutationFn: ({ theatreId, screenNumber, rows, seatsPerRow }) => 
        theatreApi.initializeSeatsForTheatre(theatreId, screenNumber, rows, seatsPerRow),
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries({ 
          queryKey: ['theatres', variables.theatreId, 'screens', variables.screenNumber, 'seats'] 
        });
      },
      ...options
    });
  };

  /**
   * Update a single seat
   */
  const useUpdateSeat = (options = {}) => {
    return useMutation({
      mutationFn: ({ seatId, seatType, priceMultiplier }) => 
        theatreApi.updateSeatType(seatId, seatType, priceMultiplier),
      onSuccess: () => {
        // Since we don't know which theatre/screen this belongs to from just the seatId,
        // we could either store that info or just invalidate all seats queries
        queryClient.invalidateQueries({ 
          queryKey: ['theatres', , , 'screens', , 'seats'],
          predicate: (query) => query.queryKey[0] === 'theatres' && query.queryKey[3] === 'screens' && query.queryKey[5] === 'seats'
        });
      },
      ...options
    });
  };

  /**
   * Update a row of seats
   */
  const useUpdateSeatRow = (options = {}) => {
    return useMutation({
      mutationFn: ({ theatreId, screenNumber, rowName, seatType, priceMultiplier }) => 
        theatreApi.updateSeatRowType(theatreId, screenNumber, rowName, seatType, priceMultiplier),
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries({ 
          queryKey: ['theatres', variables.theatreId, 'screens', variables.screenNumber, 'seats'] 
        });
      },
      ...options
    });
  };

  /**
   * Bulk update multiple seats
   */
  const useBulkUpdateSeats = (options = {}) => {
    return useMutation({
      mutationFn: ({ seatIds, seatType, priceMultiplier }) => 
        theatreApi.bulkUpdateSeats(seatIds, seatType, priceMultiplier),
      onSuccess: () => {
        // Since we don't know which theatre/screen these seats belong to,
        // we could either store that info or just invalidate all seats queries
        queryClient.invalidateQueries({ 
          queryKey: ['theatres', , , 'screens', , 'seats'],
          predicate: (query) => query.queryKey[0] === 'theatres' && query.queryKey[3] === 'screens' && query.queryKey[5] === 'seats'
        });
      },
      ...options
    });
  };

  /**
   * Generic update seats mutation
   */
  const useUpdateTheatreSeats = (options = {}) => {
    return useMutation({
      mutationFn: ({ theatreId, screenNumber, seatsData }) => 
        theatreApi.updateSeats(theatreId, screenNumber, seatsData),
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries({ 
          queryKey: ['theatres', variables.theatreId, 'screens', variables.screenNumber, 'seats'] 
        });
      },
      ...options
    });
  };

  /**
   * Delete all seats for a screen
   */
  const useDeleteScreenSeats = (options = {}) => {
    return useMutation({
      mutationFn: ({ theatreId, screenNumber }) => 
        theatreApi.deleteScreenSeats(theatreId, screenNumber),
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries({ 
          queryKey: ['theatres', variables.theatreId, 'screens', variables.screenNumber, 'seats'] 
        });
      },
      ...options
    });
  };

  return {
    useGetTheatres,
    useGetTheatre,
    useSearchTheatres,
    useCreateTheatre,
    useUpdateTheatre,
    useDeleteTheatre,
    useGetTheatreSeats,
    useGetSeatingLayout,
    useInitializeSeats,
    useUpdateSeat,
    useUpdateSeatRow,
    useBulkUpdateSeats,
    useUpdateTheatreSeats,
    useDeleteScreenSeats
  };
};

// Individual exports for easier imports
export const useGetTheatres = (options = {}) => useTheatres().useGetTheatres(options);
export const useGetTheatre = (id, options = {}) => useTheatres().useGetTheatre(id, options);
export const useSearchTheatres = (name, options = {}) => useTheatres().useSearchTheatres(name, options);
export const useCreateTheatre = (options = {}) => useTheatres().useCreateTheatre(options);
export const useUpdateTheatre = (options = {}) => useTheatres().useUpdateTheatre(options);
export const useDeleteTheatre = (options = {}) => useTheatres().useDeleteTheatre(options);
export const useGetTheatreSeats = (theatreId, screenNumber, options = {}) => useTheatres().useGetTheatreSeats(theatreId, screenNumber, options);
export const useGetSeatingLayout = (theatreId, screenNumber, options = {}) => useTheatres().useGetSeatingLayout(theatreId, screenNumber, options);
export const useInitializeSeats = (options = {}) => useTheatres().useInitializeSeats(options);
export const useUpdateSeat = (options = {}) => useTheatres().useUpdateSeat(options);
export const useUpdateSeatRow = (options = {}) => useTheatres().useUpdateSeatRow(options);
export const useBulkUpdateSeats = (options = {}) => useTheatres().useBulkUpdateSeats(options);
export const useUpdateTheatreSeats = (options = {}) => useTheatres().useUpdateTheatreSeats(options);
export const useDeleteScreenSeats = (options = {}) => useTheatres().useDeleteScreenSeats(options);

export default useTheatres;