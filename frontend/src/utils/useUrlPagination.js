// src/hooks/useUrlPagination.js - Custom hook for URL-based pagination
import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { parsePaginationParams, createPaginationParams } from '@utils/paginationUtils';

/**
 * Custom hook for managing pagination state synchronized with URL
 * @param {Object} defaultParams - Default pagination parameters
 * @returns {Object} Pagination state and handlers
 */
export const useUrlPagination = (defaultParams = {}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isUpdatingUrl, setIsUpdatingUrl] = useState(false);
  
  // Parse initial parameters from URL
  const [params, setParams] = useState(() => 
    parsePaginationParams(searchParams, defaultParams)
  );
  
  // Search input state (separate from params to handle debouncing)
  const [searchInput, setSearchInput] = useState(params.search || '');
  
  // Update URL when params change (avoid infinite loops)
  const updateUrl = useCallback((newParams) => {
    setIsUpdatingUrl(true);
    const urlParams = createPaginationParams(newParams, defaultParams);
    setSearchParams(urlParams, { replace: true });
    setTimeout(() => setIsUpdatingUrl(false), 100);
  }, [defaultParams, setSearchParams]);
  
  // Update params and URL
  const updateParams = useCallback((newParams) => {
    const updatedParams = { ...params, ...newParams };
    setParams(updatedParams);
    updateUrl(updatedParams);
  }, [params, updateUrl]);
  
  // Sync URL params with state when URL changes externally
  useEffect(() => {
    if (!isUpdatingUrl) {
      const urlParams = parsePaginationParams(searchParams, defaultParams);
      const hasChanged = JSON.stringify(urlParams) !== JSON.stringify(params);
      
      if (hasChanged) {
        setParams(urlParams);
        setSearchInput(urlParams.search || '');
      }
    }
  }, [searchParams, isUpdatingUrl, params, defaultParams]);
  
  // Individual parameter setters
  const setPage = useCallback((page) => {
    updateParams({ page });
  }, [updateParams]);
  
  const setPageSize = useCallback((size) => {
    updateParams({ size, page: 0 }); // Reset to first page when changing size
  }, [updateParams]);
  
  const setSort = useCallback((sortBy, sortOrder = 'asc') => {
    updateParams({ sortBy, sortOrder, page: 0 }); // Reset to first page when sorting
  }, [updateParams]);
  
  const setSearch = useCallback((search) => {
    updateParams({ search, page: 0 }); // Reset to first page when searching
  }, [updateParams]);
  
  const setGenre = useCallback((genre) => {
    updateParams({ genre, page: 0 }); // Reset to first page when filtering
  }, [updateParams]);
  
  const setMovieId = useCallback((movieId) => {
    updateParams({ movieId, page: 0 }); // Reset to first page when filtering
  }, [updateParams]);
  
  const setTheatreId = useCallback((theatreId) => {
    updateParams({ theatreId, page: 0 }); // Reset to first page when filtering
  }, [updateParams]);
  
  const setDate = useCallback((date) => {
    updateParams({ date, page: 0 }); // Reset to first page when filtering
  }, [updateParams]);
  
  // Reset all filters to default
  const resetFilters = useCallback(() => {
    setParams(defaultParams);
    setSearchInput('');
    setSearchParams(new URLSearchParams(), { replace: true });
  }, [defaultParams, setSearchParams]);
  
  // Check if any filters are active
  const hasActiveFilters = useCallback(() => {
    return Object.keys(params).some(key => {
      if (key === 'page' || key === 'size') return false; // Ignore pagination params
      return params[key] !== defaultParams[key] && 
             params[key] !== '' && 
             params[key] !== null && 
             params[key] !== undefined;
    });
  }, [params, defaultParams]);
  
  return {
    // Current parameters
    params,
    
    // Search input state (for controlled input)
    searchInput,
    setSearchInput,
    
    // Individual setters
    setPage,
    setPageSize,
    setSort,
    setSearch,
    setGenre,
    setMovieId,
    setTheatreId,
    setDate,
    
    // Utility functions
    updateParams,
    resetFilters,
    hasActiveFilters,
    
    // URL state
    isUpdatingUrl
  };
};