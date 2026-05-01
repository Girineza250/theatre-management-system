// src/utils/paginationUtils.js - Utility functions for pagination
/**
 * Debounce function to limit the rate of function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };
  
  /**
   * Parse pagination parameters from URL search params
   * @param {URLSearchParams} searchParams - URL search parameters
   * @param {Object} defaultParams - Default parameter values
   * @returns {Object} Parsed parameters
   */
  export const parsePaginationParams = (searchParams, defaultParams = {}) => {
    const params = { ...defaultParams };
    
    // Parse each parameter with proper type conversion
    Object.keys(defaultParams).forEach(key => {
      const value = searchParams.get(key);
      if (value !== null) {
        // Type conversion based on default value type
        const defaultValue = defaultParams[key];
        if (typeof defaultValue === 'number') {
          const parsedValue = parseInt(value, 10);
          if (!isNaN(parsedValue)) {
            params[key] = parsedValue;
          }
        } else if (typeof defaultValue === 'boolean') {
          params[key] = value === 'true';
        } else {
          params[key] = value;
        }
      }
    });
    
    return params;
  };
  
  /**
   * Create URL search params from pagination parameters
   * @param {Object} params - Current parameters
   * @param {Object} defaultParams - Default parameter values
   * @returns {URLSearchParams} URL search parameters
   */
  export const createPaginationParams = (params, defaultParams = {}) => {
    const urlParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      const value = params[key];
      const defaultValue = defaultParams[key];
      
      // Only add to URL if different from default
      if (value !== defaultValue && value !== '' && value !== null && value !== undefined) {
        urlParams.set(key, value.toString());
      }
    });
    
    return urlParams;
  };
  
  /**
   * Generate sort icon class based on current sort state
   * @param {string} field - Field name
   * @param {string} currentSortBy - Current sort field
   * @param {string} currentSortOrder - Current sort order
   * @returns {string} CSS class for sort icon
   */
  export const getSortIconClass = (field, currentSortBy, currentSortOrder) => {
    if (currentSortBy !== field) return 'h-4 w-4 text-gray-400';
    
    const baseClass = 'h-4 w-4 transition-transform';
    return currentSortOrder === 'desc' 
      ? `${baseClass} transform rotate-180` 
      : baseClass;
  };
  
  /**
   * Calculate pagination info text
   * @param {number} currentPage - Current page (0-based)
   * @param {number} pageSize - Page size
   * @param {number} totalElements - Total number of elements
   * @returns {Object} Pagination info
   */
  export const getPaginationInfo = (currentPage, pageSize, totalElements) => {
    const startElement = Math.min(currentPage * pageSize + 1, totalElements);
    const endElement = Math.min((currentPage + 1) * pageSize, totalElements);
    
    return {
      startElement,
      endElement,
      totalElements,
      hasElements: totalElements > 0
    };
  };
  
  /**
   * Validate and normalize page number
   * @param {number} page - Page number
   * @param {number} totalPages - Total pages
   * @returns {number} Valid page number
   */
  export const normalizePage = (page, totalPages) => {
    if (isNaN(page) || page < 0) return 0;
    if (page >= totalPages && totalPages > 0) return totalPages - 1;
    return page;
  };
  
  /**
   * Validate and normalize page size
   * @param {number} size - Page size
   * @param {number} minSize - Minimum page size (default: 1)
   * @param {number} maxSize - Maximum page size (default: 100)
   * @returns {number} Valid page size
   */
  export const normalizePageSize = (size, minSize = 1, maxSize = 100) => {
    if (isNaN(size) || size < minSize) return minSize;
    if (size > maxSize) return maxSize;
    return size;
  };
  
  /**
   * Create filter display text
   * @param {Object} filters - Current filters
   * @returns {string} Human-readable filter description
   */
  export const getFilterDisplayText = (filters) => {
    const activeFilters = [];
    
    if (filters.search) {
      activeFilters.push(`Search: "${filters.search}"`);
    }
    
    if (filters.genre) {
      activeFilters.push(`Genre: ${formatEnumValue(filters.genre)}`);
    }
    
    if (filters.movieId) {
      activeFilters.push(`Movie ID: ${filters.movieId}`);
    }
    
    if (filters.theatreId) {
      activeFilters.push(`Theatre ID: ${filters.theatreId}`);
    }
    
    if (filters.date) {
      activeFilters.push(`Date: ${filters.date}`);
    }
    
    return activeFilters.length > 0 
      ? `Filtered by: ${activeFilters.join(', ')}`
      : 'No filters applied';
  };
  
  /**
   * Format enum values for display
   * @param {string} value - Enum value
   * @returns {string} Formatted display value
   */
  export const formatEnumValue = (value) => {
    if (!value) return '';
    
    return value
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };
  
  /**
   * Check if any filters are active
   * @param {Object} params - Current parameters
   * @param {Object} defaultParams - Default parameters
   * @returns {boolean} True if any filters are active
   */
  export const hasActiveFilters = (params, defaultParams) => {
    return Object.keys(params).some(key => {
      if (key === 'page' || key === 'size') return false; // Ignore pagination params
      return params[key] !== defaultParams[key] && params[key] !== '' && params[key] !== null;
    });
  };
  
  /**
   * Reset filters to default values
   * @param {Object} defaultParams - Default parameters
   * @returns {Object} Reset parameters
   */
  export const resetFilters = (defaultParams) => {
    return { ...defaultParams, page: 0 }; // Reset to first page
  };
  
  /**
   * Generate page numbers for pagination display
   * @param {number} currentPage - Current page (0-based)
   * @param {number} totalPages - Total pages
   * @param {number} maxVisible - Maximum visible page numbers
   * @returns {Array<number>} Array of page numbers to display
   */
  export const getVisiblePages = (currentPage, totalPages, maxVisible = 5) => {
    const pages = [];
    const halfVisible = Math.floor(maxVisible / 2);
    let startPage = Math.max(0, currentPage - halfVisible);
    let endPage = Math.min(totalPages - 1, startPage + maxVisible - 1);
  
    // Adjust start page if we're near the end
    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(0, endPage - maxVisible + 1);
    }
  
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
  
    return pages;
  };
  
  /**
   * Check if a value is a valid sort field
   * @param {string} sortBy - Sort field
   * @param {Array<string>} allowedFields - Allowed sort fields
   * @returns {boolean} True if valid
   */
  export const isValidSortField = (sortBy, allowedFields) => {
    return allowedFields.includes(sortBy);
  };
  
  /**
   * Check if a value is a valid sort order
   * @param {string} sortOrder - Sort order
   * @returns {boolean} True if valid
   */
  export const isValidSortOrder = (sortOrder) => {
    return ['asc', 'desc'].includes(sortOrder);
  };
  
  /**
   * Build query parameters for API calls
   * @param {Object} params - Current parameters
   * @param {Object} options - Options for building params
   * @param {Array<string>} options.excludeEmpty - Keys to exclude if empty
   * @param {Array<string>} options.excludeDefault - Keys to exclude if default value
   * @param {Object} options.defaultValues - Default values for comparison
   * @returns {Object} Clean query parameters
   */
  export const buildQueryParams = (params, options = {}) => {
    const {
      excludeEmpty = ['search', 'genre', 'movieId', 'theatreId', 'date'],
      excludeDefault = [],
      defaultValues = {}
    } = options;
    
    const queryParams = {};
    
    Object.keys(params).forEach(key => {
      const value = params[key];
      
      // Skip if should exclude empty values
      if (excludeEmpty.includes(key) && (!value || value === '')) {
        return;
      }
      
      // Skip if should exclude default values
      if (excludeDefault.includes(key) && value === defaultValues[key]) {
        return;
      }
      
      queryParams[key] = value;
    });
    
    return queryParams;
  };