// src/pages/user/BookingDetails.jsx
import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useBookings } from '@hooks/useBookings';
import { useToast } from '@contexts/ToastContext';
import { formatDate, formatCurrency } from '@utils/formatUtils';
import LoadingSpinner from '@components/common/LoadingSpinner';
import Button from '@components/common/Button';
import NotFound from '@components/common/NotFound';
import { 
  TicketIcon, 
  ClockIcon, 
  MapPinIcon, 
  UserIcon,
  CreditCardIcon,
  CalendarIcon,
  ReceiptRefundIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

const BookingDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [isCancelling, setIsCancelling] = useState(false);
  
  // Get booking details
  const { useGetBooking, useCancelBooking } = useBookings();
  const { 
    data: booking, 
    isLoading, 
    error 
  } = useGetBooking(id);
  
  // Cancel booking mutation
  const { 
    mutate: cancelBooking,
    isPending: isPendingCancellation
  } = useCancelBooking({
    onSuccess: () => {
      showSuccess('Booking cancelled successfully');
      navigate('/bookings');
    },
    onError: (error) => {
      showError(error.message || 'Failed to cancel booking');
      setIsCancelling(false);
    }
  });
  
  // Handle booking cancellation
  const handleCancelBooking = () => {
    setIsCancelling(true);
    
    // Show confirmation dialog
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      cancelBooking(id);
    } else {
      setIsCancelling(false);
    }
  };
  
  // Loading state
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  // Error state
  if (error || !booking) {
    return <NotFound message="Booking not found" />;
  }

  // Check if booking is in the future
  const isUpcoming = new Date(booking.screeningTime) > new Date();
  
  // Check if booking is already cancelled
  const isCancelled = booking.paymentStatus === 'CANCELLED';
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className="mr-4"
            onClick={() => navigate('/bookings')}
            icon={<ArrowLeftIcon className="w-4 h-4" />}
          >
            Back to Bookings
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Booking Details</h1>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Status banner */}
          <div className={`px-6 py-4 flex items-center justify-between ${
            isCancelled ? 'bg-red-50 text-red-700 border-b border-red-100' : 
            isUpcoming ? 'bg-green-50 text-green-700 border-b border-green-100' : 
            'bg-gray-50 text-gray-700 border-b border-gray-100'
          }`}>
            <div className="flex items-center">
              <span className="font-medium mr-2">Status:</span>
              <span>{booking.paymentStatus}</span>
            </div>
            <div className="text-sm">
              <span className="font-medium mr-2">Booking #:</span>
              <span>{booking.bookingNumber}</span>
            </div>
          </div>
          
          {/* Booking details */}
          <div className="p-6">
            <div className="flex flex-col md:flex-row">
              {/* Movie poster or placeholder */}
              <div className="flex-shrink-0 h-64 w-44 bg-gray-100 rounded overflow-hidden mb-4 md:mb-0">
                {booking.movieUrl ? (
                  <img 
                    src={booking.movieUrl} 
                    alt={booking.movieTitle} 
                    className={`h-full w-full object-cover ${!isUpcoming && 'opacity-75'}`}
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <TicketIcon className="h-16 w-16 text-gray-400" />
                  </div>
                )}
              </div>
              
              {/* Booking details */}
              <div className="md:ml-6 flex-1">
                <h2 className="text-xl font-bold text-gray-900 mb-2">{booking.movieTitle}</h2>
                
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <CalendarIcon className="h-5 w-5 mr-2 text-gray-400 mt-0.5" />
                    <div>
                      <span className="font-medium">Date & Time:</span>
                      <div>{formatDate(booking.screeningTime)}</div>
                    </div>
                  </li>
                  
                  <li className="flex items-start">
                    <MapPinIcon className="h-5 w-5 mr-2 text-gray-400 mt-0.5" />
                    <div>
                      <span className="font-medium">Theatre:</span>
                      <div>{booking.theatreName}</div>
                      <div className="text-sm text-gray-500">Screen {booking.screeningId}</div>
                    </div>
                  </li>
                  
                  <li className="flex items-start">
                    <TicketIcon className="h-5 w-5 mr-2 text-gray-400 mt-0.5" />
                    <div>
                      <span className="font-medium">Seats:</span>
                      <div>{Array.from(booking.bookedSeats).sort().join(', ')}</div>
                    </div>
                  </li>
                  
                  <li className="flex items-start">
                    <UserIcon className="h-5 w-5 mr-2 text-gray-400 mt-0.5" />
                    <div>
                      <span className="font-medium">Booked By:</span>
                      <div>{booking.username}</div>
                      <div className="text-sm text-gray-500">{booking.userEmail}</div>
                    </div>
                  </li>
                  
                  <li className="flex items-start">
                    <CreditCardIcon className="h-5 w-5 mr-2 text-gray-400 mt-0.5" />
                    <div>
                      <span className="font-medium">Payment:</span>
                      <div>{booking.paymentMethod || 'Credit Card'}</div>
                      <div className="text-sm font-medium">{formatCurrency(booking.totalAmount)}</div>
                    </div>
                  </li>
                  
                  <li className="flex items-start">
                    <ClockIcon className="h-5 w-5 mr-2 text-gray-400 mt-0.5" />
                    <div>
                      <span className="font-medium">Booking Date:</span>
                      <div>{formatDate(booking.bookingTime)}</div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Actions */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-center">
                <div className="mb-4 sm:mb-0">
                  {isUpcoming && !isCancelled && (
                    <Button 
                      variant="danger"
                      icon={<ReceiptRefundIcon className="h-5 w-5 mr-2" />}
                      loading={isCancelling || isPendingCancellation}
                      onClick={handleCancelBooking}
                    >
                      Cancel Booking
                    </Button>
                  )}
                </div>
                
                <div className="flex space-x-4">
                  <Link to={`/movies/${booking.movieId}`}>
                    <Button variant="outline">
                      View Movie
                    </Button>
                  </Link>
                  
                  <Button
                    variant="primary"
                    onClick={() => window.print()}
                  >
                    Print Ticket
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsPage;