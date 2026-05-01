// src/pages/public/Home.jsx - Updated to handle potential data mismatches

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useMovies } from '@hooks/useMovies';
import { useScreenings } from '@hooks/useScreenings'; 
import MovieCard from '@components/features/movies/MovieCard';
import MovieCarousel from '@components/features/movies/MovieCarousel';
import FeaturedMovie from '@components/features/movies/FeaturedMovie';
import GenreFilter from '@components/features/movies/GenreFilter';
import LoadingSpinner from '@components/common/LoadingSpinner';
import Button from '@components/common/Button';
import { formatDate } from '@utils/formatUtils';
import useResponsive from '@hooks/useResponsive';

// Import hero icons
import { ChevronRightIcon } from '@heroicons/react/24/solid';
import { FilmIcon } from '@heroicons/react/24/outline';

const Home = () => {
  const { isMobile } = useResponsive();
  const [selectedGenre, setSelectedGenre] = useState(null);
  const { useGetMovies, useGetGenres } = useMovies();
  const { useGetUpcomingScreenings } = useScreenings();

  // Fetch now playing movies
  const { 
    data: nowPlayingMovies = [], 
    isLoading: isLoadingNowPlaying 
  } = useGetMovies({ status: 'NOW_PLAYING' });

  // Fetch upcoming movies
  const { 
    data: upcomingMovies = [], 
    isLoading: isLoadingUpcoming 
  } = useGetMovies({ status: 'UPCOMING' });

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

  // Debug information
  useEffect(() => {
    if (nowPlayingMovies.length > 0) {
      console.log("Now playing movies sample:", nowPlayingMovies[0]);
    }
    if (upcomingMovies.length > 0) {
      console.log("Upcoming movies sample:", upcomingMovies[0]);
    }
  }, [nowPlayingMovies, upcomingMovies]);

  // Filter movies by genre if a genre is selected
  const filteredNowPlayingMovies = selectedGenre
    ? nowPlayingMovies.filter(movie => movie.genre === selectedGenre)
    : nowPlayingMovies;

  // Choose a featured movie (either the first upcoming movie or the first now playing)
  const featuredMovie = upcomingMovies.length > 0 
    ? upcomingMovies[0] 
    : nowPlayingMovies.length > 0 
      ? nowPlayingMovies[0] 
      : null;

  // Loading state
  if (isLoadingNowPlaying && isLoadingUpcoming) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen">
      {/* Hero section with featured movie */}
      {featuredMovie && (
        <FeaturedMovie movie={featuredMovie} />
      )}

      {/* Now Playing Movies Section */}
      <section className="py-8 px-4 md:px-8 bg-white">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h2 className="text-2xl font-bold mb-4 md:mb-0">Now Playing</h2>
            
            {/* Genre filter */}
            {!isLoadingGenres && genres.length > 0 && (
              <GenreFilter
                genres={genres}
                selectedGenre={selectedGenre}
                onChange={setSelectedGenre}
              />
            )}
          </div>

          {isLoadingNowPlaying ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : filteredNowPlayingMovies.length > 0 ? (
            <div>
              {isMobile ? (
                // Mobile view: Carousel
                <MovieCarousel movies={filteredNowPlayingMovies} />
              ) : (
                // Desktop view: Grid
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredNowPlayingMovies.slice(0, 8).map(movie => (
                    <MovieCard key={movie.id || `movie-${Math.random()}`} movie={movie} />
                  ))}
                </div>
              )}

              {filteredNowPlayingMovies.length > 8 && (
                <div className="mt-6 text-center">
                  <Link to="/movies">
                    <Button 
                      variant="outline"
                      icon={<ChevronRightIcon className="h-5 w-5 ml-1" />}
                      iconPosition="right"
                    >
                      View All Movies
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
              <FilmIcon className="w-12 h-12 text-gray-400 mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No movies found</h3>
              <p className="text-gray-500 mb-4">
                {selectedGenre 
                  ? `There are no movies in the ${selectedGenre.replace('_', ' ')} genre currently playing.` 
                  : 'There are no movies currently playing.'}
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
          )}
        </div>
      </section>

      {/* Upcoming Movies Section */}
      {upcomingMovies.length > 0 && (
        <section className="py-8 px-4 md:px-8 bg-gray-50">
          <div className="container mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Coming Soon</h2>
              <Link to="/movies?status=upcoming" className="text-primary-600 hover:text-primary-700 font-medium flex items-center">
                View All <ChevronRightIcon className="h-5 w-5 ml-1" />
              </Link>
            </div>

            {isLoadingUpcoming ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {upcomingMovies.slice(0, 4).map(movie => (
                  <MovieCard 
                    key={movie.id || `movie-${Math.random()}`} 
                    movie={movie} 
                    isUpcoming={true} 
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Today's Screenings Section */}
      {!isLoadingScreenings && Object.keys(upcomingScreenings).length > 0 && (
        <section className="py-8 px-4 md:px-8 bg-white">
          <div className="container mx-auto">
            <h2 className="text-2xl font-bold mb-6">Today's Screenings</h2>

            <div className="space-y-6">
              {Object.entries(upcomingScreenings).slice(0, 1).map(([date, screenings]) => (
                <div key={date} className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="bg-gray-50 py-3 px-4 border-b">
                    <h3 className="text-lg font-medium text-gray-900">
                      {formatDate(date, { dateStyle: 'full' })}
                    </h3>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {screenings.slice(0, 5).map(screening => (
                      <div key={screening.id} className="p-4 flex flex-col md:flex-row md:items-center">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-lg font-medium text-gray-900 truncate">
                            {screening.movieTitle}
                          </h4>
                          <p className="mt-1 text-sm text-gray-500">
                            {screening.theatreName} • Screen {screening.screenNumber} • {screening.format}
                          </p>
                        </div>
                        <div className="mt-4 md:mt-0 md:ml-6">
                          <div className="flex items-center space-x-3">
                            <span className="text-sm font-medium text-gray-900">
                              {formatDate(screening.startTime, { timeStyle: 'short', dateStyle: undefined })}
                            </span>
                            <Link to={`/screening/${screening.id}/seats`}>
                              <Button variant="primary" size="sm">
                                Book Now
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-gray-50 py-3 px-4 border-t text-center">
                    <Link 
                      to="/movies" 
                      className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                      View Full Schedule
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Promo/Advertisement Section */}
      <section className="py-12 px-4 md:px-8 bg-gray-900 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Become a Premium Member</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Get exclusive discounts, early access to tickets, and special promotions.
          </p>
          <Button variant="secondary" size="lg">
            Learn More
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Home;