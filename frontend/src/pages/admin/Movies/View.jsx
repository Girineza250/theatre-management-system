// src/pages/admin/Movies/View.jsx
import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useMovies } from '@hooks/useMovies';
import { useScreenings } from '@hooks/useScreenings';
import { useToast } from '@contexts/ToastContext';
import { formatDate, formatDuration, formatEnumValue } from '@utils/formatUtils';
import Button from '@components/common/Button';
import LoadingSpinner from '@components/common/LoadingSpinner';
import NotFound from '@components/common/NotFound';
import Tabs from '@components/common/Tabs';
import {
  ArrowLeftIcon,
  PencilSquareIcon,
  TrashIcon,
  CalendarIcon,
  ClockIcon,
  FilmIcon,
  UserIcon,
  PlayIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

const ViewMoviePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Get movie details
  const { useGetMovie, useDeleteMovie } = useMovies();
  const {
    data: movie,
    isLoading: isLoadingMovie,
    error: movieError
  } = useGetMovie(id);
  
  // Get movie screenings
  const { useGetMovieScreenings } = useScreenings();
  const {
    data: screenings = {},
    isLoading: isLoadingScreenings
  } = useGetMovieScreenings(id, 14); // Get screenings for the next 14 days
  
  // Delete movie mutation
  const { mutate: deleteMovie, isPending: isPendingDelete } = useDeleteMovie({
    onSuccess: () => {
      showSuccess('Movie deleted successfully');
      navigate('/admin/movies');
    },
    onError: (error) => {
      showError(error.message || 'Failed to delete movie');
      setIsDeleting(false);
    }
  });
  
  // Handle movie deletion
  const handleDeleteMovie = () => {
    setIsDeleting(true);
    
    // Show confirmation dialog
    if (window.confirm('Are you sure you want to delete this movie? This will also delete all associated screenings and bookings.')) {
      deleteMovie(id);
    } else {
      setIsDeleting(false);
    }
  };
  
  // Loading state
  if (isLoadingMovie || isLoadingScreenings) {
    return <LoadingSpinner />;
  }
  
  // Error state
  if (movieError || !movie) {
    return <NotFound message="Movie not found" />;
  }
  
  // Transform screenings data for display
  const screeningDays = Object.keys(screenings).length > 0 ? Object.keys(screenings) : [];
  const totalScreenings = screeningDays.reduce((count, day) => count + screenings[day].length, 0);
  
  // Define tabs for the movie details
  const tabs = [
    {
      label: 'Overview',
      content: (
        <div className="py-4">
          <div className="space-y-6">
            {/* Description */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600">{movie.description || 'No description available.'}</p>
            </div>
            
            {/* Movie details */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Details</h3>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                {movie.director && (
                  <>
                    <dt className="text-sm font-medium text-gray-500">Director</dt>
                    <dd className="text-sm text-gray-900">{movie.director}</dd>
                  </>
                )}
                
                {movie.cast && (
                  <>
                    <dt className="text-sm font-medium text-gray-500">Cast</dt>
                    <dd className="text-sm text-gray-900">{movie.cast}</dd>
                  </>
                )}
                
                {movie.genre && (
                  <>
                    <dt className="text-sm font-medium text-gray-500">Genre</dt>
                    <dd className="text-sm text-gray-900">{formatEnumValue(movie.genre)}</dd>
                  </>
                )}
                
                {movie.rating && (
                  <>
                    <dt className="text-sm font-medium text-gray-500">Rating</dt>
                    <dd className="text-sm text-gray-900">{movie.rating}</dd>
                  </>
                )}
                
                {movie.releaseDate && (
                  <>
                    <dt className="text-sm font-medium text-gray-500">Release Date</dt>
                    <dd className="text-sm text-gray-900">{formatDate(movie.releaseDate, { dateStyle: 'medium', timeStyle: undefined })}</dd>
                  </>
                )}
                
                {movie.durationMinutes && (
                  <>
                    <dt className="text-sm font-medium text-gray-500">Duration</dt>
                    <dd className="text-sm text-gray-900">{formatDuration(movie.durationMinutes)}</dd>
                  </>
                )}
              </dl>
            </div>
            
            {/* Trailer */}
            {movie.trailerUrl && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Trailer</h3>
                <div className="mt-2">
                  <a 
                    href={movie.trailerUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-primary-600 hover:text-primary-700"
                  >
                    <PlayIcon className="h-5 w-5 mr-1" />
                    Watch Trailer
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      label: `Screenings (${totalScreenings})`,
      content: (
        <div className="py-4">
          {screeningDays.length > 0 ? (
            <div className="space-y-6">
              {screeningDays.map(day => (
                <div key={day}>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    {formatDate(day, { dateStyle: 'full', timeStyle: undefined })}
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {screenings[day].map(screening => (
                      <div key={screening.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-900">{screening.theatreName}</h4>
                            <p className="text-sm text-gray-500">Screen {screening.screenNumber}</p>
                            <p className="text-sm text-gray-500">
                              {formatDate(screening.startTime, { dateStyle: undefined, timeStyle: 'short' })}
                              {screening.format && ` • ${formatEnumValue(screening.format)}`}
                            </p>
                          </div>
                          <Link to={`/admin/screenings/${screening.id}`}>
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              <div className="pt-4 text-center">
                <Link to={`/admin/screenings/create?movieId=${id}`}>
                  <Button 
                    variant="primary"
                    icon={<PlusIcon className="h-5 w-5 mr-1" />}
                  >
                    Add New Screening
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <FilmIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No screenings</h3>
              <p className="mt-1 text-sm text-gray-500">
                There are no upcoming screenings for this movie.
              </p>
              <div className="mt-6">
                <Link to={`/admin/screenings/create?movieId=${id}`}>
                  <Button 
                    variant="primary"
                    icon={<PlusIcon className="h-5 w-5 mr-1" />}
                  >
                    Add Screening
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      )
    }
  ];
  
  return (
    <div>
      <div className="mb-6 flex items-center">
        <Button
          variant="ghost"
          size="sm"
          className="mr-4"
          onClick={() => navigate('/admin/movies')}
          icon={<ArrowLeftIcon className="w-4 h-4" />}
        >
          Back to Movies
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Movie Details</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Header section with movie poster and basic details */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            {/* Movie poster */}
            <div className="flex-shrink-0 h-64 w-44 bg-gray-200 rounded-lg overflow-hidden">
              {movie.posterImageUrl ? (
                <img 
                  src={movie.posterImageUrl} 
                  alt={movie.title} 
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/path/to/placeholder-image.jpg';
                  }}
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <FilmIcon className="h-16 w-16 text-gray-400" />
                </div>
              )}
            </div>
            
            {/* Movie info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{movie.title}</h2>
                  
                  {/* Meta info */}
                  <div className="flex flex-wrap items-center text-sm text-gray-500 mt-1 space-x-4">
                    {movie.releaseDate && (
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        {formatDate(movie.releaseDate, { dateStyle: 'medium', timeStyle: undefined })}
                      </div>
                    )}
                    
                    {movie.durationMinutes && (
                      <div className="flex items-center">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        {formatDuration(movie.durationMinutes)}
                      </div>
                    )}
                    
                    {movie.rating && (
                      <div className="px-2 py-0.5 bg-gray-100 rounded text-xs font-medium">
                        {movie.rating}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Action buttons */}
                <div className="flex space-x-3 mt-4 md:mt-0">
                  <Link to={`/admin/movies/${id}/edit`}>
                    <Button 
                      variant="outline" 
                      size="sm"
                      icon={<PencilSquareIcon className="h-5 w-5 mr-1" />}
                    >
                      Edit
                    </Button>
                  </Link>
                  <Button 
                    variant="danger" 
                    size="sm"
                    icon={<TrashIcon className="h-5 w-5 mr-1" />}
                    loading={isDeleting || isPendingDelete}
                    onClick={handleDeleteMovie}
                  >
                    Delete
                  </Button>
                </div>
              </div>
              
              {/* Additional meta */}
              <div className="space-y-2">
                {movie.genre && (
                  <div className="flex items-center text-sm">
                    <span className="text-gray-500 mr-2">Genre:</span>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {formatEnumValue(movie.genre)}
                    </span>
                  </div>
                )}
                
                {movie.director && (
                  <div className="flex items-start text-sm">
                    <UserIcon className="h-4 w-4 text-gray-400 mt-0.5 mr-2" />
                    <div>
                      <span className="text-gray-500 mr-2">Director:</span>
                      <span className="text-gray-900">{movie.director}</span>
                    </div>
                  </div>
                )}
                
                {movie.cast && (
                  <div className="flex items-start text-sm">
                    <UserIcon className="h-4 w-4 text-gray-400 mt-0.5 mr-2" />
                    <div>
                      <span className="text-gray-500 mr-2">Cast:</span>
                      <span className="text-gray-900">{movie.cast}</span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Quick actions */}
              <div className="mt-6 space-x-3">
                <Link to={`/admin/screenings/create?movieId=${id}`}>
                  <Button 
                    variant="primary" 
                    size="sm"
                    icon={<PlusIcon className="h-5 w-5 mr-1" />}
                  >
                    Add Screening
                  </Button>
                </Link>
                
                {movie.trailerUrl && (
                  <a 
                    href={movie.trailerUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <PlayIcon className="h-4 w-4 mr-1" />
                    Watch Trailer
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabs section for details and screenings */}
        <div className="p-6">
          <Tabs tabs={tabs} />
        </div>
      </div>
    </div>
  );
};

export default ViewMoviePage;