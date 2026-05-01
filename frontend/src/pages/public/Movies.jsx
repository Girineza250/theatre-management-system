// src/pages/public/Movies.jsx - Updated to handle data mismatches

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useMovies } from '@hooks/useMovies';
import { useScreenings } from '@hooks/useScreenings';
import MovieCard from '@components/features/movies/MovieCard';
import GenreFilter from '@components/features/movies/GenreFilter';
import LoadingSpinner from '@components/common/LoadingSpinner';
import Button from '@components/common/Button';
import Tabs from '@components/common/Tabs';
import { formatDate, formatEnumValue } from '@utils/formatUtils';
import { FilmIcon, CalendarIcon, ClockIcon } from '@heroicons/react/24/outline';

const MoviesPage = () => {
  const location = useLocation();
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  
  // Check URL params for status filter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const status = params.get('status');
    if (status === 'upcoming') {
      setActiveTab(1); // Set to "Coming Soon" tab
    }
  }, [location]);
  
  const { useGetMovies, useGetGenres } = useMovies();
  const { useGetUpcomingScreenings } = useScreenings();
  
  // Fetch movies with optional genre filter
  const { 
    data: movies = [], 
    isLoading: isLoadingMovies 
  } = useGetMovies(selectedGenre ? { genre: selectedGenre } : {});

  // Fetch all movie genres
  const { 
    data: genres = [], 
    isLoading: isLoadingGenres 
  } = useGetGenres();
  
  // Fetch upcoming screenings (for the next 7 days)
  const { 
    data: upcomingScreenings = {}, 
    isLoading: isLoadingScreenings 
  } = useGetUpcomingScreenings();
  
  // Format today's date as YYYY-MM-DD for date input
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0];
  const nextWeek = new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0];
  
  // Set default date to today if not set
  useEffect(() => {
    if (!selectedDate) {
      setSelectedDate(today);
    }
  }, [today]);

  // Debug movies data
  useEffect(() => {
    if (movies.length > 0) {
      console.log("Sample movie data:", movies[0]);
    }
  }, [movies]);

  // Filter movies by genre if selected
  const filteredMovies = selectedGenre
    ? movies.filter(movie => movie.genre === selectedGenre)
    : movies;
  
  // Group movies into "Now Playing" and "Coming Soon" categories
  // Add fallback logic to handle missing status property
  const nowPlayingMovies = filteredMovies.filter(movie => 
    movie.status === 'NOW_PLAYING' || 
    (movie.releaseDate && new Date(movie.releaseDate) <= new Date())
  );
  
  const upcomingMovies = filteredMovies.filter(movie => 
    movie.status === 'UPCOMING' || 
    (movie.releaseDate && new Date(movie.releaseDate) > new Date())
  );
  
  // Get screenings for selected date
  const screeningsForSelectedDate = upcomingScreenings[selectedDate] || [];
  
  // Group screenings by movie
  const screeningsByMovie = screeningsForSelectedDate.reduce((acc, screening) => {
    if (!acc[screening.movieId]) {
      acc[screening.movieId] = [];
    }
    acc[screening.movieId].push(screening);
    return acc;
  }, {});
  
  // Loading state
  if (isLoadingMovies) {
    return <LoadingSpinner size="lg" />;
  }

  // Tab content for "Movies" view
  const moviesTabContent = (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {(activeTab === 0 ? nowPlayingMovies : upcomingMovies).map(movie => (
        <MovieCard key={movie.id || `movie-${Math.random()}`} movie={movie} />
      ))}
    </div>
  );
  
  // Tab content for "Screenings" view
  const screeningsTabContent = (
    <div className="space-y-8">
      {/* Date selector */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="w-full md:w-auto">
          <label htmlFor="date-select" className="block text-sm font-medium text-gray-700 mb-1">
            Select Date
          </label>
          <input
            id="date-select"
            type="date"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={today}
            max={nextWeek}
          />
        </div>
        
        {/* Quick date selectors */}
        <div className="flex flex-wrap gap-2 mt-3 md:mt-0">
          <Button 
            variant={selectedDate === today ? "primary" : "outline"} 
            size="sm"
            onClick={() => setSelectedDate(today)}
          >
            Today
          </Button>
          <Button 
            variant={selectedDate === tomorrow ? "primary" : "outline"} 
            size="sm"
            onClick={() => setSelectedDate(tomorrow)}
          >
            Tomorrow
          </Button>
        </div>
      </div>
      
      {/* Show screenings for selected date */}
      {isLoadingScreenings ? (
        <LoadingSpinner />
      ) : screeningsForSelectedDate.length > 0 ? (
        <div className="space-y-6">
          {Object.entries(screeningsByMovie).map(([movieId, screenings]) => {
            // Find the movie info
            const movie = movies.find(m => m.id && m.id.toString() === movieId.toString());
            if (!movie) return null;
            
            return (
              <div key={movieId} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="md:flex">
                  {/* Movie poster */}
                  <div className="md:flex-shrink-0 h-48 md:h-auto md:w-48 bg-gray-200">
                    {(movie.posterUrl || movie.posterImageUrl) ? (
                      <img 
                        src={movie.posterUrl || movie.posterImageUrl} 
                        alt={movie.title} 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <FilmIcon className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  {/* Movie info and screenings */}
                  <div className="p-4 flex-1">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{movie.title}</h3>
                        <div className="text-sm text-gray-500 mb-2">
                          {movie.genre && (
                            <span className="mr-2">{formatEnumValue(movie.genre)}</span>
                          )}
                          {(movie.durationMinutes || movie.duration) && (
                            <span>{movie.durationMinutes || movie.duration} min</span>
                          )}
                        </div>
                        
                        <div className="mb-4">
                          <Link 
                            to={`/movies/${movie.id}`}
                            className="text-sm text-primary-600 hover:text-primary-700"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                    
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Available Screenings on {formatDate(selectedDate, { dateStyle: 'full', timeStyle: undefined })}
                    </h4>
                    
                    <div className="flex flex-wrap gap-2">
                      {screenings.sort((a, b) => new Date(a.startTime) - new Date(b.startTime)).map(screening => (
                        <Link 
                          key={screening.id} 
                          to={`/screening/${screening.id}/seats`}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium bg-white hover:bg-gray-50 shadow-sm"
                        >
                          <ClockIcon className="h-4 w-4 mr-1 text-gray-500" />
                          {formatDate(screening.startTime, { dateStyle: undefined, timeStyle: 'short' })}
                          <span className="ml-1 text-xs text-gray-500">({formatEnumValue(screening.format)})</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-12 flex flex-col items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
          <CalendarIcon className="w-12 h-12 text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No screenings found</h3>
          <p className="text-gray-500">
            There are no screenings scheduled for this date.
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Movies</h1>
        
        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            {!isLoadingGenres && genres.length > 0 && (
              <GenreFilter
                genres={genres}
                selectedGenre={selectedGenre}
                onChange={setSelectedGenre}
              />
            )}
          </div>
        </div>
      </div>
      
      {/* Tabs for different views */}
      <Tabs
        tabs={[
          {
            label: "Now Playing",
            content: moviesTabContent
          },
          {
            label: "Coming Soon",
            content: moviesTabContent
          },
          {
            label: "Screenings",
            icon: <CalendarIcon className="h-5 w-5" />,
            content: screeningsTabContent
          }
        ]}
        defaultTab={activeTab}
        onChange={setActiveTab}
      />
      
      {/* Empty state when no movies found */}
      {(activeTab === 0 && nowPlayingMovies.length === 0) || 
       (activeTab === 1 && upcomingMovies.length === 0) ? (
        <div className="py-12 flex flex-col items-center justify-center bg-gray-50 rounded-lg border border-gray-200 mt-6">
          <FilmIcon className="w-12 h-12 text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No movies found</h3>
          <p className="text-gray-500 mb-4">
            {selectedGenre 
              ? `There are no ${activeTab === 0 ? 'now playing' : 'upcoming'} movies in the ${selectedGenre.replace('_', ' ')} genre.` 
              : `There are no ${activeTab === 0 ? 'now playing' : 'upcoming'} movies available at this time.`}
          </p>
          {selectedGenre && (
            <Button 
              variant="outline"
              onClick={() => setSelectedGenre(null)}
            >
              Clear Filter
            </Button>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default MoviesPage;