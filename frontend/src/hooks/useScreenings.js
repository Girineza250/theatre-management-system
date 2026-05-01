// src/hooks/useScreenings.js - Updated with pagination support
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import screeningApi from '@api/screenings';

/**
 * Custom hook for managing screenings with pagination support
 * Centralizes all screening-related data fetching and mutations
 */
export const useScreenings = () => {
  const queryClient = useQueryClient();

  /**
   * Get paginated screenings for admin panel
   */
  const useGetAdminScreenings = (params = {}) => {
    return useQuery({
      queryKey: ['admin-screenings', params],
      queryFn: () => screeningApi.getAdminScreenings(params),
      keepPreviousData: true, // Keep previous data while loading new page
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    });
  };

  /**
   * Get all screenings with optional filtering
   */
  const useGetScreenings = (params = {}, options = {}) => {
    return useQuery({
      queryKey: ['screenings', params],
      queryFn: () => screeningApi.getScreenings(params),
      staleTime: 5 * 60 * 1000,
      ...options
    });
  };

  /**
   * Get a screening by ID
   */
  const useGetScreening = (id, options = {}) => {
    return useQuery({
      queryKey: ['screening', id],
      queryFn: () => screeningApi.getScreeningById(id),
      enabled: !!id,
      staleTime: 10 * 60 * 1000,
      ...options
    });
  };

  /**
   * Get screenings for a movie with pagination
   */
  const useGetMovieScreenings = (movieId, pagination = {}, days = 7, options = {}) => {
    return useQuery({
      queryKey: ['movie-screenings', movieId, pagination, days],
      queryFn: () => screeningApi.getMovieScreenings(movieId, pagination, days),
      enabled: !!movieId,
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000,
      ...options
    });
  };

  /**
   * Get screenings for a theatre with pagination
   */
  const useGetTheatreScreenings = (theatreId, pagination = {}, options = {}) => {
    return useQuery({
      queryKey: ['theatre-screenings', theatreId, pagination],
      queryFn: () => screeningApi.getTheatreScreenings(theatreId, pagination),
      enabled: !!theatreId,
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000,
      ...options
    });
  };

  /**
   * Get screenings by date range with pagination
   */
  const useGetScreeningsByDateRange = (startDate, endDate, pagination = {}, options = {}) => {
    return useQuery({
      queryKey: ['screenings-by-date', startDate, endDate, pagination],
      queryFn: () => screeningApi.getScreeningsByDateRange(startDate, endDate, pagination),
      enabled: !!startDate && !!endDate,
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000,
      ...options
    });
  };

  /**
   * Get upcoming screenings with pagination (next 7 days by default)
   */
  const useGetUpcomingScreenings = (pagination = {}, days = 7, options = {}) => {
    return useQuery({
      queryKey: ['upcoming-screenings', pagination, days],
      queryFn: () => screeningApi.getUpcomingScreenings(pagination, days),
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000,
      ...options
    });
  };

  /**
   * Search screenings with pagination
   */
  const useSearchScreenings = (query, pagination = {}, options = {}) => {
    return useQuery({
      queryKey: ['screenings-search', query, pagination],
      queryFn: () => screeningApi.getScreenings({ search: query, ...pagination }),
      enabled: !!query && query.length >= 2,
      keepPreviousData: true,
      staleTime: 2 * 60 * 1000, // 2 minutes
      ...options
    });
  };

  /**
   * Get available seats for a screening
   */
  const useGetScreeningSeats = (screeningId, options = {}) => {
    return useQuery({
      queryKey: ['screening-seats', screeningId],
      queryFn: () => screeningApi.getScreeningSeats(screeningId),
      enabled: !!screeningId,
      staleTime: 30 * 1000, // 30 seconds for seat availability
      ...options
    });
  };

  /**
   * Get booked seats for a screening
   */
  const useGetBookedSeats = (screeningId, options = {}) => {
    return useQuery({
      queryKey: ['booked-seats', screeningId],
      queryFn: () => screeningApi.getBookedSeats(screeningId),
      enabled: !!screeningId,
      staleTime: 30 * 1000, // 30 seconds for seat availability
      ...options
    });
  };

  /**
   * Get seating layout for a screening
   */
  const useGetSeatingLayout = (screeningId, options = {}) => {
    return useQuery({
      queryKey: ['seating-layout', screeningId],
      queryFn: () => screeningApi.getSeatingLayout(screeningId),
      enabled: !!screeningId,
      staleTime: 10 * 60 * 1000, // 10 minutes for layout
      ...options
    });
  };

  /**
   * Get screening formats
   */
  const useGetScreeningFormats = (options = {}) => {
    return useQuery({
      queryKey: ['screening-formats'],
      queryFn: screeningApi.getScreeningFormats,
      staleTime: 30 * 60 * 1000, // 30 minutes
      cacheTime: 60 * 60 * 1000, // 1 hour
      ...options
    });
  };

  /**
   * Create a new screening
   */
  const useCreateScreening = (options = {}) => {
    return useMutation({
      mutationFn: (data) => screeningApi.createScreening(data),
      onSuccess: (data) => {
        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: ['screenings'] });
        queryClient.invalidateQueries({ queryKey: ['admin-screenings'] });
        queryClient.invalidateQueries({ queryKey: ['upcoming-screenings'] });
        
        // Call custom success handler if provided
        if (options.onSuccess) {
          options.onSuccess(data);
        }
      },
      onError: options.onError,
    });
  };

  /**
   * Update a screening
   */
  const useUpdateScreening = (options = {}) => {
    return useMutation({
      mutationFn: ({ id, data }) => screeningApi.updateScreening(id, data),
      onSuccess: (data, variables) => {
        // Update cache for the specific screening
        queryClient.setQueryData(['screening', variables.id], data);
        
        // Invalidate list queries
        queryClient.invalidateQueries({ queryKey: ['screenings'] });
        queryClient.invalidateQueries({ queryKey: ['admin-screenings'] });
        queryClient.invalidateQueries({ queryKey: ['upcoming-screenings'] });
        
        // Call custom success handler if provided
        if (options.onSuccess) {
          options.onSuccess(data);
        }
      },
      onError: options.onError,
    });
  };

  /**
   * Delete a screening
   */
  const useDeleteScreening = (options = {}) => {
    return useMutation({
      mutationFn: (id) => screeningApi.deleteScreening(id),
      onSuccess: (data, screeningId) => {
        // Remove from cache
        queryClient.removeQueries(['screening', screeningId]);
        
        // Invalidate list queries
        queryClient.invalidateQueries({ queryKey: ['screenings'] });
        queryClient.invalidateQueries({ queryKey: ['admin-screenings'] });
        queryClient.invalidateQueries({ queryKey: ['upcoming-screenings'] });
        
        // Call custom success handler if provided
        if (options.onSuccess) {
          options.onSuccess(data);
        }
      },
      onError: options.onError,
    });
  };

  // Helper function to invalidate all screening-related queries
  const invalidateScreeningQueries = () => {
    queryClient.invalidateQueries(['screenings']);
    queryClient.invalidateQueries(['admin-screenings']);
    queryClient.invalidateQueries(['screening-formats']);
  };

  // Helper function to prefetch next page
  const prefetchNextPage = (currentParams, nextPage) => {
    const nextParams = { ...currentParams, page: nextPage };
    queryClient.prefetchQuery({
      queryKey: ['admin-screenings', nextParams],
      queryFn: () => screeningApi.getAdminScreenings(nextParams),
      staleTime: 5 * 60 * 1000,
    });
  };

  return {
    // Query hooks
    useGetAdminScreenings,
    useGetScreenings,
    useGetScreening,
    useGetMovieScreenings,
    useGetTheatreScreenings,
    useGetScreeningsByDateRange,
    useGetUpcomingScreenings,
    useSearchScreenings,
    useGetScreeningSeats,
    useGetBookedSeats,
    useGetSeatingLayout,
    useGetScreeningFormats,
    
    // Mutation hooks
    useCreateScreening,
    useUpdateScreening,
    useDeleteScreening,
    
    // Helper functions
    invalidateScreeningQueries,
    prefetchNextPage,
  };
};

export default useScreenings;