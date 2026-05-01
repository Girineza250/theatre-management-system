import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@contexts/AuthContext';
import { useGlobalSearch } from '@hooks/useGlobalSearch';
import { formatDate, formatEnumValue } from '@utils/formatUtils';
import { 
  MagnifyingGlassIcon,
  FilmIcon,
  BuildingStorefrontIcon,
  CalendarIcon,
  UserIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import classNames from 'classnames';

const GlobalSearch = ({ className = '', onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const { user, hasRole } = useAuth();
  const { useSearch } = useGlobalSearch();
  const searchRef = useRef(null);
  const resultsRef = useRef(null);
  
  // Use the search hook with debouncing
  const { 
    data: searchResults, 
    isLoading, 
    error 
  } = useSearch(query, 3, {
    enabled: query.length >= 2
  });

  // Extract results with fallbacks
  const results = {
    movies: searchResults?.movies || [],
    theatres: searchResults?.theatres || [],
    screenings: searchResults?.screenings || [],
    users: (hasRole(['ROLE_ADMIN']) && searchResults?.users) || []
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      
      const allResults = [
        ...results.movies.map((item, idx) => ({ type: 'movie', item, index: idx })),
        ...results.theatres.map((item, idx) => ({ type: 'theatre', item, index: idx })),
        ...results.screenings.map((item, idx) => ({ type: 'screening', item, index: idx })),
        ...results.users.map((item, idx) => ({ type: 'user', item, index: idx }))
      ];
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < allResults.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : allResults.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && allResults[selectedIndex]) {
            handleResultClick(allResults[selectedIndex].type, allResults[selectedIndex].item);
          }
          break;
        case 'Escape':
          handleClose();
          break;
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex]);
  
  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleInputChange = (e) => {
    setQuery(e.target.value);
    setIsOpen(e.target.value.length >= 2);
    setSelectedIndex(-1);
  };
  
  const handleInputFocus = () => {
    if (query.length >= 2) {
      setIsOpen(true);
    }
  };
  
  const handleResultClick = (type, item) => {
    switch (type) {
      case 'movie':
        onNavigate(`/movies/${item.id}`);
        break;
      case 'theatre':
        if (hasRole(['ROLE_ADMIN', 'ROLE_MANAGER'])) {
          onNavigate(`/admin/theatres/${item.id}`);
        }
        break;
      case 'screening':
        onNavigate(`/screening/${item.id}/seats`);
        break;
      case 'user':
        if (hasRole(['ROLE_ADMIN'])) {
          onNavigate(`/admin/users/${item.id}`);
        }
        break;
    }
    handleClose();
  };
  
  const handleClose = () => {
    setIsOpen(false);
    setQuery('');
    setSelectedIndex(-1);
    if (onClose) onClose();
  };
  
  const getTotalResults = () => {
    return results.movies.length + results.theatres.length + 
           results.screenings.length + results.users.length;
  };
  
  const getResultIndex = (sectionType, itemIndex) => {
    let index = 0;
    
    if (sectionType === 'movie') return index + itemIndex;
    index += results.movies.length;
    
    if (sectionType === 'theatre') return index + itemIndex;
    index += results.theatres.length;
    
    if (sectionType === 'screening') return index + itemIndex;
    index += results.screenings.length;
    
    if (sectionType === 'user') return index + itemIndex;
    
    return -1;
  };
  
  const SearchResultItem = ({ type, item, index, icon: Icon, onClick }) => {
    const resultIndex = getResultIndex(type, index);
    const isSelected = selectedIndex === resultIndex;
    
    return (
      <button
        className={classNames(
          'w-full p-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none',
          'flex items-center space-x-3 transition-colors duration-150',
          isSelected && 'bg-gray-50'
        )}
        onClick={() => onClick(type, item)}
      >
        <Icon className="h-5 w-5 text-gray-400 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          {type === 'movie' && (
            <div>
              <p className="text-sm font-medium text-gray-900 truncate">
                {item.title}
              </p>
              <p className="text-xs text-gray-500">
                {item.genre && formatEnumValue(item.genre)} 
                {item.genre && item.rating && ' • '}
                {item.rating}
                {item.durationMinutes && ` • ${item.durationMinutes} min`}
              </p>
            </div>
          )}
          
          {type === 'theatre' && (
            <div>
              <p className="text-sm font-medium text-gray-900 truncate">
                {item.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {item.address}
                {item.totalScreens && ` • ${item.totalScreens} screens`}
              </p>
            </div>
          )}
          
          {type === 'screening' && (
            <div>
              <p className="text-sm font-medium text-gray-900 truncate">
                {item.movieTitle}
              </p>
              <p className="text-xs text-gray-500">
                {item.theatreName}
                {item.startTime && ` • ${formatDate(item.startTime, { timeStyle: 'short', dateStyle: undefined })}`}
                {item.format && ` • ${formatEnumValue(item.format)}`}
              </p>
            </div>
          )}
          
          {type === 'user' && (
            <div>
              <p className="text-sm font-medium text-gray-900 truncate">
                {item.firstName} {item.lastName} ({item.username})
              </p>
              <p className="text-xs text-gray-500 truncate">
                {item.email}
                {item.role && ` • ${formatEnumValue(item.role)}`}
              </p>
            </div>
          )}
        </div>
      </button>
    );
  };
  
  return (
    <div ref={searchRef} className={classNames('relative', className)}>
      {/* Search Input */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search movies, theatres, screenings..."
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
        />
        {query && (
          <button
            onClick={handleClose}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
      </div>
      
      {/* Search Results Dropdown */}
      {isOpen && (
        <div
          ref={resultsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
        >
          {isLoading ? (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Searching...</p>
            </div>
          ) : error ? (
            <div className="p-4 text-center">
              <p className="text-sm text-red-500">Search failed. Please try again.</p>
            </div>
          ) : getTotalResults() === 0 && query.length >= 2 ? (
            <div className="p-4 text-center">
              <MagnifyingGlassIcon className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No results found for "{query}"</p>
            </div>
          ) : (
            <div className="py-2">
              {/* Movies Section */}
              {results.movies.length > 0 && (
                <div>
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50">
                    Movies
                  </div>
                  {results.movies.map((movie, index) => (
                    <SearchResultItem
                      key={`movie-${movie.id}`}
                      type="movie"
                      item={movie}
                      index={index}
                      icon={FilmIcon}
                      onClick={handleResultClick}
                    />
                  ))}
                </div>
              )}
              
              {/* Theatres Section */}
              {results.theatres.length > 0 && (
                <div>
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50">
                    Theatres
                  </div>
                  {results.theatres.map((theatre, index) => (
                    <SearchResultItem
                      key={`theatre-${theatre.id}`}
                      type="theatre"
                      item={theatre}
                      index={index}
                      icon={BuildingStorefrontIcon}
                      onClick={handleResultClick}
                    />
                  ))}
                </div>
              )}
              
              {/* Screenings Section */}
              {results.screenings.length > 0 && (
                <div>
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50">
                    Screenings
                  </div>
                  {results.screenings.map((screening, index) => (
                    <SearchResultItem
                      key={`screening-${screening.id}`}
                      type="screening"
                      item={screening}
                      index={index}
                      icon={CalendarIcon}
                      onClick={handleResultClick}
                    />
                  ))}
                </div>
              )}
              
              {/* Users Section (Admin only) */}
              {hasRole(['ROLE_ADMIN']) && results.users.length > 0 && (
                <div>
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50">
                    Users
                  </div>
                  {results.users.map((user, index) => (
                    <SearchResultItem
                      key={`user-${user.id}`}
                      type="user"
                      item={user}
                      index={index}
                      icon={UserIcon}
                      onClick={handleResultClick}
                    />
                  ))}
                </div>
              )}
              
              {/* Search Tips */}
              {query.length >= 2 && getTotalResults() > 0 && (
                <div className="border-t border-gray-100 px-3 py-2">
                  <p className="text-xs text-gray-400">
                    Use ↑↓ to navigate, ↵ to select, esc to close
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
