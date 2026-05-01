// src/pages/user/SeatSelection.jsx - Improved version with better error handling
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useScreenings } from '@hooks/useScreenings';
import { useBookings } from '@hooks/useBookings';
import { useAuth } from '@contexts/AuthContext';
import { useToast } from '@contexts/ToastContext';
import { formatCurrency } from '@utils/formatUtils';
import LoadingSpinner from '@components/common/LoadingSpinner';
import Button from '@components/common/Button';
import NotFound from '@components/common/NotFound';

const SeatSelectionPage = () => {
  const { id: screeningId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { showWarning, showError, showInfo } = useToast();
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  
  // State for parsed and normalized data
  const [screeningData, setScreeningData] = useState(null);
  const [bookedSeatsData, setBookedSeatsData] = useState([]);
  const [layoutData, setLayoutData] = useState({ rows: [], basePrice: 0 });
  
  // Get screening details
  const { useGetScreening } = useScreenings();
  const { 
    data: rawScreeningData,
    isLoading: isLoadingScreening,
    error: screeningError
  } = useGetScreening(screeningId);
  
  // Get booked seats
  const { useGetBookedSeats, useGetSeatingLayout, useCalculatePrice } = useBookings();
  const { 
    data: rawBookedSeats = [],
    isLoading: isLoadingBooked
  } = useGetBookedSeats(screeningId);
  
  // Get seating layout
  const {
    data: rawSeatingLayout,
    isLoading: isLoadingLayout
  } = useGetSeatingLayout(screeningId);
  
  // Calculate price based on selected seats
  const {
    data: priceData = { totalPrice: 0 },
    isLoading: isLoadingPrice
  } = useCalculatePrice(screeningId, selectedSeats, {
    enabled: selectedSeats.length > 0
  });
  
  // Normalize and process screening data when it loads
  useEffect(() => {
    if (!isLoadingScreening && rawScreeningData) {
      // Use the raw data directly if it's in the right format
      setScreeningData(rawScreeningData);
      setIsLoadingData(false);
    } else if (screeningError) {
      setErrorMessage("Could not load screening details. Please try again later.");
      setIsLoadingData(false);
    }
  }, [rawScreeningData, isLoadingScreening, screeningError]);
  
  // Process booked seats data
  useEffect(() => {
    if (!isLoadingBooked && rawBookedSeats) {
      try {
        // Handle different possible formats from the API
        let normalizedBookedSeats = [];
        
        if (Array.isArray(rawBookedSeats)) {
          // Direct array of seat IDs
          normalizedBookedSeats = rawBookedSeats;
        } else if (typeof rawBookedSeats === 'object') {
          // Check if it has seats property
          if (Array.isArray(rawBookedSeats.seats)) {
            normalizedBookedSeats = rawBookedSeats.seats;
          } else if (rawBookedSeats.bookedSeats) {
            // Try bookedSeats property
            normalizedBookedSeats = Array.isArray(rawBookedSeats.bookedSeats) 
              ? rawBookedSeats.bookedSeats 
              : Object.values(rawBookedSeats.bookedSeats);
          } else {
            // Last resort - try to extract seat IDs from object keys
            normalizedBookedSeats = Object.keys(rawBookedSeats).filter(key => 
              !key.includes('status') && !key.includes('message')
            );
          }
        }
        
        setBookedSeatsData(normalizedBookedSeats);
      } catch (error) {
        console.error("Error processing booked seats:", error);
        setBookedSeatsData([]);
      }
    }
  }, [rawBookedSeats, isLoadingBooked]);
  
  // Process seating layout data
  useEffect(() => {
    if (!isLoadingLayout && rawSeatingLayout) {
      try {
        // Parse and normalize the seating layout data
        let normalizedLayout = { rows: [], basePrice: 0 };
        
        if (rawSeatingLayout && typeof rawSeatingLayout === 'object') {
          // Check if it has the expected 'rows' property
          if (Array.isArray(rawSeatingLayout.rows)) {
            // Standard format
            normalizedLayout = rawSeatingLayout;
          } else {
            // Try to parse alternative formats
            const rowKeys = Object.keys(rawSeatingLayout).filter(key => 
              key.match(/^[A-Z]$/) // Simple check for row names (A, B, C, etc.)
            );
            
            if (rowKeys.length > 0) {
              // Extract rows from object keys
              const rows = rowKeys.map(name => {
                const rowData = rawSeatingLayout[name];
                return {
                  name,
                  seatsCount: rowData.seatsCount || 10,
                  priceMultiplier: rowData.priceMultiplier || 1.0,
                  seatType: rowData.seatType || 'STANDARD'
                };
              });
              
              normalizedLayout = {
                rows,
                basePrice: rawSeatingLayout.basePrice || 10.99
              };
            } else {
              // Last resort - create a basic layout
              normalizedLayout = {
                rows: [
                  { name: "A", seatsCount: 8, priceMultiplier: 1.0, seatType: "STANDARD" },
                  { name: "B", seatsCount: 8, priceMultiplier: 1.0, seatType: "STANDARD" },
                  { name: "C", seatsCount: 8, priceMultiplier: 1.2, seatType: "PREMIUM" }
                ],
                basePrice: rawSeatingLayout.basePrice || 10.99
              };
              
              // Show a warning that we're using a default layout
              showInfo("Using default seating layout as we couldn't fully interpret the theatre's configuration.");
            }
          }
        } else {
          // Fallback to default layout
          normalizedLayout = {
            rows: [
              { name: "A", seatsCount: 8, priceMultiplier: 1.0, seatType: "STANDARD" },
              { name: "B", seatsCount: 8, priceMultiplier: 1.0, seatType: "STANDARD" },
              { name: "C", seatsCount: 8, priceMultiplier: 1.2, seatType: "PREMIUM" }
            ],
            basePrice: 10.99
          };
          
          // Show a warning that we're using a default layout
          showInfo("Using default seating layout as we couldn't fetch the theatre's configuration.");
        }
        
        setLayoutData(normalizedLayout);
      } catch (error) {
        console.error("Error processing seating layout:", error);
        // Set a default layout
        setLayoutData({
          rows: [
            { name: "A", seatsCount: 8, priceMultiplier: 1.0, seatType: "STANDARD" },
            { name: "B", seatsCount: 8, priceMultiplier: 1.0, seatType: "STANDARD" }
          ],
          basePrice: 10.99
        });
      }
    }
  }, [rawSeatingLayout, isLoadingLayout, showInfo]);
  
  // Check if user is authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/screening/${screeningId}/seats` } });
    }
  }, [isAuthenticated, navigate, screeningId]);
  
  // Handle seat selection
  const handleSeatToggle = (seatId) => {
    if (isSeatBooked(seatId)) return;
    
    setSelectedSeats(prev => {
      if (prev.includes(seatId)) {
        return prev.filter(id => id !== seatId);
      } else {
        return [...prev, seatId];
      }
    });
  };
  
  // Check if a seat is booked
  const isSeatBooked = (seatId) => {
    return bookedSeatsData.includes(seatId);
  };
  
  // Check if a seat is selected
  const isSeatSelected = (seatId) => {
    return selectedSeats.includes(seatId);
  };
  
  // Get seat price
  const getSeatPrice = (rowName) => {
    const row = layoutData.rows.find(r => r.name === rowName);
    return row ? row.priceMultiplier * layoutData.basePrice : layoutData.basePrice;
  };
  
  // Handle continue to checkout
  const handleContinueToCheckout = () => {
    if (selectedSeats.length === 0) {
      showWarning('Please select at least one seat');
      return;
    }
    
    // Save selected seats to session storage for checkout
    try {
      sessionStorage.setItem('selectedSeats', JSON.stringify(selectedSeats));
      navigate(`/checkout/${screeningId}`);
    } catch (error) {
      console.error("Error saving seats to session storage:", error);
      showError("There was a problem preparing your checkout. Please try again.");
    }
  };
  
  // Loading state
  if (isLoadingScreening || isLoadingBooked || isLoadingLayout) {
    return <LoadingSpinner size="lg" />;
  }
  
  // Error state
  if (errorMessage || !screeningData) {
    return <NotFound message={errorMessage || "Screening information not found"} />;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Select Your Seats</h1>
          <div className="text-gray-600">
            <p className="font-medium">{screeningData.movieTitle || 'Movie'}</p>
            <p>{screeningData.theatreName || 'Theatre'} • Screen {screeningData.screenNumber || '1'}</p>
            <p>{formatScreeningTime(screeningData.startTime)}</p>
          </div>
        </header>
        
        {/* Seat selection */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            {/* Screen representation */}
            <div className="mb-8">
              <div className="h-8 bg-gray-300 rounded-t-lg flex items-center justify-center text-sm text-gray-600">
                SCREEN
              </div>
              <div className="h-1 w-full bg-gray-400"></div>
            </div>
            
            {/* Seating layout */}
            <div className="mb-8 overflow-x-auto">
              <div className="inline-block min-w-full">
                {layoutData.rows.map((row) => (
                  <div key={row.name} className="flex justify-center mb-2">
                    {/* Row label */}
                    <div className="w-8 flex items-center justify-center font-medium">
                      {row.name}
                    </div>
                    
                    {/* Seats */}
                    <div className="flex gap-1">
                      {Array.from({ length: row.seatsCount }, (_, i) => i + 1).map((seatNum) => {
                        const seatId = `${row.name}${seatNum}`;
                        const isBooked = isSeatBooked(seatId);
                        const isSelected = isSeatSelected(seatId);
                        
                        return (
                          <button
                            key={seatId}
                            className={`
                              w-8 h-8 rounded-t-lg text-xs font-medium
                              ${isBooked ? 'bg-gray-400 cursor-not-allowed' : 
                                isSelected ? 'bg-primary-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}
                            `}
                            onClick={() => handleSeatToggle(seatId)}
                            disabled={isBooked}
                            aria-label={`Seat ${seatId} ${isBooked ? '(booked)' : isSelected ? '(selected)' : '(available)'}`}
                            title={`${formatCurrency(getSeatPrice(row.name))} - ${row.seatType || 'Standard'}`}
                          >
                            {seatNum}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Seat legend */}
            <div className="flex justify-center gap-4 mb-6 flex-wrap">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-gray-200 mr-2"></div>
                <span className="text-sm">Available</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-primary-500 mr-2"></div>
                <span className="text-sm">Selected</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-gray-400 mr-2"></div>
                <span className="text-sm">Booked</span>
              </div>
            </div>
            
            {/* Price guide */}
            <div className="flex justify-center gap-4 mb-6 flex-wrap border-t pt-4">
              <h3 className="w-full text-center font-medium mb-2">Price Guide</h3>
              {layoutData.rows
                .filter((row, index, self) => 
                  self.findIndex(r => r.seatType === row.seatType) === index
                )
                .map(row => (
                  <div key={row.seatType || 'standard'} className="flex items-center">
                    <span className="text-sm">
                      {row.seatType || 'Standard'}: {formatCurrency(row.priceMultiplier * layoutData.basePrice)}
                    </span>
                  </div>
                ))
              }
            </div>
          </div>
          
          {/* Booking summary */}
          <div className="bg-gray-50 p-6 border-t">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
              <div>
                <h3 className="font-medium">Booking Summary</h3>
                <p className="text-sm text-gray-600">
                  Selected: <span className="font-medium">{selectedSeats.length}</span> seats
                  {selectedSeats.length > 0 && (
                    <span> ({selectedSeats.sort().join(', ')})</span>
                  )}
                </p>
              </div>
              <div className="mt-2 md:mt-0 text-right">
                <p className="text-sm text-gray-600">Total:</p>
                <p className="text-xl font-bold">
                  {formatCurrency(priceData.totalPrice)}
                </p>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button 
                variant="primary"
                size="lg"
                onClick={handleContinueToCheckout}
                disabled={selectedSeats.length === 0}
              >
                Continue to Checkout
              </Button>
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

export default SeatSelectionPage;