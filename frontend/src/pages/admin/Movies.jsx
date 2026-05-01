// src/pages/admin/Movies.jsx
import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useMovies } from '@hooks/useMovies';
import { useToast } from '@contexts/ToastContext';
import { formatDate, formatDuration, formatEnumValue } from '@utils/formatUtils';
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

const AdminMoviesPage = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State for search and filters
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedGenre, setSelectedGenre] = useState(searchParams.get('genre') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'title');
  const [sortOrder, setSortOrder] = useState(searchParams.get('sortOrder') || 'asc');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 0);
  const [pageSize, setPageSize] = useState(parseInt(searchParams.get('size')) || 10);
  
  // Debounced search to avoid too many API calls
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);
  
  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);
  
  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearchQuery) params.set('search', debouncedSearchQuery);
    if (selectedGenre) params.set('genre', selectedGenre);
    if (sortBy !== 'title') params.set('sortBy', sortBy);
    if (sortOrder !== 'asc') params.set('sortOrder', sortOrder);
    if (currentPage > 0) params.set('page', currentPage.toString());
    if (pageSize !== 10) params.set('size', pageSize.toString());
    
    setSearchParams(params);
  }, [debouncedSearchQuery, selectedGenre, sortBy, sortOrder, currentPage, pageSize, setSearchParams]);
  
  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(0);
  }, [debouncedSearchQuery, selectedGenre, sortBy, sortOrder]);
  
  // Get movies with pagination
  const { useGetAdminMovies, useGetGenres, useDeleteMovie, prefetchNextPage } = useMovies();
  
  const queryParams = {
    search: debouncedSearchQuery || undefined,
    genre: selectedGenre || undefined,
    sortBy,
    sortOrder,
    page: currentPage,
    size: pageSize
  };
  
  const {
    data: moviesResponse,
    isLoading: isLoadingMovies,
    error: moviesError,
    isFetching
  } = useGetAdminMovies(queryParams);
  
  // Get genres for filter
  const {
    data: genres = [],
    isLoading: isLoadingGenres
  } = useGetGenres();
  
  // Delete movie mutation
  const {
    mutate: deleteMovie,
    isPending: isDeleting
  } = useDeleteMovie({
    onSuccess: () => {
      showSuccess('Movie deleted successfully');
    },
    onError: (error) => {
      showError(error.message || 'Failed to delete movie');
    }
  });
  
  // Extract data from response
  const movies = moviesResponse?.movies || [];
  const totalElements = moviesResponse?.totalElements || 0;
  const totalPages = moviesResponse?.totalPages || 0;
  const hasNext = moviesResponse?.hasNext || false;
  
  // Prefetch next page when user hovers over next button
  useEffect(() => {
    if (hasNext) {
      prefetchNextPage(queryParams, currentPage + 1);
    }
  }, [currentPage, hasNext, prefetchNextPage, queryParams]);
  
  // Handle movie deletion
  const handleDeleteMovie = useCallback((id) => {
    if (window.confirm('Are you sure you want to delete this movie? This will also delete all associated screenings and bookings.')) {
      deleteMovie(id);
    }
  }, [deleteMovie]);
  
  // Handle search input change
  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);
  
  // Handle genre filter change
  const handleGenreChange = useCallback((e) => {
    setSelectedGenre(e.target.value);
  }, []);
  
  // Handle sort change
  const handleSortChange = useCallback((field) => {
    if (sortBy === field) {
      // Toggle sort order if same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to ascending
      setSortBy(field);
      setSortOrder('asc');
    }
  }, [sortBy, sortOrder]);
  
  // Handle page change
  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);
  
  // Handle page size change
  const handlePageSizeChange = useCallback((newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(0); // Reset to first page
  }, []);
  
  // Reset all filters
  const handleResetFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedGenre('');
    setSortBy('title');
    setSortOrder('asc');
    setCurrentPage(0);
  }, []);
  
  // Loading state
  if (isLoadingMovies && !isFetching) {
    return <LoadingSpinner />;
  }
  
  // Error state
  if (moviesError) {
    return (
      <div className="text-center py-8">
        <ExclamationCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Movies</h3>
        <p className="text-gray-500 mb-4">{moviesError.message}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">Movies</h1>
        <Link to="/admin/movies/create">
          <Button 
            variant="primary"
            icon={<PlusIcon className="h-5 w-5 mr-2" />}
          >
            Add Movie
          </Button>
        </Link>
      </div>
      
      {/* Filters and search */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search movies..."
                  className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
            
            {/* Genre filter */}
            <div className="w-full md:w-48">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FunnelIcon className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  value={selectedGenre}
                  onChange={handleGenreChange}
                  disabled={isLoadingGenres}
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
            
            {/* Reset filters */}
            <div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                disabled={!searchQuery && !selectedGenre && sortBy === 'title' && sortOrder === 'asc'}
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Movies table with loading overlay */}
      <div className="bg-white rounded-lg shadow overflow-hidden relative">
        {/* Loading overlay */}
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
                    {/* Table headers with sort functionality */}
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSortChange('title')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Title</span>
                        {sortBy === 'title' && (
                          <ArrowsUpDownIcon className={`h-4 w-4 transition-transform ${sortOrder === 'desc' ? 'transform rotate-180' : ''}`} />
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSortChange('genre')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Genre</span>
                        {sortBy === 'genre' && (
                          <ArrowsUpDownIcon className={`h-4 w-4 transition-transform ${sortOrder === 'desc' ? 'transform rotate-180' : ''}`} />
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSortChange('releaseDate')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Release Date</span>
                        {sortBy === 'releaseDate' && (
                          <ArrowsUpDownIcon className={`h-4 w-4 transition-transform ${sortOrder === 'desc' ? 'transform rotate-180' : ''}`} />
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSortChange('rating')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Rating</span>
                        {sortBy === 'rating' && (
                          <ArrowsUpDownIcon className={`h-4 w-4 transition-transform ${sortOrder === 'desc' ? 'transform rotate-180' : ''}`} />
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSortChange('durationMinutes')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Duration</span>
                        {sortBy === 'durationMinutes' && (
                          <ArrowsUpDownIcon className={`h-4 w-4 transition-transform ${sortOrder === 'desc' ? 'transform rotate-180' : ''}`} />
                        )}
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
                  {movies.map(movie => (
                    <tr key={movie.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {movie.posterImageUrl ? (
                              <img 
                                className="h-10 w-10 rounded-full object-cover" 
                                src={movie.posterImageUrl} 
                                alt={movie.title} 
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = '/path/to/placeholder.jpg';
                                }}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <FilmIcon className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {movie.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {movie.director}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {formatEnumValue(movie.genre)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {movie.releaseDate ? formatDate(movie.releaseDate, { dateStyle: 'medium', timeStyle: undefined }) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {movie.rating || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {movie.durationMinutes ? formatDuration(movie.durationMinutes) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Link to={`/admin/movies/${movie.id}`}>
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </Link>
                          <Link to={`/admin/movies/${movie.id}/edit`}>
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
                currentPage={currentPage}
                totalPages={totalPages}
                totalElements={totalElements}
                pageSize={pageSize}
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">No movies found</h3>
            <p className="text-gray-500 mb-6">
              {searchQuery || selectedGenre
                ? 'No movies match your filters. Try adjusting your search criteria.'
                : 'There are no movies in the system yet. Add your first movie to get started.'
              }
            </p>
            <Link to="/admin/movies/create">
              <Button 
                variant="primary"
                icon={<PlusIcon className="h-5 w-5 mr-2" />}
              >
                Add Movie
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMoviesPage;