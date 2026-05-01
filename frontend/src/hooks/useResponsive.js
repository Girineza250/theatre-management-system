import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook to manage window size and responsive breakpoints
 * @returns {Object} Responsive properties and utility functions
 */
const useResponsive = () => {
  // Define breakpoints to match Tailwind's default breakpoints
  const breakpoints = {
    xs: 480,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536
  };

  // Initialize with default window sizes or null for SSR
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : null,
    height: typeof window !== 'undefined' ? window.innerHeight : null
  });

  // Track window resize
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Handler to update window size
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Call handler right away to update initial size
    handleResize();
    
    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  /**
   * Check if the current screen size matches or exceeds a breakpoint
   * @param {string} breakpoint - Breakpoint name (xs, sm, md, lg, xl, 2xl)
   * @returns {boolean} Whether the screen is at least the provided breakpoint
   */
  const isMin = useCallback((breakpoint) => {
    if (typeof window === 'undefined' || !windowSize.width) return false;
    return windowSize.width >= breakpoints[breakpoint];
  }, [windowSize.width]);

  /**
   * Check if the current screen size is below a breakpoint
   * @param {string} breakpoint - Breakpoint name (xs, sm, md, lg, xl, 2xl)
   * @returns {boolean} Whether the screen is below the provided breakpoint
   */
  const isMax = useCallback((breakpoint) => {
    if (typeof window === 'undefined' || !windowSize.width) return false;
    return windowSize.width < breakpoints[breakpoint];
  }, [windowSize.width]);

  /**
   * Check if the current screen size is between two breakpoints
   * @param {string} minBreakpoint - Minimum breakpoint name (inclusive)
   * @param {string} maxBreakpoint - Maximum breakpoint name (exclusive)
   * @returns {boolean} Whether the screen is between the provided breakpoints
   */
  const isBetween = useCallback((minBreakpoint, maxBreakpoint) => {
    if (typeof window === 'undefined' || !windowSize.width) return false;
    return windowSize.width >= breakpoints[minBreakpoint] && windowSize.width < breakpoints[maxBreakpoint];
  }, [windowSize.width]);

  // Responsive flags for common breakpoints
  const isXs = isMax('sm');
  const isSm = isBetween('sm', 'md');
  const isMd = isBetween('md', 'lg');
  const isLg = isBetween('lg', 'xl');
  const isXl = isBetween('xl', '2xl');
  const is2Xl = isMin('2xl');

  // Mobile/desktop flags
  const isMobile = isMax('md');
  const isTablet = isBetween('md', 'lg');
  const isDesktop = isMin('lg');

  return {
    // Raw values
    width: windowSize.width,
    height: windowSize.height,
    breakpoints,
    
    // Utility methods
    isMin,
    isMax,
    isBetween,
    
    // Breakpoint flags
    isXs,
    isSm,
    isMd,
    isLg,
    isXl,
    is2Xl,
    
    // Device type flags
    isMobile,
    isTablet,
    isDesktop
  };
};

export default useResponsive;