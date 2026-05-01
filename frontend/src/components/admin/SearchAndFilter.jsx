import { useState } from 'react';
import { useGlobalSearch } from '@hooks/useGlobalSearch';
import { 
  MagnifyingGlassIcon, 
  AdjustmentsHorizontalIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';
import classNames from 'classnames';

const AdminSearchAndFilter = ({ 
  onSearchResults, 
  placeholder = "Search...",
  categories = ['all', 'movies', 'theatres', 'screenings', 'users'],
  className = ''
}) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  
  const { useSearch } = useGlobalSearch();
  
  const { data: searchResults, isLoading } = useSearch(query, 10, {
    enabled: query.length >= 2
  });

  const handleSearch = (newQuery) => {
    setQuery(newQuery);
    if (newQuery.length >= 2 && onSearchResults) {
      onSearchResults(searchResults);
    } else if (newQuery.length < 2 && onSearchResults) {
      onSearchResults(null);
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    if (onSearchResults && searchResults) {
      onSearchResults(searchResults);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setSelectedCategory('all');
    if (onSearchResults) {
      onSearchResults(null);
    }
  };

  return (
    <div className={classNames('space-y-4', className)}>
      {/* Search Input */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
        
        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="absolute right-10 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
        >
          <AdjustmentsHorizontalIcon className="h-5 w-5" />
        </button>
        
        {/* Clear Search */}
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
        
        {/* Loading Indicator */}
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
          </div>
        )}
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium text-gray-700 py-2">Filter by:</span>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={classNames(
                  'px-3 py-1 rounded-full text-sm font-medium transition-colors',
                  selectedCategory === category
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                )}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search Stats */}
      {searchResults && query.length >= 2 && (
        <div className="text-sm text-gray-500">
          Found {(searchResults.movies?.length || 0) + 
                  (searchResults.theatres?.length || 0) + 
                  (searchResults.screenings?.length || 0) + 
                  (searchResults.users?.length || 0)} results for "{query}"
        </div>
      )}
    </div>
  );
};

export default AdminSearchAndFilter;