import { useState } from 'react';
import apiClient from '@api/client';  // ✅ Use apiClient instead of axios
import Button from '@components/common/Button';
import { useToast } from '@contexts/ToastContext';
import { 
  PlusCircleIcon, 
  FilmIcon, 
  BuildingStorefrontIcon, 
  CalendarIcon,
  CheckCircleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const DataSeeder = () => {
  const { showSuccess, showError } = useToast();
  const [isLoading, setIsLoading] = useState({
    movies: false,
    theatres: false,
    screenings: false,
    seats: false,
    all: false
  });
  const [results, setResults] = useState(null);

  const seedData = async (endpoint, type) => {
    setIsLoading(prev => ({ ...prev, [type]: true }));
    
    try {
      // ✅ Use apiClient which has correct baseURL and auth headers
      const response = await apiClient.post(`/seed/${endpoint}`);
      
      if (response.data?.success || response.success) {
        const data = response.data?.data || response.data || response;
        showSuccess(`${type.charAt(0).toUpperCase() + type.slice(1)} seeded successfully!`);
        setResults(data);
      } else {
        showError(response.data?.message || `Failed to seed ${type}`);
      }
    } catch (error) {
      console.error(`Error seeding ${type}:`, error);
      showError(error.response?.data?.message || error.message || `Error seeding ${type}`);
    } finally {
      setIsLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  const seedMovies = () => seedData('movies', 'movies');
  const seedTheatres = () => seedData('theatres', 'theatres');
  const seedScreenings = () => seedData('screenings', 'screenings');
  const initializeSeats = () => seedData('seats', 'seats');
  const seedAll = () => seedData('all', 'all');

  const ResultsDisplay = () => {
    if (!results) return null;

    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Seeding Results</h3>
        
        <div className="space-y-2">
          {results.movies && (
            <div className="flex items-center">
              <FilmIcon className="h-5 w-5 text-gray-400 mr-2" />
              <span className="mr-2">Movies:</span>
              <span className="font-medium">{results.movies.seeded} seeded</span>
              {results.movies.skipped > 0 && (
                <span className="ml-2 text-gray-500">({results.movies.skipped} skipped)</span>
              )}
            </div>
          )}

          {results.theatres && (
            <div className="flex items-center">
              <BuildingStorefrontIcon className="h-5 w-5 text-gray-400 mr-2" />
              <span className="mr-2">Theatres:</span>
              <span className="font-medium">{results.theatres.seeded} seeded</span>
              {results.theatres.skipped > 0 && (
                <span className="ml-2 text-gray-500">({results.theatres.skipped} skipped)</span>
              )}
            </div>
          )}

          {results.screenings && (
            <div className="flex items-center">
              <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
              <span className="mr-2">Screenings:</span>
              <span className="font-medium">{results.screenings.seeded} seeded</span>
            </div>
          )}

          {results.screensInitialized && (
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 text-gray-400 mr-2" />
              <span className="mr-2">Screens with seats:</span>
              <span className="font-medium">{results.screensInitialized} initialized</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Data Initialization</h2>
        <div className="text-sm text-gray-500">Admin tools for seeding the database</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Button
          variant="outline"
          size="lg"
          icon={<FilmIcon className="h-5 w-5 mr-2" />}
          onClick={seedMovies}
          loading={isLoading.movies}
          className="w-full"
        >
          Seed Movies
        </Button>

        <Button
          variant="outline"
          size="lg"
          icon={<BuildingStorefrontIcon className="h-5 w-5 mr-2" />}
          onClick={seedTheatres}
          loading={isLoading.theatres}
          className="w-full"
        >
          Seed Theatres
        </Button>

        <Button
          variant="outline"
          size="lg"
          icon={<CheckCircleIcon className="h-5 w-5 mr-2" />}
          onClick={initializeSeats}
          loading={isLoading.seats}
          className="w-full"
        >
          Initialize Seats
        </Button>

        <Button
          variant="outline"
          size="lg"
          icon={<CalendarIcon className="h-5 w-5 mr-2" />}
          onClick={seedScreenings}
          loading={isLoading.screenings}
          className="w-full"
        >
          Seed Screenings
        </Button>

        <Button
          variant="primary"
          size="lg"
          icon={<PlusCircleIcon className="h-5 w-5 mr-2" />}
          onClick={seedAll}
          loading={isLoading.all}
          className="w-full md:col-span-2"
        >
          Seed All Data
        </Button>
      </div>

      <div className="bg-blue-50 text-blue-800 p-4 rounded-lg mb-4">
        <div className="flex">
          <ChartBarIcon className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-medium">About Data Seeding</h3>
            <p className="text-sm mt-1">
              These tools help initialize your system with sample data. Use the buttons above to add 
              movies, theatres, and screenings with a single click. Each action is safe to run multiple 
              times as it will skip existing items.
            </p>
          </div>
        </div>
      </div>

      <ResultsDisplay />
    </div>
  );
};

export default DataSeeder;