// src/pages/public/MovieDetails.jsx

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMovies } from '@hooks/useMovies';
import { useScreenings } from '@hooks/useScreenings';
import LoadingSpinner from '@components/common/LoadingSpinner';
import NotFound from '@components/common/NotFound';
import Button from '@components/common/Button';
import { formatDate, formatDuration, formatEnumValue } from '@utils/formatUtils';
import { 
  ClockIcon, 
  CalendarIcon, 
  FilmIcon,
  TicketIcon
} from '@heroicons/react/24/outline';

const MovieDetailsPage = () => {
  const { id } = useParams();
  const [selectedDate, setSelectedDate] = useState('');
  const [screeningsByDate, setScreeningsByDate] = useState({});
  const [availableDates, setAvailableDates] = useState([]);
  
  // Fetch movie details
  const { useGetMovie } = useMovies();
  const { 
    data: movie,
    isLoading: isLoadingMovie,
    error: movieError
  } = useGetMovie(id);
  
  // Fetch screenings for this movie
  const { useGetMovieScreenings } = useScreenings();
  const {
    data: screeningsData,
    isLoading: isLoadingScreenings,
    error: screeningsError
  } = useGetMovieScreenings(id, 7); // Get screenings for next 7 days
  
  // Process screenings data when it loads
  useEffect(() => {
    if (!isLoadingScreenings && screeningsData) {
      let processedScreenings = {};
      let dates = [];
      
      // Handle different possible response formats
      if (typeof screeningsData === 'object') {
        if (screeningsData.data) {
          // Handle API response with data property
          processedScreenings = screeningsData.data;
        } else {
          // Direct object of date -> screenings mapping
          processedScreenings = screeningsData;
        }
      }
      
      // Extract available dates
      dates = Object.keys(processedScreenings).sort();
      
      // Set state
      setScreeningsByDate(processedScreenings);
      setAvailableDates(dates);
      
      // Set default selected date to the first available date
      if (dates.length > 0 && !selectedDate) {
        setSelectedDate(dates[0]);
      }
    }
  }, [screeningsData, isLoadingScreenings, selectedDate]);
  
  // Debug movie data
  useEffect(() => {
    if (movie) {
      console.log("Movie details:", movie);
    }
    if (screeningsData) {
      console.log("Screenings data:", screeningsData);
    }
  }, [movie, screeningsData]);
  
  // Loading state
  if (isLoadingMovie) {
    return <LoadingSpinner size="lg" />;
  }
  
  // Error state
  if (movieError || !movie) {
    return <NotFound message="Movie not found" />;
  }

  // Extract properties with support for both naming conventions
  const {
    title,
    description,
    durationMinutes,
    duration,
    genre,
    rating,
    releaseDate,
    director,
    cast,
    trailerUrl,
    posterUrl,
    posterImageUrl
  } = movie;

  // Use either posterUrl or posterImageUrl (backend might use different property names)
  const imageUrl = posterUrl || posterImageUrl;
  
  // Use either durationMinutes or duration
  const movieDuration = durationMinutes || duration;
  
  // Get screenings for the selected date
  const screeningsForSelectedDate = selectedDate ? (screeningsByDate[selectedDate] || []) : [];
  
  // Group screenings by theatre
  const screeningsByTheatre = screeningsForSelectedDate.reduce((acc, screening) => {
    if (!acc[screening.theatreId]) {
      acc[screening.theatreId] = {
        theatreName: screening.theatreName,
        screenings: []
      };
    }
    
    acc[screening.theatreId].screenings.push(screening);
    return acc;
  }, {});
  
  // Format date for display
  const formatDateHeading = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Check if the date is today or tomorrow
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      // Format as day of week + date
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Movie details section */}
        <div className="flex flex-col md:flex-row gap-8 mb-12">
          {/* Movie poster */}
          <div className="flex-shrink-0">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={`${title} poster`}
                className="w-full md:w-80 rounded-lg shadow-lg"
              />
            ) : (
              <div className="w-full md:w-80 h-120 bg-gray-200 rounded-lg flex items-center justify-center">
                <FilmIcon className="h-24 w-24 text-gray-400" />
              </div>
            )}
          </div>
          
          {/* Movie details */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{title}</h1>
            
            <div className="flex flex-wrap items-center mb-4 text-sm text-gray-600 gap-3">
              {rating && (
                <span className="px-2 py-1 bg-gray-200 rounded font-medium">{rating}</span>
              )}
              {genre && (
                <span>{formatEnumValue(genre)}</span>
              )}
              {movieDuration && (
                <span className="flex items-center">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  {formatDuration(movieDuration)}
                </span>
              )}
              {releaseDate && (
                <span className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  {formatDate(releaseDate, { dateStyle: 'medium', timeStyle: undefined })}
                </span>
              )}
            </div>
            
            <h2 className="text-xl font-semibold mb-2">Overview</h2>
            <p className="text-gray-700 mb-6">{description || 'No description available.'}</p>
            
            {director && (
              <div className="mb-2">
                <span className="font-semibold">Director:</span> {director}
              </div>
            )}
            
            {cast && (
              <div className="mb-4">
                <span className="font-semibold">Cast:</span> {cast}
              </div>
            )}
            
            {trailerUrl && (
              <div className="mb-6">
                <a
                  href={trailerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
                >
                  Watch Trailer
                </a>
              </div>
            )}
          </div>
        </div>
        
        {/* Screenings section */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-6">Available Screenings</h2>
          
          {isLoadingScreenings ? (
            <LoadingSpinner />
          ) : availableDates.length > 0 ? (
            <div>
              {/* Date selector */}
              <div className="flex flex-wrap gap-2 mb-6">
                {availableDates.map(date => (
                  <button
                    key={date}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      selectedDate === date 
                        ? 'bg-primary-600 text-white' 
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    }`}
                    onClick={() => setSelectedDate(date)}
                  >
                    {formatDateHeading(date)}
                  </button>
                ))}
              </div>
              
              {/* Screenings by theatre */}
              {Object.keys(screeningsByTheatre).length > 0 ? (
                <div className="space-y-6">
                  {Object.entries(screeningsByTheatre).map(([theatreId, { theatreName, screenings }]) => (
                    <div key={theatreId} className="bg-white p-6 rounded-lg shadow-md">
                      <h3 className="text-lg font-bold mb-4">{theatreName}</h3>
                      
                      <div className="flex flex-wrap gap-3">
                        {screenings
                          .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
                          .map(screening => (
                            <Link
                              key={screening.id}
                              to={`/screening/${screening.id}/seats`}
                              className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                              <ClockIcon className="h-4 w-4 mr-2 text-gray-500" />
                              {formatDate(screening.startTime, { dateStyle: undefined, timeStyle: 'short' })}
                              {screening.format && (
                                <span className="ml-2 text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                                  {formatEnumValue(screening.format)}
                                </span>
                              )}
                            </Link>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No screenings available for {formatDateHeading(selectedDate)}.</p>
                  <p className="text-gray-500 mt-1">Please select another date or check back later.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <div className="inline-flex flex-col items-center mb-4">
                <TicketIcon className="h-12 w-12 text-gray-400 mb-2" />
                <h3 className="text-lg font-medium text-gray-900">No screenings available</h3>
              </div>
              <p className="text-gray-500 max-w-md mx-auto mb-4">
                There are currently no screenings scheduled for this movie. 
                Please check back later or browse other movies.
              </p>
              <Link to="/movies">
                <Button variant="outline">Browse Movies</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieDetailsPage;