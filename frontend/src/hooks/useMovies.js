// src/hooks/useMovies.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { movieApi } from '@api';

/**
 * Custom hook for movie operations with pagination support
 */
export const useMovies = () => {
  const queryClient = useQueryClient();

  /**
   * Get paginated movies for admin panel
   */
  const useGetAdminMovies = (params = {}) => {
    return useQuery({
      queryKey: ['admin-movies', params],
      queryFn: () => movieApi.getAdminMovies(params),
      keepPreviousData: true, // Keep previous data while loading new page
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    });
  };

  /**
   * Get movies (legacy method without pagination)
   */
  const useGetMovies = (params = {}) => {
    return useQuery({
      queryKey: ['movies', params],
      queryFn: () => movieApi.getMovies(params),
      staleTime: 5 * 60 * 1000,
    });
  };

  /**
   * Get a single movie by ID
   */
  const useGetMovie = (id) => {
    return useQuery({
      queryKey: ['movie', id],
      queryFn: () => movieApi.getMovieById(id),
      enabled: !!id,
      staleTime: 10 * 60 * 1000,
    });
  };

  /**
   * Get movie genres
   */
  const useGetGenres = () => {
    return useQuery({
      queryKey: ['movie-genres'],
      queryFn: movieApi.getGenres,
      staleTime: 30 * 60 * 1000, // 30 minutes
      cacheTime: 60 * 60 * 1000, // 1 hour
    });
  };

  /**
   * Search movies with pagination
   */
  const useSearchMovies = (query, pagination = {}) => {
    return useQuery({
      queryKey: ['movies-search', query, pagination],
      queryFn: () => movieApi.searchMovies(query, pagination),
      enabled: !!query && query.length >= 2,
      keepPreviousData: true,
      staleTime: 2 * 60 * 1000, // 2 minutes
    });
  };

  /**
   * Get movies by genre with pagination
   */
  const useGetMoviesByGenre = (genre, pagination = {}) => {
    return useQuery({
      queryKey: ['movies-genre', genre, pagination],
      queryFn: () => movieApi.getMoviesByGenre(genre, pagination),
      enabled: !!genre,
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000,
    });
  };

  /**
   * Get upcoming movies with pagination
   */
  const useGetUpcomingMovies = (pagination = {}) => {
    return useQuery({
      queryKey: ['upcoming-movies', pagination],
      queryFn: () => movieApi.getUpcomingMovies(pagination),
      keepPreviousData: true,
      staleTime: 10 * 60 * 1000,
    });
  };

  /**
   * Get now playing movies with pagination
   */
  const useGetNowPlayingMovies = (pagination = {}) => {
    return useQuery({
      queryKey: ['now-playing-movies', pagination],
      queryFn: () => movieApi.getNowPlayingMovies(pagination),
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000,
    });
  };

  /**
   * Create a new movie
   */
  const useCreateMovie = (options = {}) => {
    return useMutation({
      mutationFn: movieApi.createMovie,
      onSuccess: (data) => {
        // Invalidate relevant queries
        queryClient.invalidateQueries(['admin-movies']);
        queryClient.invalidateQueries(['movies']);
        
        // Call custom success handler if provided
        if (options.onSuccess) {
          options.onSuccess(data);
        }
      },
      onError: options.onError,
    });
  };

  /**
   * Update an existing movie
   */
  const useUpdateMovie = (options = {}) => {
    return useMutation({
      mutationFn: ({ id, data }) => movieApi.updateMovie(id, data),
      onSuccess: (data, variables) => {
        // Update cache for the specific movie
        queryClient.setQueryData(['movie', variables.id], data);
        
        // Invalidate list queries
        queryClient.invalidateQueries(['admin-movies']);
        queryClient.invalidateQueries(['movies']);
        
        // Call custom success handler if provided
        if (options.onSuccess) {
          options.onSuccess(data);
        }
      },
      onError: options.onError,
    });
  };

  /**
   * Delete a movie
   */
  const useDeleteMovie = (options = {}) => {
    return useMutation({
      mutationFn: movieApi.deleteMovie,
      onSuccess: (data, movieId) => {
        // Remove from cache
        queryClient.removeQueries(['movie', movieId]);
        
        // Invalidate list queries
        queryClient.invalidateQueries(['admin-movies']);
        queryClient.invalidateQueries(['movies']);
        
        // Call custom success handler if provided
        if (options.onSuccess) {
          options.onSuccess(data);
        }
      },
      onError: options.onError,
    });
  };

  /**
   * Get movie screenings
   */
  const useGetMovieScreenings = (movieId, days = 7) => {
    return useQuery({
      queryKey: ['movie-screenings', movieId, days],
      queryFn: () => movieApi.getMovieScreenings(movieId, days),
      enabled: !!movieId,
      staleTime: 5 * 60 * 1000,
    });
  };

  // Helper function to invalidate all movie-related queries
  const invalidateMovieQueries = () => {
    queryClient.invalidateQueries(['movies']);
    queryClient.invalidateQueries(['admin-movies']);
    queryClient.invalidateQueries(['movie-genres']);
  };

  // Helper function to prefetch next page
  const prefetchNextPage = (currentParams, nextPage) => {
    const nextParams = { ...currentParams, page: nextPage };
    queryClient.prefetchQuery({
      queryKey: ['admin-movies', nextParams],
      queryFn: () => movieApi.getAdminMovies(nextParams),
      staleTime: 5 * 60 * 1000,
    });
  };

  return {
    // Query hooks
    useGetAdminMovies,
    useGetMovies,
    useGetMovie,
    useGetGenres,
    useSearchMovies,
    useGetMoviesByGenre,
    useGetUpcomingMovies,
    useGetNowPlayingMovies,
    useGetMovieScreenings,
    
    // Mutation hooks
    useCreateMovie,
    useUpdateMovie,
    useDeleteMovie,
    
    // Helper functions
    invalidateMovieQueries,
    prefetchNextPage,
  };
};