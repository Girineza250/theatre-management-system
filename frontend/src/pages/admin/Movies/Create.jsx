// src/pages/admin/Movies/Create.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMovies } from '@hooks/useMovies';
import { useToast } from '@contexts/ToastContext';
import { formatEnumValue } from '@utils/formatUtils';
import Button from '@components/common/Button';
import Input from '@components/common/Input';
import LoadingSpinner from '@components/common/LoadingSpinner';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const CreateMoviePage = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [imagePreview, setImagePreview] = useState('');
  
  // Get genres for the dropdown
  const { useCreateMovie, useGetGenres } = useMovies();
  const { data: genres = [], isLoading: isLoadingGenres } = useGetGenres();
  
  // Fallback genre list in case API call fails
  const fallbackGenres = [
    { value: "ACTION", name: "Action" },
    { value: "COMEDY", name: "Comedy" },
    { value: "DRAMA", name: "Drama" },
    { value: "FANTASY", name: "Fantasy" },
    { value: "HORROR", name: "Horror" },
    { value: "ROMANCE", name: "Romance" },
    { value: "SCI_FI", name: "Sci-Fi" },
    { value: "THRILLER", name: "Thriller" },
    { value: "ANIMATION", name: "Animation" },
    { value: "DOCUMENTARY", name: "Documentary" },
    { value: "ADVENTURE", name: "Adventure" },
    { value: "CRIME", name: "Crime" },
    { value: "MYSTERY", name: "Mystery" },
    { value: "FAMILY", name: "Family" },
    { value: "MUSICAL", name: "Musical" },
    { value: "WESTERN", name: "Western" }
  ];
  
  
  // Create movie mutation
  const { mutate: createMovie, isPending: isCreating } = useCreateMovie({
    onSuccess: (data) => {
      showSuccess('Movie created successfully');
      navigate(`/admin/movies/${data.id}`);
    },
    onError: (error) => {
      showError(error.message || 'Failed to create movie');
    }
  });
  
  // Form handling
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      durationMinutes: '',
      genre: '',
      director: '',
      cast: '',
      releaseDate: '',
      posterImageUrl: '',
      trailerUrl: '',
      rating: ''
    }
  });
  
  // Watch poster image URL for preview
  const posterUrl = watch('posterImageUrl');
  
  // Update image preview when URL changes
  useEffect(() => {
    if (posterUrl) {
      setImagePreview(posterUrl);
    } else {
      setImagePreview('');
    }
  }, [posterUrl]);
  
  // Form submission handler
  const onSubmit = (data) => {
    // Convert string to number for duration
    data.durationMinutes = Number(data.durationMinutes);
    
    // Create movie
    createMovie(data);
  };
  
  // Movie ratings options
  const ratings = ['G', 'PG', 'PG-13', 'R', 'NC-17', 'NR'];
  
  // Loading state
  if (isLoadingGenres) {
    return <LoadingSpinner />;
  }
  
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
        <h1 className="text-2xl font-bold text-gray-900">Create Movie</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column - Main details */}
            <div className="space-y-6">
              {/* Movie title */}
              <Input
                id="title"
                label="Movie Title"
                placeholder="Enter movie title"
                error={errors.title?.message}
                required
                {...register('title', { 
                  required: 'Title is required',
                  maxLength: {
                    value: 100,
                    message: 'Title cannot exceed 100 characters'
                  }
                })}
              />
              
              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  rows={5}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Enter movie description"
                  {...register('description', {
                    maxLength: {
                      value: 500,
                      message: 'Description cannot exceed 500 characters'
                    }
                  })}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>
              
              {/* Genre */}
              <div>
                <label htmlFor="genre" className="block text-sm font-medium text-gray-700 mb-1">
                  Genre <span className="text-red-500">*</span>
                </label>
                <select
                  id="genre"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  {...register('genre', { required: 'Genre is required' })}
                >
                  <option value="">Select a genre</option>
                  {(genres.length > 0 ? genres : fallbackGenres).map(genre => (
                    <option key={genre.value || genre} value={genre.value || genre}>
                      {genre.name || formatEnumValue(genre)}
                    </option>
                  ))}
                </select>
                {errors.genre && (
                  <p className="mt-1 text-sm text-red-600">{errors.genre.message}</p>
                )}
              </div>
              
              {/* Duration */}
              <Input
                id="durationMinutes"
                type="number"
                label="Duration (minutes)"
                placeholder="Enter duration in minutes"
                min={1}
                error={errors.durationMinutes?.message}
                required
                {...register('durationMinutes', { 
                  required: 'Duration is required',
                  min: {
                    value: 1,
                    message: 'Duration must be at least 1 minute'
                  },
                  max: {
                    value: 999,
                    message: 'Duration cannot exceed 999 minutes'
                  }
                })}
              />
              
              {/* Director */}
              <Input
                id="director"
                label="Director"
                placeholder="Enter director's name"
                error={errors.director?.message}
                {...register('director', {
                  maxLength: {
                    value: 255,
                    message: 'Director name cannot exceed 255 characters'
                  }
                })}
              />
              
              {/* Cast */}
              <Input
                id="cast"
                label="Cast"
                placeholder="Enter main cast (comma separated)"
                error={errors.cast?.message}
                {...register('cast', {
                  maxLength: {
                    value: 255,
                    message: 'Cast info cannot exceed 255 characters'
                  }
                })}
              />
            </div>
            
            {/* Right column - Media and dates */}
            <div className="space-y-6">
              {/* Release date */}
              <div>
                <label htmlFor="releaseDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Release Date
                </label>
                <input
                  type="date"
                  id="releaseDate"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  {...register('releaseDate')}
                />
                {errors.releaseDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.releaseDate.message}</p>
                )}
              </div>
              
              {/* Poster URL */}
              <Input
                id="posterImageUrl"
                label="Poster Image URL"
                placeholder="https://example.com/poster.jpg"
                error={errors.posterImageUrl?.message}
                {...register('posterImageUrl', {
                  pattern: {
                    value: /^(https?:\/\/[\w.-]+(\.[a-z]{2,})?(\/\S*)?|data:image\/(jpeg|png|gif);base64,[a-zA-Z0-9+/]+={0,2})$/i,
                    message: 'Please enter a valid URL or Base64 image data'
                  }
                })}
              />
              
              {/* Image preview */}
              {imagePreview && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Poster Preview
                  </label>
                  <div className="mt-1 h-48 w-32 bg-gray-100 rounded-md overflow-hidden">
                    <img 
                      src={imagePreview}
                      alt="Poster preview" 
                      className="h-full w-full object-cover" 
                      onError={() => setImagePreview('')}
                    />
                  </div>
                </div>
              )}
              
              {/* Trailer URL */}
              <Input
                id="trailerUrl"
                label="Trailer URL"
                placeholder="https://youtube.com/watch?v=xxxxx"
                error={errors.trailerUrl?.message}
                {...register('trailerUrl', {
                  maxLength: {
                    value: 255,
                    message: 'URL cannot exceed 255 characters'
                  },
                  pattern: {
                    value: /^(https?:\/\/)?[\w.-]+\.[a-z]{2,}(\/\S*)?$/i,
                    message: 'Please enter a valid URL'
                  }
                })}
              />
              
              {/* Rating */}
              <div>
                <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1">
                  Rating
                </label>
                <select
                  id="rating"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  {...register('rating')}
                >
                  <option value="">Select a rating</option>
                  {ratings.map(rating => (
                    <option key={rating} value={rating}>
                      {rating}
                    </option>
                  ))}
                </select>
                {errors.rating && (
                  <p className="mt-1 text-sm text-red-600">{errors.rating.message}</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/movies')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={isCreating}
            >
              Create Movie
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateMoviePage;