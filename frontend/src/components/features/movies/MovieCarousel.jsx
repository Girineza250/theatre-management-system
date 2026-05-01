// src/components/features/movies/MovieCarousel.jsx - Updated to handle data mismatch

import PropTypes from 'prop-types';
import { useState, useRef, useEffect } from 'react';
import MovieCard from './MovieCard';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const MovieCarousel = ({ movies, slidesToShow = 1 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState(0);
  const [isTouching, setIsTouching] = useState(false);
  const carouselRef = useRef(null);

  // Validate movies have id property
  const validMovies = movies.filter(movie => movie && (movie.id !== undefined));

  // Total number of slides
  const totalSlides = Math.ceil(validMovies.length / slidesToShow);

  // Handle next slide
  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === totalSlides - 1 ? 0 : prevIndex + 1
    );
  };

  // Handle previous slide
  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? totalSlides - 1 : prevIndex - 1
    );
  };

  // Auto-scroll setup
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isTouching) {
        nextSlide();
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isTouching]);

  // Touch handling for swipe gestures
  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
    setIsTouching(true);
  };

  const handleTouchMove = (e) => {
    if (!isTouching) return;
    
    const touchCurrentX = e.touches[0].clientX;
    const diff = touchStartX - touchCurrentX;
    
    // Prevent scrolling the page while swiping
    if (Math.abs(diff) > 5) {
      e.preventDefault();
    }
  };

  const handleTouchEnd = (e) => {
    if (!isTouching) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    
    // Swipe threshold (50px)
    if (diff > 50) {
      nextSlide();
    } else if (diff < -50) {
      prevSlide();
    }
    
    setIsTouching(false);
  };

  // If there are no valid movies, don't render the carousel
  if (validMovies.length === 0) {
    return null;
  }

  return (
    <div className="relative group">
      {/* Carousel container */}
      <div 
        ref={carouselRef}
        className="overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          className="flex transition-transform duration-500"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {/* We render the movies in chunks */}
          {Array.from({ length: totalSlides }).map((_, index) => {
            const slideMovies = validMovies.slice(
              index * slidesToShow, 
              index * slidesToShow + slidesToShow
            );
            
            return (
              <div 
                key={index} 
                className="min-w-full flex justify-center gap-4 px-2"
              >
                {slideMovies.map(movie => (
                  <div key={movie.id || `movie-${Math.random()}`} className="w-full max-w-xs">
                    <MovieCard movie={movie} />
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation buttons */}
      {totalSlides > 1 && (
        <>
          <button
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-md text-gray-700 z-10 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
            onClick={prevSlide}
            aria-label="Previous slide"
          >
            <ChevronLeftIcon className="h-6 w-6" />
          </button>
          
          <button
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-md text-gray-700 z-10 transform translate-x-1/2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
            onClick={nextSlide}
            aria-label="Next slide"
          >
            <ChevronRightIcon className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Indicators */}
      {totalSlides > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex ? 'w-8 bg-primary-500' : 'w-2 bg-gray-400'
              }`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

MovieCarousel.propTypes = {
  movies: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      title: PropTypes.string,
      posterUrl: PropTypes.string,
      posterImageUrl: PropTypes.string // Support both naming conventions
    })
  ).isRequired,
  slidesToShow: PropTypes.number
};

export default MovieCarousel;