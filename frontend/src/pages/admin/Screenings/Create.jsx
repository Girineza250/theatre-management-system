// src/pages/admin/Screenings/Create.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useScreenings } from '@hooks/useScreenings';
import { useMovies } from '@hooks/useMovies';
import { useGetTheatres } from '@hooks/useTheatres'; // Import theatres hook directly
import { useToast } from '@contexts/ToastContext';
import Button from '@components/common/Button';
import Input from '@components/common/Input';
import LoadingSpinner from '@components/common/LoadingSpinner';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const CreateScreeningPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showSuccess, showError } = useToast();
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedTheatre, setSelectedTheatre] = useState(null);
  
  // Parse query params to get preselected theatre or movie
  const queryParams = new URLSearchParams(location.search);
  const preselectedTheatreId = queryParams.get('theatreId');
  const preselectedMovieId = queryParams.get('movieId');

  // Get data for dropdowns
  const { useGetMovies } = useMovies();
  const { data: moviesData = [], isLoading: isLoadingMovies } = useGetMovies();
  
  // Ensure movies is always an array
  const movies = Array.isArray(moviesData) ? moviesData : [];
  
  // Get theatres using the hook
  const { data: theatresData = [], isLoading: isLoadingTheatres } = useGetTheatres();
  
  // Ensure theatres is always an array
  const theatres = Array.isArray(theatresData) ? theatresData : [];
  
  const { useGetScreeningFormats, useCreateScreening } = useScreenings();
  const { data: formatsData = [], isLoading: isLoadingFormats } = useGetScreeningFormats();
  
  // Ensure formats is always an array
  const formats = Array.isArray(formatsData) ? formatsData : [];
  
  // Form handling
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      movieId: preselectedMovieId || '',
      theatreId: preselectedTheatreId || '',
      startDateString: '',
      startTimeString: '',
      screenNumber: '',
      format: '',
      basePrice: ''
    }
  });
  
  // Watch form fields
  const movieId = watch('movieId');
  const theatreId = watch('theatreId');
  
  // Set preselected values on load
  useEffect(() => {
    if (preselectedMovieId) {
      setValue('movieId', preselectedMovieId);
    }
    if (preselectedTheatreId) {
      setValue('theatreId', preselectedTheatreId);
    }
  }, [setValue, preselectedMovieId, preselectedTheatreId]);
  
  // Create screening mutation
  const { mutate: createScreening, isPending: isCreating } = useCreateScreening({
    onSuccess: () => {
      showSuccess('Screening created successfully');
      navigate('/admin/screenings');
    },
    onError: (error) => {
      showError(error.message || 'Failed to create screening');
    }
  });
  
  // Handle movie selection change
  useEffect(() => {
    if (movieId) {
      const movie = movies.find(m => m.id.toString() === movieId.toString());
      setSelectedMovie(movie);
    } else {
      setSelectedMovie(null);
    }
  }, [movieId, movies]);
  
  // Handle theatre selection change
  useEffect(() => {
    if (theatreId) {
      const theatre = theatres.find(t => t.id.toString() === theatreId.toString());
      setSelectedTheatre(theatre);
    } else {
      setSelectedTheatre(null);
    }
  }, [theatreId, theatres]);
  
  // Form submission handler
  const onSubmit = (data) => {
    // Convert string values to appropriate types
    const screeningData = {
      ...data,
      screenNumber: parseInt(data.screenNumber, 10),
      basePrice: parseFloat(data.basePrice)
    };
    
    // Create screening
    createScreening(screeningData);
  };
  
  // Handle cancel
  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
      navigate('/admin/screenings');
    }
  };
  
  // Loading state
  if (isLoadingMovies || isLoadingFormats || isLoadingTheatres) {
    return <LoadingSpinner />;
  }
  
  // Set today as the minimum date for the date picker
  const today = new Date().toISOString().split('T')[0];
  
  return (
    <div>
      <div className="mb-6 flex items-center">
        <Button
          variant="ghost"
          size="sm"
          className="mr-4"
          onClick={() => navigate('/admin/screenings')}
          icon={<ArrowLeftIcon className="w-4 h-4" />}
        >
          Back to Screenings
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Create Screening</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Movie selection */}
            <div>
              <label htmlFor="movieId" className="block text-sm font-medium text-gray-700 mb-1">
                Movie <span className="text-red-500">*</span>
              </label>
              <select
                id="movieId"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                {...register('movieId', { required: 'Movie is required' })}
              >
                <option value="">Select a movie</option>
                {movies.map(movie => (
                  <option key={movie.id} value={movie.id}>
                    {movie.title}
                  </option>
                ))}
              </select>
              {errors.movieId && (
                <p className="mt-1 text-sm text-red-600">{errors.movieId.message}</p>
              )}
              
              {/* Show selected movie details */}
              {selectedMovie && (
                <div className="mt-2 p-2 bg-gray-50 rounded-md text-sm">
                  <p><strong>Duration:</strong> {selectedMovie.durationMinutes} min</p>
                  <p><strong>Genre:</strong> {selectedMovie.genre}</p>
                </div>
              )}
            </div>
            
            {/* Theatre selection */}
            <div>
              <label htmlFor="theatreId" className="block text-sm font-medium text-gray-700 mb-1">
                Theatre <span className="text-red-500">*</span>
              </label>
              <select
                id="theatreId"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                {...register('theatreId', { required: 'Theatre is required' })}
              >
                <option value="">Select a theatre</option>
                {theatres.map(theatre => (
                  <option key={theatre.id} value={theatre.id}>
                    {theatre.name}
                  </option>
                ))}
              </select>
              {errors.theatreId && (
                <p className="mt-1 text-sm text-red-600">{errors.theatreId.message}</p>
              )}
              
              {/* Show selected theatre details */}
              {selectedTheatre && (
                <div className="mt-2 p-2 bg-gray-50 rounded-md text-sm">
                  <p><strong>Total Screens:</strong> {selectedTheatre.totalScreens}</p>
                  <p><strong>Location:</strong> {selectedTheatre.address}</p>
                </div>
              )}
            </div>
            
            {/* Screen number */}
            <div>
              <label htmlFor="screenNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Screen Number <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="screenNumber"
                min="1"
                max={selectedTheatre?.totalScreens || 99}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                {...register('screenNumber', { 
                  required: 'Screen number is required',
                  min: {
                    value: 1,
                    message: 'Screen number must be at least 1'
                  },
                  max: {
                    value: selectedTheatre?.totalScreens || 99,
                    message: `Screen number must not exceed ${selectedTheatre?.totalScreens || 99}`
                  }
                })}
              />
              {errors.screenNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.screenNumber.message}</p>
              )}
            </div>
            
            {/* Format selection */}
            <div>
              <label htmlFor="format" className="block text-sm font-medium text-gray-700 mb-1">
                Format <span className="text-red-500">*</span>
              </label>
              <select
                id="format"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                {...register('format', { required: 'Format is required' })}
              >
                <option value="">Select a format</option>
                {formats.map(format => (
                  <option key={format} value={format}>
                    {format.replace('_', ' ')}
                  </option>
                ))}
              </select>
              {errors.format && (
                <p className="mt-1 text-sm text-red-600">{errors.format.message}</p>
              )}
            </div>
            
            {/* Date */}
            <div>
              <label htmlFor="startDateString" className="block text-sm font-medium text-gray-700 mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="startDateString"
                min={today}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                {...register('startDateString', { required: 'Date is required' })}
              />
              {errors.startDateString && (
                <p className="mt-1 text-sm text-red-600">{errors.startDateString.message}</p>
              )}
            </div>
            
            {/* Time */}
            <div>
              <label htmlFor="startTimeString" className="block text-sm font-medium text-gray-700 mb-1">
                Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                id="startTimeString"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                {...register('startTimeString', { required: 'Time is required' })}
              />
              {errors.startTimeString && (
                <p className="mt-1 text-sm text-red-600">{errors.startTimeString.message}</p>
              )}
            </div>
            
            {/* Base price */}
            <div>
              <label htmlFor="basePrice" className="block text-sm font-medium text-gray-700 mb-1">
                Base Price ($) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="basePrice"
                min="0.01"
                step="0.01"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                {...register('basePrice', { 
                  required: 'Base price is required',
                  min: {
                    value: 0.01,
                    message: 'Base price must be greater than 0'
                  }
                })}
              />
              {errors.basePrice && (
                <p className="mt-1 text-sm text-red-600">{errors.basePrice.message}</p>
              )}
            </div>
          </div>
          
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isCreating}
              loading={isCreating}
            >
              Create Screening
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateScreeningPage;