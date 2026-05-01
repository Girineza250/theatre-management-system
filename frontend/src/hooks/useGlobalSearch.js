import { useQuery } from '@tanstack/react-query';
import { searchApi } from '@api';

/**
 * Custom hook for global search functionality
 */
export const useGlobalSearch = () => {
  
  /**
   * Global search hook with debouncing
   */
  const useSearch = (query, limit = 3, options = {}) => {
    return useQuery({
      queryKey: ['global-search', query, limit],
      queryFn: () => searchApi.globalSearch(query, limit),
      enabled: !!query && query.length >= 2,
      staleTime: 30 * 1000, // 30 seconds
      cacheTime: 2 * 60 * 1000, // 2 minutes
      ...options
    });
  };

  /**
   * Search movies only
   */
  const useSearchMovies = (query, limit = 10, options = {}) => {
    return useQuery({
      queryKey: ['search-movies', query, limit],
      queryFn: () => searchApi.searchMovies(query, limit),
      enabled: !!query && query.length >= 2,
      staleTime: 60 * 1000, // 1 minute
      cacheTime: 5 * 60 * 1000, // 5 minutes
      ...options
    });
  };

  /**
   * Search theatres only
   */
  const useSearchTheatres = (query, limit = 10, options = {}) => {
    return useQuery({
      queryKey: ['search-theatres', query, limit],
      queryFn: () => searchApi.searchTheatres(query, limit),
      enabled: !!query && query.length >= 2,
      staleTime: 2 * 60 * 1000, // 2 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      ...options
    });
  };

  /**
   * Search screenings only
   */
  const useSearchScreenings = (query, limit = 10, options = {}) => {
    return useQuery({
      queryKey: ['search-screenings', query, limit],
      queryFn: () => searchApi.searchScreenings(query, limit),
      enabled: !!query && query.length >= 2,
      staleTime: 30 * 1000, // 30 seconds
      cacheTime: 2 * 60 * 1000, // 2 minutes
      ...options
    });
  };

  /**
   * Search users only (Admin only)
   */
  const useSearchUsers = (query, limit = 10, options = {}) => {
    return useQuery({
      queryKey: ['search-users', query, limit],
      queryFn: () => searchApi.searchUsers(query, limit),
      enabled: !!query && query.length >= 2,
      staleTime: 60 * 1000, // 1 minute
      cacheTime: 5 * 60 * 1000, // 5 minutes
      ...options
    });
  };

  /**
   * Get search suggestions
   */
  const useSearchSuggestions = (query, limit = 5, options = {}) => {
    return useQuery({
      queryKey: ['search-suggestions', query, limit],
      queryFn: () => searchApi.getSearchSuggestions(query, limit),
      enabled: !!query && query.length >= 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      ...options
    });
  };

  return {
    useSearch,
    useSearchMovies,
    useSearchTheatres,
    useSearchScreenings,
    useSearchUsers,
    useSearchSuggestions
  };
};

export default useGlobalSearch;
