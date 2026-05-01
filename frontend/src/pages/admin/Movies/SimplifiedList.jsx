// src/pages/admin/Movies/SimplifiedList.jsx
import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useMovies } from '@hooks/useMovies';
import { useToast } from '@contexts/ToastContext';
import { formatDate, formatDuration, formatEnumValue } from '@utils/formatUtils';
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
  FilmIcon,
  FunnelIcon,
  ArrowsUpDownIcon
} from '@heroicons/react/24/outline';

const SimplifiedAdminMoviesPage = () => {
  const { showSuccess, showError } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Default pagination parameters
  const defaultParams = {
    page: 0,
    size: 5,
    sortBy: 'title',
    sortOrder: 'asc',
    search: '',
    genre: ''
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
    setSearchParams(urlParams, { replace: true }); // Use replace to avoid adding to history
    
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
  const { useGetAdminMovies, useGetGenres, useDeleteMovie } = useMovies();
  
  const {
    data: response,
    isLoading,
    isFetching,
    error
  } = useGetAdminMovies(params);
  
  const { data: genres = [] } = useGetGenres();
  
  const { mutate: deleteMovie, isPending: isDeleting } = useDeleteMovie({
    onSuccess: () => showSuccess('Movie deleted successfully'),
    onError: (error) => showError(error.message || 'Failed to delete movie')
  });
  
  // Extract data
  const movies = response?.movies || [];
  const pagination = {
    currentPage: response?.currentPage || 0,
    totalPages: response?.totalPages || 0,
    totalElements: response?.totalElements || 0,
    pageSize: response?.pageSize || 10,
    hasNext: response?.hasNext || false,
    hasPrevious: response?.hasPrevious || false
  };
  
  // Event handlers - use useCallback to prevent unnecessary re-renders
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
  
  const handleGenreChange = useCallback((e) => {
    updateParams({ genre: e.target.value, page: 0 });
  }, [updateParams]);
  
  const handleResetFilters = useCallback(() => {
    setSearchInput('');
    setParams(defaultParams);
    setSearchParams(new URLSearchParams(), { replace: true });
  }, [setSearchParams]);
  
  const handleDeleteMovie = useCallback((id) => {
    if (window.confirm('Are you sure you want to delete this movie?')) {
      deleteMovie(id);
    }
  }, [deleteMovie]);
  
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
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (error) {
    return (
      <div className="text-center py-8">
        <ExclamationCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Movies</h3>
        <p className="text-gray-500 mb-4">{error.message}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }
  
  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Movies</h1>
        <Link to="/admin/movies/create">
          <Button variant="primary" icon={<PlusIcon className="h-5 w-5 mr-2" />}>
            Add Movie
          </Button>
        </Link>
      </div>
      
      {/* Filters */}
      <div className="bg-white rounded-lg shadow mb-6 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search movies..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
          
          {/* Genre filter */}
          <div className="w-48">
            <div className="relative">
              <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={params.genre}
                onChange={handleGenreChange}
                className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All Genres</option>
                {genres.map(genre => (
                  <option key={genre} value={genre}>
                    {formatEnumValue(genre)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Reset button */}
          <Button
            variant="outline"
            onClick={handleResetFilters}
            disabled={!params.search && !params.genre && params.sortBy === 'title' && params.sortOrder === 'asc'}
          >
            Reset
          </Button>
        </div>
      </div>
      
      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden relative">
        {isFetching && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
            <LoadingSpinner size="md" />
          </div>
        )}
        
        {movies.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('title')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Title</span>
                        {renderSortIcon('title')}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('genre')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Genre</span>
                        {renderSortIcon('genre')}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('releaseDate')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Release Date</span>
                        {renderSortIcon('releaseDate')}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('durationMinutes')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Duration</span>
                        {renderSortIcon('durationMinutes')}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {movies.map(movie => (
                    <tr key={movie.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            {movie.posterImageUrl ? (
                              <img 
                                className="h-10 w-10 rounded-full object-cover" 
                                src={movie.posterImageUrl} 
                                alt={movie.title}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <FilmIcon className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{movie.title}</div>
                            <div className="text-sm text-gray-500">{movie.director}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {formatEnumValue(movie.genre)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {movie.releaseDate ? formatDate(movie.releaseDate, { dateStyle: 'medium' }) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {movie.durationMinutes ? formatDuration(movie.durationMinutes) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Link to={`/admin/movies/${movie.id}`}>
                            <Button variant="ghost" size="sm">View</Button>
                          </Link>
                          <Link to={`/admin/movies/${movie.id}/edit`}>
                            <Button variant="outline" size="sm" icon={<PencilSquareIcon className="h-4 w-4" />}>
                              Edit
                            </Button>
                          </Link>
                          <Button 
                            variant="danger" 
                            size="sm"
                            icon={<TrashIcon className="h-4 w-4" />}
                            onClick={() => handleDeleteMovie(movie.id)}
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
              />
            </div>
          </>
        ) : (
          <div className="p-12 text-center">
            <ExclamationCircleIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No movies found</h3>
            <p className="text-gray-500 mb-6">
              {params.search || params.genre
                ? 'No movies match your filters. Try adjusting your search criteria.'
                : 'There are no movies in the system yet. Add your first movie to get started.'
              }
            </p>
            <Link to="/admin/movies/create">
              <Button variant="primary" icon={<PlusIcon className="h-5 w-5 mr-2" />}>
                Add Movie
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimplifiedAdminMoviesPage;