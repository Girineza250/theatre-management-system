// src/pages/admin/Screenings/Screenings.jsx - Complete pagination implementation
import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useScreenings } from '@hooks/useScreenings';
import { useMovies } from '@hooks/useMovies';
import { useGetTheatres } from '@hooks/useTheatres';
import { useToast } from '@contexts/ToastContext';
import { formatDate, formatEnumValue, formatCurrency } from '@utils/formatUtils';
import { debounce, parsePaginationParams, createPaginationParams } from '@utils/paginationUtils';
import Button from '@components/common/Button';
import LoadingSpinner from '@components/common/LoadingSpinner';
import Pagination from '@components/common/Pagination';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  ExclamationCircleIcon,
  CalendarIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
  FilmIcon,
  BuildingStorefrontIcon
} from '@heroicons/react/24/outline';

const ScreeningsPage = () => {
  const { showSuccess, showError } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Default pagination parameters
  const defaultParams = {
    page: 0,
    size: 5,
    sortBy: 'startTime',
    sortOrder: 'asc',
    search: '',
    movieId: '',
    theatreId: '',
    date: ''
  };
  
  // Parse parameters from URL and maintain them in state
  const [params, setParams] = useState(() => parsePaginationParams(searchParams, defaultParams));
  const [searchInput, setSearchInput] = useState(params.search);
  const [isUpdatingUrl, setIsUpdatingUrl] = useState(false);
  
  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((searchValue) => {
      updateParams({ search: searchValue, page: 0 });
    }, 500),
    []
  );
  
  // Update URL when params change (but avoid loops)
  const updateParams = useCallback((newParams) => {
    const updatedParams = { ...params, ...newParams };
    setParams(updatedParams);
    setIsUpdatingUrl(true);
    
    const urlParams = createPaginationParams(updatedParams, defaultParams);
    setSearchParams(urlParams, { replace: true });
    
    // Reset the flag after a short delay
    setTimeout(() => setIsUpdatingUrl(false), 100);
  }, [params, setSearchParams]);
  
  // Handle search input change
  useEffect(() => {
    if (searchInput !== params.search) {
      debouncedSearch(searchInput);
    }
  }, [searchInput, debouncedSearch, params.search]);
  
  // Sync URL params with state only when URL actually changes (not from our updates)
  useEffect(() => {
    if (!isUpdatingUrl) {
      const urlParams = parsePaginationParams(searchParams, defaultParams);
      const hasChanged = JSON.stringify(urlParams) !== JSON.stringify(params);
      
      if (hasChanged) {
        setParams(urlParams);
        setSearchInput(urlParams.search);
      }
    }
  }, [searchParams, isUpdatingUrl, params]);
  
  // API calls
  const { useGetAdminScreenings, useDeleteScreening } = useScreenings();
  const { useGetMovies } = useMovies();
  const { data: theatresData = [], isLoading: isLoadingTheatres } = useGetTheatres();
  
  // Build query params for API
  const queryParams = {
    ...params,
    movieId: params.movieId || undefined,
    theatreId: params.theatreId || undefined,
    date: params.date || undefined,
    search: params.search || undefined
  };
  
  const {
    data: response,
    isLoading: isLoadingScreenings,
    isFetching,
    error,
    refetch: refetchScreenings
  } = useGetAdminScreenings(queryParams);
  
  // Get movies for filter dropdown
  const { data: moviesData = [], isLoading: isLoadingMovies } = useGetMovies();
  
  // Extract data
  const screenings = response?.screenings || [];
  const pagination = {
    currentPage: response?.currentPage || 0,
    totalPages: response?.totalPages || 0,
    totalElements: response?.totalElements || 0,
    pageSize: response?.pageSize || 10,
    hasNext: response?.hasNext || false,
    hasPrevious: response?.hasPrevious || false
  };
  
  // Delete screening mutation
  const { mutate: deleteScreening, isPending: isDeleting } = useDeleteScreening({
    onSuccess: () => {
      showSuccess('Screening deleted successfully');
      refetchScreenings();
    },
    onError: (error) => {
      showError(error.message || 'Failed to delete screening');
    }
  });
  
  // Event handlers
  const handleSort = useCallback((field) => {
    const newOrder = params.sortBy === field && params.sortOrder === 'asc' ? 'desc' : 'asc';
    updateParams({ sortBy: field, sortOrder: newOrder, page: 0 });
  }, [params.sortBy, params.sortOrder, updateParams]);
  
  const handlePageChange = useCallback((page) => {
    updateParams({ page });
  }, [updateParams]);
  
  const handlePageSizeChange = useCallback((size) => {
    updateParams({ size, page: 0 });
  }, [updateParams]);
  
  const handleMovieChange = useCallback((e) => {
    updateParams({ movieId: e.target.value, page: 0 });
  }, [updateParams]);
  
  const handleTheatreChange = useCallback((e) => {
    updateParams({ theatreId: e.target.value, page: 0 });
  }, [updateParams]);
  
  const handleDateChange = useCallback((e) => {
    updateParams({ date: e.target.value, page: 0 });
  }, [updateParams]);
  
  const handleResetFilters = useCallback(() => {
    setSearchInput('');
    setParams(defaultParams);
    setSearchParams(new URLSearchParams(), { replace: true });
  }, [setSearchParams]);
  
  const handleDeleteScreening = useCallback((id) => {
    if (window.confirm('Are you sure you want to delete this screening?')) {
      deleteScreening(id);
    }
  }, [deleteScreening]);
  
  // Render sort icon
  const renderSortIcon = (field) => {
    if (params.sortBy !== field) return null;
    return (
      <ArrowsUpDownIcon 
        className={`h-4 w-4 transition-transform ${
          params.sortOrder === 'desc' ? 'transform rotate-180' : ''
        }`} 
      />
    );
  };
  
  // Format current date as YYYY-MM-DD for date input default
  const today = new Date().toISOString().split('T')[0];
  
  // Loading state
  if (isLoadingScreenings && !isFetching) {
    return <LoadingSpinner />;
  }
  
  // Error state
  if (error) {
    return (
      <div className="text-center py-8">
        <ExclamationCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Screenings</h3>
        <p className="text-gray-500 mb-4">{error.message}</p>
        <Button onClick={() => refetchScreenings()}>Retry</Button>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">Screenings</h1>
        <Link to="/admin/screenings/create">
          <Button 
            variant="primary"
            icon={<PlusIcon className="h-5 w-5 mr-2" />}
          >
            Add Screening
          </Button>
        </Link>
      </div>
      
      {/* Filters and search */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            {/* Search */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="search"
                  type="text"
                  placeholder="Search screenings..."
                  className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>
            </div>
            
            {/* Movie filter */}
            <div>
              <label htmlFor="movie" className="block text-sm font-medium text-gray-700 mb-1">
                Movie
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FilmIcon className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  id="movie"
                  className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  value={params.movieId}
                  onChange={handleMovieChange}
                  disabled={isLoadingMovies}
                >
                  <option value="">All Movies</option>
                  {moviesData.map(movie => (
                    <option key={movie.id} value={movie.id}>
                      {movie.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Theatre filter */}
            <div>
              <label htmlFor="theatre" className="block text-sm font-medium text-gray-700 mb-1">
                Theatre
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <BuildingStorefrontIcon className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  id="theatre"
                  className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  value={params.theatreId}
                  onChange={handleTheatreChange}
                  disabled={isLoadingTheatres}
                >
                  <option value="">All Theatres</option>
                  {theatresData.map(theatre => (
                    <option key={theatre.id} value={theatre.id}>
                      {theatre.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Date filter */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CalendarIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="date"
                  type="date"
                  className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  value={params.date}
                  onChange={handleDateChange}
                  min={today}
                />
              </div>
            </div>
          </div>
          
          {/* Reset filters */}
          <div className="flex justify-end mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
              disabled={!params.search && !params.movieId && !params.theatreId && !params.date && params.sortBy === 'startTime' && params.sortOrder === 'asc'}
            >
              Reset Filters
            </Button>
          </div>
        </div>
      </div>
      
      {/* Screenings table with loading overlay */}
      <div className="bg-white rounded-lg shadow overflow-hidden relative">
        {/* Loading overlay */}
        {isFetching && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
            <LoadingSpinner size="md" />
          </div>
        )}
        
        {screenings.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {/* Table headers with sort functionality */}
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('movieTitle')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Movie</span>
                        {renderSortIcon('movieTitle')}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('theatreName')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Theatre</span>
                        {renderSortIcon('theatreName')}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('startTime')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Date & Time</span>
                        {renderSortIcon('startTime')}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Screen
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('format')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Format</span>
                        {renderSortIcon('format')}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('basePrice')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Base Price</span>
                        {renderSortIcon('basePrice')}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {screenings.map(screening => (
                    <tr key={screening.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {screening.movieTitle || 'Unknown Movie'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{screening.theatreName || 'Unknown Theatre'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {screening.startTime ? formatDate(screening.startTime) : 'No date'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {screening.screenNumber || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {screening.format ? formatEnumValue(screening.format) : 'Standard'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(screening.basePrice || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Link to={`/admin/screenings/${screening.id}/bookings`}>
                            <Button variant="ghost" size="sm">
                              Bookings
                            </Button>
                          </Link>
                          <Link to={`/admin/screenings/${screening.id}/edit`}>
                            <Button 
                              variant="outline" 
                              size="sm"
                              icon={<PencilSquareIcon className="h-4 w-4" />}
                            >
                              Edit
                            </Button>
                          </Link>
                          <Button 
                            variant="danger" 
                            size="sm"
                            icon={<TrashIcon className="h-4 w-4" />}
                            onClick={() => handleDeleteScreening(screening.id)}
                            loading={isDeleting}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200">
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                totalElements={pagination.totalElements}
                pageSize={pagination.pageSize}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                showPageSizeSelector={true}
                showPageInfo={true}
              />
            </div>
          </>
        ) : (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <ExclamationCircleIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No screenings found</h3>
            <p className="text-gray-500 mb-6">
              {params.search || params.movieId || params.theatreId || params.date
                ? 'No screenings match your filters. Try adjusting your search criteria.'
                : 'There are no screenings in the system yet. Add your first screening to get started.'
              }
            </p>
            <Link to="/admin/screenings/create">
              <Button 
                variant="primary"
                icon={<PlusIcon className="h-5 w-5 mr-2" />}
              >
                Add Screening
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScreeningsPage;