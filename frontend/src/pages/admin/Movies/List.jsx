// src/pages/admin/Movies/List.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMovies } from '@hooks/useMovies';
import { useToast } from '@contexts/ToastContext';
import { formatDate, formatDuration, formatEnumValue } from '@utils/formatUtils';
import Button from '@components/common/Button';
import GenreFilter from '@components/features/movies/GenreFilter';
import LoadingSpinner from '@components/common/LoadingSpinner';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  ExclamationCircleIcon,
  FilmIcon,
  CalendarIcon,
  FunnelIcon,
  ArrowsUpDownIcon
} from '@heroicons/react/24/outline';

const MovieList = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  
  // State for search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState('asc');
  
  // Get all movies
  const { useGetMovies, useGetGenres, useDeleteMovie } = useMovies();
  
  const {
    data: movies = [],
    isLoading: isLoadingMovies,
    refetch: refetchMovies
  } = useGetMovies({
    query: searchQuery || undefined,
    genre: selectedGenre || undefined
  });
  
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
      refetchMovies();
    },
    onError: (error) => {
      showError(error.message || 'Failed to delete movie');
    }
  });
  
  // Handle movie deletion
  const handleDeleteMovie = (id) => {
    if (window.confirm('Are you sure you want to delete this movie? This will also delete all associated screenings and bookings.')) {
      deleteMovie(id);
    }
  };
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  // Handle genre filter change
  const handleGenreChange = (genre) => {
    setSelectedGenre(genre);
  };
  
  // Handle sort change
  const handleSortChange = (field) => {
    if (sortBy === field) {
      // Toggle sort order if same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to ascending
      setSortBy(field);
      setSortOrder('asc');
    }
  };
  
  // Filter and sort movies
  const filteredMovies = [...movies].sort((a, b) => {
    // Sort by selected field
    let comparison = 0;
    
    switch (sortBy) {
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'genre':
        comparison = (a.genre || '').localeCompare(b.genre || '');
        break;
      case 'releaseDate':
        comparison = new Date(a.releaseDate || 0) - new Date(b.releaseDate || 0);
        break;
      case 'rating':
        comparison = (a.rating || '').localeCompare(b.rating || '');
        break;
      default:
        comparison = a.title.localeCompare(b.title);
    }
    
    // Apply sort order
    return sortOrder === 'asc' ? comparison : -comparison;
  });
  
  // Loading state
  if (isLoadingMovies || isLoadingGenres) {
    return <LoadingSpinner />;
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
            <div>
              <GenreFilter 
                genres={genres}
                selectedGenre={selectedGenre}
                onChange={handleGenreChange}
              />
            </div>
            
            {/* Reset filters */}
            <div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedGenre('');
                }}
                disabled={!searchQuery && !selectedGenre}
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Movies list */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredMovies.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {/* Table headers with sort functionality */}
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSortChange('title')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Title</span>
                      {sortBy === 'title' && (
                        <ArrowsUpDownIcon className={`h-4 w-4 ${sortOrder === 'asc' ? 'transform rotate-180' : ''}`} />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSortChange('genre')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Genre</span>
                      {sortBy === 'genre' && (
                        <ArrowsUpDownIcon className={`h-4 w-4 ${sortOrder === 'asc' ? 'transform rotate-180' : ''}`} />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSortChange('releaseDate')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Release Date</span>
                      {sortBy === 'releaseDate' && (
                        <ArrowsUpDownIcon className={`h-4 w-4 ${sortOrder === 'asc' ? 'transform rotate-180' : ''}`} />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSortChange('rating')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Rating</span>
                      {sortBy === 'rating' && (
                        <ArrowsUpDownIcon className={`h-4 w-4 ${sortOrder === 'asc' ? 'transform rotate-180' : ''}`} />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Duration
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
                {filteredMovies.map(movie => (
                  <tr key={movie.id}>
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

export default MovieList;