// src/pages/admin/Screenings/View.jsx
import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useScreenings } from '@hooks/useScreenings';
import { useBookings } from '@hooks/useBookings';
import { useGetTheatres } from '@hooks/useTheatres'; // Import theatres hook directly
import { useToast } from '@contexts/ToastContext';
import { formatDate, formatEnumValue, formatCurrency } from '@utils/formatUtils';
import Button from '@components/common/Button';
import LoadingSpinner from '@components/common/LoadingSpinner';
import NotFound from '@components/common/NotFound';
import {
  ArrowLeftIcon,
  PencilSquareIcon,
  TrashIcon,
  TicketIcon,
  ClockIcon,
  FilmIcon,
  BuildingStorefrontIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

const ViewScreeningPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Get screening details
  const { useGetScreening, useDeleteScreening } = useScreenings();
  const {
    data: screening,
    isLoading: isLoadingScreening,
    error: screeningError
  } = useGetScreening(id);
  
  // Get theatre details for the screening
  const { data: theatresData = [], isLoading: isLoadingTheatres } = useGetTheatres();
  const theatres = Array.isArray(theatresData) ? theatresData : [];
  
  // Get booked seats for the screening
  const { useGetBookedSeats } = useBookings();
  const {
    data: bookedSeatsData = [],
    isLoading: isLoadingSeats
  } = useGetBookedSeats(id);
  
  // Ensure bookedSeats is always an array
  const bookedSeats = Array.isArray(bookedSeatsData) ? bookedSeatsData : 
                      (bookedSeatsData && typeof bookedSeatsData === 'object' ? 
                      Object.values(bookedSeatsData).filter(seat => typeof seat === 'string') : []);
  
  // Delete screening mutation
  const { mutate: deleteScreening, isPending: isPendingDelete } = useDeleteScreening({
    onSuccess: () => {
      showSuccess('Screening deleted successfully');
      navigate('/admin/screenings');
    },
    onError: (error) => {
      showError(error.message || 'Failed to delete screening');
      setIsDeleting(false);
    }
  });
  
  // Handle screening deletion
  const handleDeleteScreening = () => {
    setIsDeleting(true);
    
    // Show confirmation dialog
    if (window.confirm('Are you sure you want to delete this screening? This cannot be undone and will cancel all existing bookings.')) {
      deleteScreening(id);
    } else {
      setIsDeleting(false);
    }
  };
  
  // Find the theatre for this screening
  const getTheatre = () => {
    if (!screening || !theatres.length) return null;
    return theatres.find(theatre => theatre.id === screening.theatreId) || null;
  };
  
  // Get theatre details
  const theatre = getTheatre();
  
  // Loading state
  if (isLoadingScreening || isLoadingSeats || isLoadingTheatres) {
    return <LoadingSpinner />;
  }
  
  // Error state
  if (screeningError || !screening) {
    return <NotFound message="Screening not found" />;
  }
  
  return (
    <div>
      <div className="mb-6 flex items-center">
        <Button
          variant="ghost"
          size="sm"
          className="mr-4"
          onClick={() => navigate('/admin/screenings')}
          icon={<ArrowLeftIcon className="w-4 h-4" />}
        >
          Back to Screenings
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Screening Details</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{screening.movieTitle}</h2>
              <p className="text-gray-600">{formatDate(screening.startTime)}</p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-3">
              <Link to={`/admin/screenings/${id}/edit`}>
                <Button 
                  variant="outline" 
                  size="sm"
                  icon={<PencilSquareIcon className="h-5 w-5 mr-1" />}
                >
                  Edit
                </Button>
              </Link>
              <Button 
                variant="danger" 
                size="sm"
                icon={<TrashIcon className="h-5 w-5 mr-1" />}
                loading={isDeleting || isPendingDelete}
                onClick={handleDeleteScreening}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
        
        {/* Screening details */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left column */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Screening Information</h3>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <FilmIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Movie</h4>
                    <p className="text-gray-600">{screening.movieTitle}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      <Link to={`/admin/movies/${screening.movieId}`} className="text-primary-600 hover:text-primary-500">
                        View Movie Details
                      </Link>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <BuildingStorefrontIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Theatre</h4>
                    <p className="text-gray-600">{screening.theatreName || 'Unknown Theatre'}</p>
                    <p className="text-sm text-gray-500">Screen {screening.screenNumber}</p>
                    {theatre && (
                      <p className="text-sm text-gray-500 mt-1">
                        <Link to={`/admin/theatres/${screening.theatreId}`} className="text-primary-600 hover:text-primary-500">
                          View Theatre Details
                        </Link>
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-start">
                  <ClockIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Date & Time</h4>
                    <p className="text-gray-600">{formatDate(screening.startTime)}</p>
                    {screening.endTime && (
                      <p className="text-sm text-gray-500">
                        Ends at: {formatDate(screening.endTime, { dateStyle: undefined, timeStyle: 'short' })}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-start">
                  <CurrencyDollarIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Pricing</h4>
                    <p className="text-gray-600">Base Price: {formatCurrency(screening.basePrice)}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex items-center justify-center">
                    <span className="text-xs font-bold">HD</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Format</h4>
                    <p className="text-gray-600">{formatEnumValue(screening.format)}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right column */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Seats & Bookings</h3>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Booked Seats</h4>
                  
                  {bookedSeats.length > 0 ? (
                    <div>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {bookedSeats.map(seat => (
                          <div key={seat} className="px-2 py-1 bg-primary-100 text-primary-800 rounded text-xs font-medium">
                            {seat}
                          </div>
                        ))}
                      </div>
                      <p className="text-sm text-gray-500">{bookedSeats.length} seats booked</p>
                    </div>
                  ) : (
                    <p className="text-gray-500">No seats booked yet.</p>
                  )}
                </div>
                
                <div className="mt-6">
                  <Link to={`/admin/screenings/${id}/bookings`}>
                    <Button 
                      variant="outline" 
                      size="sm"
                      icon={<TicketIcon className="h-5 w-5 mr-1" />}
                      className="w-full sm:w-auto"
                    >
                      View Bookings
                    </Button>
                  </Link>
                </div>
              </div>
              
              {/* Additional information */}
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Actions</h3>
                
                <div className="space-y-3">
                  <Link to={`/admin/screenings/${id}/edit`}>
                    <Button 
                      variant="outline" 
                      size="sm"
                      icon={<PencilSquareIcon className="h-5 w-5 mr-1" />}
                      className="w-full"
                    >
                      Edit Screening
                    </Button>
                  </Link>
                  
                  {/* Create similar screening link */}
                  <Link to={`/admin/screenings/create?movieId=${screening.movieId}&theatreId=${screening.theatreId}`}>
                    <Button 
                      variant="outline" 
                      size="sm"
                      icon={<FilmIcon className="h-5 w-5 mr-1" />}
                      className="w-full"
                    >
                      Create Similar Screening
                    </Button>
                  </Link>
                </div>
                
                {/* Theatre info */}
                {theatre && (
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Theatre Information</h3>
                    <div className="rounded-md bg-gray-50 p-3 text-sm">
                      <p className="font-medium">{theatre.name}</p>
                      <p className="text-gray-600 text-xs">{theatre.address}</p>
                      {theatre.phoneNumber && (
                        <p className="text-gray-600 text-xs mt-1">
                          Phone: {theatre.phoneNumber}
                        </p>
                      )}
                      <p className="text-gray-600 text-xs mt-1">
                        Total Screens: {theatre.totalScreens}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewScreeningPage;