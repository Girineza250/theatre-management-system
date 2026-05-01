// src/pages/user/Bookings.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useBookings } from '@hooks/useBookings';
import { useToast } from '@contexts/ToastContext';
import { formatDate, formatCurrency } from '@utils/formatUtils';
import LoadingSpinner from '@components/common/LoadingSpinner';
import Button from '@components/common/Button';
import Tabs from '@components/common/Tabs';
import { 
  TicketIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon 
} from '@heroicons/react/24/outline';

const BookingsPage = () => {
  const { showSuccess, showError } = useToast();
  
  // Get user bookings
  const { useGetUserBookings, useCancelBooking } = useBookings();
  const { 
    data: bookings = [], 
    isLoading, 
    refetch 
  } = useGetUserBookings();
  
  // Cancel booking mutation
  const { 
    mutate: cancelBooking,
    isPending: isCancelling
  } = useCancelBooking({
    onSuccess: () => {
      showSuccess('Booking cancelled successfully');
      refetch();
    },
    onError: (error) => {
      showError(error.message || 'Failed to cancel booking');
    }
  });
  
  // Handle booking cancellation
  const handleCancelBooking = (id) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      cancelBooking(id);
    }
  };
  
  // Loading state
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  // Split bookings into upcoming and past
  const now = new Date();
  const upcomingBookings = bookings.filter(booking => new Date(booking.screeningTime) > now);
  const pastBookings = bookings.filter(booking => new Date(booking.screeningTime) <= now);
  
  // Check if user has any bookings
  const hasNoBookings = bookings.length === 0;
  
  // Render empty state
  if (hasNoBookings) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto text-center">
          <div className="py-12 flex flex-col items-center justify-center bg-white rounded-lg shadow">
            <TicketIcon className="w-16 h-16 text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Bookings Found</h2>
            <p className="text-gray-600 mb-6">You haven't made any bookings yet.</p>
            <Link to="/movies">
              <Button variant="primary">Browse Movies</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  // Tab content for upcoming bookings
  const UpcomingBookingsTab = () => (
    <div>
      {upcomingBookings.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">You don't have any upcoming bookings.</p>
          <Link to="/movies" className="text-primary-600 hover:text-primary-700 mt-2 inline-block">
            Browse Movies
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {upcomingBookings.map(booking => (
            <li key={booking.id} className="py-6">
              <div className="flex flex-col md:flex-row">
                {/* Movie poster or placeholder */}
                <div className="flex-shrink-0 h-48 w-32 md:w-36 bg-gray-100 rounded overflow-hidden mb-4 md:mb-0">
                  {booking.movieUrl ? (
                    <img 
                      src={booking.movieUrl} 
                      alt={booking.movieTitle} 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <TicketIcon className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>
                
                {/* Booking details */}
                <div className="md:ml-6 flex-1">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{booking.movieTitle}</h3>
                      <p className="text-gray-600">{booking.theatreName}</p>
                    </div>
                    <div className="mt-2 md:mt-0 md:ml-6 md:text-right">
                      <p className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {booking.paymentStatus}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-gray-900">
                        {formatCurrency(booking.totalAmount)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-2 text-sm text-gray-500">
                    <div className="flex items-center">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      <span>{formatDate(booking.screeningTime)}</span>
                    </div>
                    <div className="mt-1">
                      <span className="font-medium">Seats:</span> {Array.from(booking.bookedSeats).sort().join(', ')}
                    </div>
                    <div className="mt-1">
                      <span className="font-medium">Booking #:</span> {booking.bookingNumber}
                    </div>
                  </div>
                  
                  <div className="mt-4 flex flex-col sm:flex-row sm:space-x-4">
                    <Link to={`/bookings/${booking.id}`}>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="mb-2 sm:mb-0 w-full sm:w-auto"
                      >
                        View Details
                      </Button>
                    </Link>
                    <Button 
                      variant="danger" 
                      size="sm"
                      className="w-full sm:w-auto"
                      loading={isCancelling}
                      onClick={() => handleCancelBooking(booking.id)}
                    >
                      Cancel Booking
                    </Button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
  
  // Tab content for past bookings
  const PastBookingsTab = () => (
    <div>
      {pastBookings.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">You don't have any past bookings.</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {pastBookings.map(booking => (
            <li key={booking.id} className="py-6">
              <div className="flex flex-col md:flex-row">
                {/* Movie poster or placeholder */}
                <div className="flex-shrink-0 h-48 w-32 md:w-36 bg-gray-100 rounded overflow-hidden mb-4 md:mb-0">
                  {booking.movieUrl ? (
                    <img 
                      src={booking.movieUrl} 
                      alt={booking.movieTitle} 
                      className="h-full w-full object-cover opacity-75 grayscale"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <TicketIcon className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>
                
                {/* Booking details */}
                <div className="md:ml-6 flex-1">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{booking.movieTitle}</h3>
                      <p className="text-gray-600">{booking.theatreName}</p>
                    </div>
                    <div className="mt-2 md:mt-0 md:ml-6 md:text-right">
                      <p className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {booking.paymentStatus}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-gray-900">
                        {formatCurrency(booking.totalAmount)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-2 text-sm text-gray-500">
                    <div className="flex items-center">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      <span>{formatDate(booking.screeningTime)}</span>
                    </div>
                    <div className="mt-1">
                      <span className="font-medium">Seats:</span> {Array.from(booking.bookedSeats).sort().join(', ')}
                    </div>
                    <div className="mt-1">
                      <span className="font-medium">Booking #:</span> {booking.bookingNumber}
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <Link to={`/bookings/${booking.id}`}>
                      <Button 
                        variant="outline" 
                        size="sm"
                      >
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Bookings</h1>
        
        <div className="bg-white rounded-lg shadow">
          <Tabs 
            tabs={[
              { 
                label: "Upcoming", 
                icon: <CheckCircleIcon className="h-5 w-5" />,
                badge: upcomingBookings.length,
                content: <UpcomingBookingsTab />
              },
              { 
                label: "Past", 
                icon: <XCircleIcon className="h-5 w-5" />,
                badge: pastBookings.length,
                content: <PastBookingsTab />
              }
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default BookingsPage;