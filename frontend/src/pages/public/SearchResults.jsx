// src/pages/public/SearchResults.jsx
import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useGlobalSearch } from '@hooks/useGlobalSearch';
import { useAuth } from '@contexts/AuthContext';
import MovieCard from '@components/features/movies/MovieCard';
import LoadingSpinner from '@components/common/LoadingSpinner';
import Tabs from '@components/common/Tabs';
import { formatDate, formatEnumValue } from '@utils/formatUtils';
import { 
  MagnifyingGlassIcon,
  FilmIcon,
  BuildingStorefrontIcon,
  CalendarIcon,
  UserIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [activeTab, setActiveTab] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const { user, hasRole } = useAuth();
  const { 
    useSearch, 
    useSearchMovies, 
    useSearchTheatres, 
    useSearchScreenings, 
    useSearchUsers 
  } = useGlobalSearch();

  // Global search for overview
  const { 
    data: globalResults, 
    isLoading: isLoadingGlobal 
  } = useSearch(query, 10);

  // Individual category searches
  const { 
    data: movieResults, 
    isLoading: isLoadingMovies 
  } = useSearchMovies(query, 20);

  const { 
    data: theatreResults, 
    isLoading: isLoadingTheatres 
  } = useSearchTheatres(query, 20);

  const { 
    data: screeningResults, 
    isLoading: isLoadingScreenings 
  } = useSearchScreenings(query, 20);

  const { 
    data: userResults, 
    isLoading: isLoadingUsers 
  } = useSearchUsers(query, 20, {
    enabled: hasRole(['ROLE_ADMIN'])
  });

  // Extract results with fallbacks
  const results = {
    global: {
      movies: globalResults?.movies || [],
      theatres: globalResults?.theatres || [],
      screenings: globalResults?.screenings || [],
      users: globalResults?.users || []
    },
    movies: movieResults?.movies || [],
    theatres: theatreResults?.theatres || [],
    screenings: screeningResults?.screenings || [],
    users: userResults?.users || []
  };

  const getTotalResults = () => {
    return results.global.movies.length + 
           results.global.theatres.length + 
           results.global.screenings.length + 
           results.global.users.length;
  };

  // All results tab content
  const AllResultsTab = () => (
    <div className="space-y-8">
      {/* Movies Section */}
      {results.global.movies.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <FilmIcon className="h-6 w-6 mr-2 text-primary-600" />
              Movies ({results.global.movies.length})
            </h2>
            <Link 
              to={`/search?q=${encodeURIComponent(query)}&category=movies`}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              View all movies →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {results.global.movies.map(movie => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </section>
      )}

      {/* Theatres Section */}
      {results.global.theatres.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <BuildingStorefrontIcon className="h-6 w-6 mr-2 text-primary-600" />
              Theatres ({results.global.theatres.length})
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.global.theatres.map(theatre => (
              <div key={theatre.id} className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {theatre.name}
                </h3>
                <p className="text-gray-600 text-sm mb-2">{theatre.address}</p>
                <p className="text-gray-500 text-xs">
                  {theatre.totalScreens} screens
                </p>
                {hasRole(['ROLE_ADMIN', 'ROLE_MANAGER']) && (
                  <Link
                    to={`/admin/theatres/${theatre.id}`}
                    className="inline-block mt-3 text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    Manage theatre →
                  </Link>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Screenings Section */}
      {results.global.screenings.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <CalendarIcon className="h-6 w-6 mr-2 text-primary-600" />
              Screenings ({results.global.screenings.length})
            </h2>
          </div>
          <div className="space-y-4">
            {results.global.screenings.map(screening => (
              <div key={screening.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {screening.movieTitle}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {screening.theatreName} • Screen {screening.screenNumber}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {formatDate(screening.startTime)} • {formatEnumValue(screening.format)}
                    </p>
                  </div>
                  <Link
                    to={`/screening/${screening.id}/seats`}
                    className="inline-block mt-3 md:mt-0 bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700"
                  >
                    Book Tickets
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Users Section (Admin only) */}
      {hasRole(['ROLE_ADMIN']) && results.global.users.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <UserIcon className="h-6 w-6 mr-2 text-primary-600" />
              Users ({results.global.users.length})
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.global.users.map(user => (
              <div key={user.id} className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {user.firstName} {user.lastName}
                </h3>
                <p className="text-gray-600 text-sm mb-1">@{user.username}</p>
                <p className="text-gray-600 text-sm mb-2">{user.email}</p>
                <p className="text-gray-500 text-xs mb-3">
                  {formatEnumValue(user.role)}
                </p>
                <Link
                  to={`/admin/users/${user.id}`}
                  className="inline-block text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  View profile →
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );

  // Movies only tab
  const MoviesTab = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {results.movies.map(movie => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  );

  // Theatres only tab
  const TheatresTab = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {results.theatres.map(theatre => (
        <div key={theatre.id} className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {theatre.name}
          </h3>
          <p className="text-gray-600 text-sm mb-2">{theatre.address}</p>
          <p className="text-gray-500 text-xs mb-3">
            {theatre.totalScreens} screens
          </p>
          {theatre.description && (
            <p className="text-gray-600 text-sm mb-3">{theatre.description}</p>
          )}
          {hasRole(['ROLE_ADMIN', 'ROLE_MANAGER']) && (
            <Link
              to={`/admin/theatres/${theatre.id}`}
              className="inline-block text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              Manage theatre →
            </Link>
          )}
        </div>
      ))}
    </div>
  );

  // Screenings only tab
  const ScreeningsTab = () => (
    <div className="space-y-4">
      {results.screenings.map(screening => (
        <div key={screening.id} className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {screening.movieTitle}
              </h3>
              <p className="text-gray-600 text-sm">
                {screening.theatreName} • Screen {screening.screenNumber}
              </p>
              <p className="text-gray-500 text-xs">
                {formatDate(screening.startTime)} • {formatEnumValue(screening.format)}
              </p>
              {screening.basePrice && (
                <p className="text-gray-600 text-sm mt-1">
                  From ${screening.basePrice}
                </p>
              )}
            </div>
            <Link
              to={`/screening/${screening.id}/seats`}
              className="inline-block mt-3 md:mt-0 bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700"
            >
              Book Tickets
            </Link>
          </div>
        </div>
      ))}
    </div>
  );

  // Users only tab (Admin only)
  const UsersTab = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {results.users.map(user => (
        <div key={user.id} className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {user.firstName} {user.lastName}
          </h3>
          <p className="text-gray-600 text-sm mb-1">@{user.username}</p>
          <p className="text-gray-600 text-sm mb-2">{user.email}</p>
          {user.phoneNumber && (
            <p className="text-gray-600 text-sm mb-2">{user.phoneNumber}</p>
          )}
          <p className="text-gray-500 text-xs mb-3">
            {formatEnumValue(user.role)}
          </p>
          <Link
            to={`/admin/users/${user.id}`}
            className="inline-block text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            View profile →
          </Link>
        </div>
      ))}
    </div>
  );

  // Prepare tabs
  const tabs = [
    {
      label: "All Results",
      content: <AllResultsTab />,
      badge: getTotalResults()
    },
    {
      label: "Movies",
      icon: <FilmIcon className="h-4 w-4" />,
      content: isLoadingMovies ? <LoadingSpinner /> : <MoviesTab />,
      badge: results.movies.length
    },
    {
      label: "Theatres",
      icon: <BuildingStorefrontIcon className="h-4 w-4" />,
      content: isLoadingTheatres ? <LoadingSpinner /> : <TheatresTab />,
      badge: results.theatres.length
    },
    {
      label: "Screenings",
      icon: <CalendarIcon className="h-4 w-4" />,
      content: isLoadingScreenings ? <LoadingSpinner /> : <ScreeningsTab />,
      badge: results.screenings.length
    }
  ];

  // Add users tab for admins
  if (hasRole(['ROLE_ADMIN'])) {
    tabs.push({
      label: "Users",
      icon: <UserIcon className="h-4 w-4" />,
      content: isLoadingUsers ? <LoadingSpinner /> : <UsersTab />,
      badge: results.users.length
    });
  }

  if (!query) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <MagnifyingGlassIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Search</h1>
          <p className="text-gray-600">Enter a search term to find movies, theatres, and screenings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Search Results
        </h1>
        <p className="text-gray-600">
          Results for "<span className="font-medium">{query}</span>"
          {getTotalResults() > 0 && (
            <span> • {getTotalResults()} total results</span>
          )}
        </p>
      </div>

      {/* Loading State */}
      {isLoadingGlobal ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : getTotalResults() === 0 ? (
        /* No Results */
        <div className="text-center py-12">
          <MagnifyingGlassIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">No results found</h2>
          <p className="text-gray-600 mb-6">
            We couldn't find anything matching "<span className="font-medium">{query}</span>". 
            Try searching with different keywords.
          </p>
          <div className="space-y-2 text-sm text-gray-500">
            <p>Suggestions:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Check your spelling</li>
              <li>Try more general keywords</li>
              <li>Search for movie titles, theatre names, or actor names</li>
            </ul>
          </div>
        </div>
      ) : (
        /* Results */
        <Tabs
          tabs={tabs}
          defaultTab={activeTab}
          onChange={setActiveTab}
        />
      )}
    </div>
  );
};

export default SearchResultsPage;