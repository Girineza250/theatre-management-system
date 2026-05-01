// src/pages/user/Checkout.jsx - Improved version with better error handling
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useScreenings } from '@hooks/useScreenings';
import { useBookings } from '@hooks/useBookings';
import { useAuth } from '@contexts/AuthContext';
import { useToast } from '@contexts/ToastContext';
import { formatCurrency } from '@utils/formatUtils';
import LoadingSpinner from '@components/common/LoadingSpinner';
import Button from '@components/common/Button';
import Input from '@components/common/Input';
import NotFound from '@components/common/NotFound';
import Radio from '@components/common/Radio';
import {
  CreditCardIcon,
  BanknotesIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const CheckoutPage = () => {
  const { screeningId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();
  
  // State
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  
  // Get screening details
  const { useGetScreening } = useScreenings();
  const { 
    data: screening,
    isLoading: isLoadingScreening,
    error: screeningError
  } = useGetScreening(screeningId);
  
  // Booking related hooks
  const { useCalculatePrice, useCreateBooking } = useBookings();
  
  // Calculate price based on selected seats
  const {
    data: priceData = { totalPrice: 0 },
    isLoading: isLoadingPrice
  } = useCalculatePrice(screeningId, selectedSeats, {
    enabled: selectedSeats.length > 0
  });
  
  // Create booking mutation
  const { 
    mutate: createBooking,
    isPending: isCreatingBooking
  } = useCreateBooking({
    onSuccess: (data) => {
      setBookingResult(data);
      setBookingComplete(true);
      showSuccess('Booking completed successfully!');
      
      // Clear selected seats from session storage
      try {
        sessionStorage.removeItem('selectedSeats');
      } catch (error) {
        console.error("Error clearing session storage:", error);
      }
    },
    onError: (error) => {
      showError(error.message || 'Failed to complete booking. Please try again.');
      setIsSubmitting(false);
    }
  });
  
  // Retrieve selected seats from session storage
  useEffect(() => {
    try {
      const storedSeats = sessionStorage.getItem('selectedSeats');
      if (storedSeats) {
        setSelectedSeats(JSON.parse(storedSeats));
      } else {
        setErrorMessage("No seats were selected. Please go back to select your seats.");
      }
    } catch (error) {
      console.error('Failed to parse selected seats:', error);
      setErrorMessage("There was a problem retrieving your selected seats. Please try again.");
    }
  }, [screeningId, navigate]);
  
  // Check if user is authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/checkout/${screeningId}` } });
    }
  }, [isAuthenticated, navigate, screeningId]);
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedSeats || selectedSeats.length === 0) {
      showError('No seats selected. Please go back and select seats.');
      return;
    }
    
    if (!paymentMethod) {
      showError('Please select a payment method.');
      return;
    }
    
    setIsSubmitting(true);
    
    // Create booking payload
    const bookingData = {
      screeningId,
      selectedSeats, // We'll use the same property name the API expects
      paymentMethod
    };
    
    // Create booking - the implementation depends on how your API is structured
    createBooking(bookingData);
  };
  
  // Loading state
  const isLoading = isLoadingScreening || isLoadingPrice;
  if (isLoading) {
    return <LoadingSpinner size="lg" />;
  }
  
  // Error state
  if (errorMessage || screeningError || !screening) {
    return <NotFound message={errorMessage || "Screening not found"} />;
  }
  
  // If booking is complete, show confirmation
  if (bookingComplete && bookingResult) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 flex flex-col items-center">
            <div className="mb-6">
              <CheckCircleIcon className="h-16 w-16 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-center mb-2">Booking Confirmed!</h1>
            <p className="text-gray-600 text-center mb-6">
              Your booking has been successfully completed. You will receive a confirmation email shortly.
            </p>
            <div className="w-full border-t border-gray-200 pt-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Booking Details</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Booking Number:</span>
                  <span className="font-medium">{bookingResult.bookingNumber || `BK-${Math.floor(Math.random() * 10000)}`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Movie:</span>
                  <span className="font-medium">{bookingResult.movieTitle || screening.movieTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Theatre:</span>
                  <span className="font-medium">{bookingResult.theatreName || screening.theatreName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date & Time:</span>
                  <span className="font-medium">
                    {formatScreeningTime(bookingResult.screeningTime || screening.startTime)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Seats:</span>
                  <span className="font-medium">
                    {Array.isArray(bookingResult.bookedSeats) 
                      ? bookingResult.bookedSeats.sort().join(', ')
                      : selectedSeats.sort().join(', ')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-medium">{bookingResult.paymentMethod || paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-bold">{formatCurrency(bookingResult.totalAmount || priceData.totalPrice)}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <Link to="/bookings" className="w-full">
                <Button variant="outline" size="lg" className="w-full">
                  View My Bookings
                </Button>
              </Link>
              <Link to="/" className="w-full">
                <Button variant="primary" size="lg" className="w-full">
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Complete Your Booking</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Checkout form */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <form onSubmit={handleSubmit}>
                {/* Booking details section */}
                <div className="p-6 border-b">
                  <h2 className="text-lg font-semibold mb-4">Booking Details</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium">Movie</h3>
                      <p>{screening.movieTitle || 'Selected Movie'}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Theatre</h3>
                      <p>{screening.theatreName || 'Selected Theatre'} • Screen {screening.screenNumber || '1'}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Date & Time</h3>
                      <p>{formatScreeningTime(screening.startTime)}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Selected Seats</h3>
                      <p>{selectedSeats.sort().join(', ')}</p>
                    </div>
                  </div>
                </div>
                
                {/* Payment section */}
                <div className="p-6 border-b">
                  <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
                  <div className="space-y-4">
                    <Radio
                      id="credit-card"
                      name="paymentMethod"
                      value="Credit Card"
                      checked={paymentMethod === 'Credit Card'}
                      onChange={() => setPaymentMethod('Credit Card')}
                      label={
                        <div className="flex items-center">
                          <CreditCardIcon className="h-5 w-5 mr-2 text-gray-400" />
                          Credit Card
                        </div>
                      }
                    />
                    
                    <Radio
                      id="debit-card"
                      name="paymentMethod"
                      value="Debit Card"
                      checked={paymentMethod === 'Debit Card'}
                      onChange={() => setPaymentMethod('Debit Card')}
                      label={
                        <div className="flex items-center">
                          <CreditCardIcon className="h-5 w-5 mr-2 text-gray-400" />
                          Debit Card
                        </div>
                      }
                    />
                    
                    <Radio
                      id="cash"
                      name="paymentMethod"
                      value="Cash"
                      checked={paymentMethod === 'Cash'}
                      onChange={() => setPaymentMethod('Cash')}
                      label={
                        <div className="flex items-center">
                          <BanknotesIcon className="h-5 w-5 mr-2 text-gray-400" />
                          Pay at Theatre
                        </div>
                      }
                    />
                  </div>
                  
                  {/* Payment details (simplified for demo) */}
                  {(paymentMethod === 'Credit Card' || paymentMethod === 'Debit Card') && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="space-y-4">
                        <Input
                          label="Card Number"
                          placeholder="1234 5678 9012 3456"
                          required
                          // In a real app, you would use a library like react-credit-cards
                        />
                        
                        <div className="grid grid-cols-2 gap-4">
                          <Input
                            label="Expiry Date"
                            placeholder="MM/YY"
                            required
                          />
                          
                          <Input
                            label="CVC"
                            placeholder="123"
                            required
                          />
                        </div>
                        
                        <Input
                          label="Name on Card"
                          placeholder="John Doe"
                          required
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Actions */}
                <div className="p-6 flex flex-col sm:flex-row gap-4 justify-end">
                  <Link to={`/screening/${screeningId}/seats`}>
                    <Button 
                      type="button" 
                      variant="outline"
                      disabled={isSubmitting || isCreatingBooking}
                    >
                      Back to Seats
                    </Button>
                  </Link>
                  
                  <Button 
                    type="submit"
                    variant="primary"
                    loading={isSubmitting || isCreatingBooking}
                  >
                    Complete Booking
                  </Button>
                </div>
              </form>
            </div>
          </div>
          
          {/* Booking summary */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-md overflow-hidden sticky top-6">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">Booking Summary</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tickets ({selectedSeats.length})</span>
                    <span>{formatCurrency(priceData.totalPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Booking Fee</span>
                    <span>{formatCurrency(0)}</span>
                  </div>
                  <div className="pt-3 mt-3 border-t border-gray-200 flex justify-between">
                    <span className="font-bold">Total</span>
                    <span className="font-bold">{formatCurrency(priceData.totalPrice)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to format screening time with error handling
const formatScreeningTime = (timeString) => {
  if (!timeString) return 'Time information not available';
  
  try {
    const date = new Date(timeString);
    if (isNaN(date.getTime())) {
      return 'Invalid date format';
    }
    
    // Format: "Wednesday, May 21, 2025 at 2:30 PM"
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return 'Time information not available';
  }
};

export default CheckoutPage;