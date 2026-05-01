// src/components/features/movies/FeaturedMovie.jsx - Updated to handle data mismatches

import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { formatDate, formatDuration } from '@utils/formatUtils';
import Button from '@components/common/Button';
import { CalendarIcon, ClockIcon, TicketIcon } from '@heroicons/react/24/outline';

const FeaturedMovie = ({ movie }) => {
  if (!movie) return null;

  // Extract properties with support for both naming conventions
  const {
    id,
    title,
    description,
    durationMinutes,
    duration,
    genre,
    rating,
    releaseDate,
    posterUrl,
    posterImageUrl
  } = movie;

  // Use either posterUrl or posterImageUrl (backend might use different property names)
  const imageUrl = posterUrl || posterImageUrl;
  
  // Use either durationMinutes or duration
  const movieDuration = durationMinutes || duration;

  // Create a gradient overlay for better text readability
  const backgroundStyle = {
    backgroundImage: imageUrl 
      ? `linear-gradient(to right, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.4)), url(${imageUrl})`
      : 'linear-gradient(to right, #1E40AF, #3B82F6)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };

  // Determine if movie is upcoming based on release date
  const isUpcoming = releaseDate ? new Date(releaseDate) > new Date() : false;

  return (
    <div 
      className="relative min-h-[500px] flex items-center text-white py-16"
      style={backgroundStyle}
    >
      <div className="container mx-auto px-4 md:px-8 z-10">
        <div className="max-w-2xl">
          {/* Release status badge */}
          {isUpcoming ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mb-4">
              Coming Soon
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mb-4">
              Now Playing
            </span>
          )}

          {/* Movie title */}
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{title}</h1>
          
          {/* Movie metadata */}
          <div className="flex flex-wrap items-center text-sm md:text-base text-gray-300 mb-6 space-x-4">
            {rating && (
              <span className="px-2 py-1 bg-gray-800 rounded font-medium">
                {rating}
              </span>
            )}
            {genre && (
              <span>{genre.replace('_', ' ')}</span>
            )}
            {movieDuration && (
              <span className="flex items-center">
                <ClockIcon className="w-4 h-4 mr-1" />
                {formatDuration(movieDuration)}
              </span>
            )}
            {releaseDate && (
              <span className="flex items-center">
                <CalendarIcon className="w-4 h-4 mr-1" />
                {formatDate(releaseDate, { dateStyle: 'medium', timeStyle: undefined })}
              </span>
            )}
          </div>
          
          {/* Movie description */}
          <p className="text-gray-200 mb-8 text-base md:text-lg line-clamp-3 md:line-clamp-4">
            {description}
          </p>
          
          {/* CTA buttons */}
          <div className="flex flex-wrap gap-4">
            <Link to={`/movies/${id}`}>
              <Button 
                variant="primary" 
                size="lg"
                icon={<TicketIcon className="w-5 h-5 mr-2" />}
                iconPosition="left"
              >
                Book Tickets
              </Button>
            </Link>
            <Link to={`/movies/${id}`}>
              <Button 
                variant="outline" 
                size="lg"
                className="text-white border-white hover:bg-white hover:text-gray-900"
              >
                More Details
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

FeaturedMovie.propTypes = {
  movie: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    duration: PropTypes.number, // Support both naming conventions
    durationMinutes: PropTypes.number, // Support both naming conventions
    genre: PropTypes.string,
    rating: PropTypes.string,
    releaseDate: PropTypes.string,
    posterUrl: PropTypes.string, // Support both naming conventions
    posterImageUrl: PropTypes.string // Support both naming conventions
  }).isRequired
};

export default FeaturedMovie;