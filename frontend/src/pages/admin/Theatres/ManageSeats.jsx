// src/pages/admin/Theatres/ManageSeats.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  useGetTheatre, 
  useGetTheatreSeats, 
  useUpdateTheatreSeats,
  useInitializeSeats,
  useDeleteScreenSeats
} from '@hooks/useTheatres';
import { useToast } from '@contexts/ToastContext';
import Button from '@components/common/Button';
import LoadingSpinner from '@components/common/LoadingSpinner';
import NotFound from '@components/common/NotFound';
import {
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

// Seat types definition
const SeatTypes = {
  STANDARD: { label: 'Standard', color: 'bg-blue-100 text-blue-800', priceMultiplier: 1.0 },
  PREMIUM: { label: 'Premium', color: 'bg-green-100 text-green-800', priceMultiplier: 1.5 },
  VIP: { label: 'VIP', color: 'bg-purple-100 text-purple-800', priceMultiplier: 2.0 },
  WHEELCHAIR: { label: 'Wheelchair', color: 'bg-yellow-100 text-yellow-800', priceMultiplier: 1.0 },
  UNAVAILABLE: { label: 'Unavailable', color: 'bg-gray-100 text-gray-800', priceMultiplier: 0 }
};

const ManageSeatsPage = () => {
  const { id, screenNumber } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [selectedScreen, setSelectedScreen] = useState(screenNumber ? parseInt(screenNumber) : 1);
  const [selectedSeatType, setSelectedSeatType] = useState('STANDARD');
  const [seatMap, setSeatMap] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [initializeValues, setInitializeValues] = useState({
    rows: 8,
    seatsPerRow: 10
  });

  // Get theatre details
  const { 
    data: theatre, 
    isLoading: isLoadingTheatre, 
    error: theatreError 
  } = useGetTheatre(id);

  // Get seats for the selected screen
  const {
    data: seatsData,
    isLoading: isLoadingSeats,
    refetch: refetchSeats
  } = useGetTheatreSeats(id, selectedScreen, {
    enabled: !!id && !!selectedScreen
  });

  // Update seats mutation
  const {
    mutate: updateSeats,
    isPending: isUpdatingSeats
  } = useUpdateTheatreSeats();

  // Initialize seats mutation
  const {
    mutate: initializeSeats,
    isPending: isInitializingSeats
  } = useInitializeSeats();

  // Delete screen seats mutation
  const {
    mutate: deleteScreenSeats,
    isPending: isDeletingSeats
  } = useDeleteScreenSeats();

  // Process seats data when it's loaded
  useEffect(() => {
    if (seatsData) {
      console.log("Raw seats data:", seatsData);
      const processedSeatMap = processSeatsData(seatsData);
      console.log("Processed seat map:", processedSeatMap);
      setSeatMap(processedSeatMap);
    }
  }, [seatsData]);

  // Function to process seats data from API into the format needed for the UI
  const processSeatsData = (data) => {
    if (!data || !Array.isArray(data)) return [];

    // Group seats by row
    const rowMap = {};
    data.forEach(seat => {
      const rowName = seat.rowName; // Match property from DTO
      if (!rowMap[rowName]) {
        rowMap[rowName] = [];
      }
      
      // Map to the format expected by the component
      rowMap[rowName].push({
        id: seat.id,
        number: seat.seatNumber, // Match property from DTO
        row: seat.rowName,
        type: seat.seatType || 'STANDARD', // Fallback to standard if no type
        priceMultiplier: seat.priceMultiplier || 1.0
      });
    });

    // Convert to array format used by the component
    return Object.entries(rowMap)
      .sort(([a], [b]) => a.localeCompare(b)) // Sort rows alphabetically
      .map(([rowName, seats]) => ({
        rowName,
        seats: seats.sort((a, b) => a.number - b.number) // Sort seats by number
      }));
  };

  // Handle screen change
  const handleScreenChange = (screenNum) => {
    setSelectedScreen(screenNum);
    setSelectedSeats([]);
    setBulkEditMode(false);
  };

  // Handle seat click
  const handleSeatClick = (seatId) => {
    if (bulkEditMode) {
      // Toggle seat selection
      setSelectedSeats(prevSelected => 
        prevSelected.includes(seatId)
          ? prevSelected.filter(id => id !== seatId)
          : [...prevSelected, seatId]
      );
    } else {
      // Apply seat type directly
      updateSeatType([seatId], selectedSeatType);
    }
  };

  // Update seat type for selected seats
  const updateSeatType = (seatIds, seatType) => {
    if (!seatIds || seatIds.length === 0) return;

    updateSeats({
      theatreId: id,
      screenNumber: selectedScreen,
      seatsData: {
        seatIds,
        seatType,
        priceMultiplier: SeatTypes[seatType].priceMultiplier
      }
    }, {
      onSuccess: () => {
        // Update the seat map with the new seat types
        setSeatMap(prevMap => {
          return prevMap.map(row => {
            const updatedSeats = row.seats.map(seat => {
              if (seatIds.includes(seat.id)) {
                return {
                  ...seat,
                  type: seatType,
                  priceMultiplier: SeatTypes[seatType].priceMultiplier
                };
              }
              return seat;
            });
            
            return {
              ...row,
              seats: updatedSeats
            };
          });
        });
        
        showSuccess('Seats updated successfully');
        
        // Clear selected seats if in bulk edit mode
        if (bulkEditMode && seatIds.length > 1) {
          setSelectedSeats([]);
        }
      },
      onError: (error) => {
        showError(error.message || 'Failed to update seats');
      }
    });
  };

  // Apply bulk seat type update
  const applyBulkUpdate = () => {
    if (selectedSeats.length === 0) {
      showError('No seats selected');
      return;
    }
    
    updateSeatType(selectedSeats, selectedSeatType);
  };

  // Initialize screen seats
  const handleInitializeSeats = () => {
    const { rows, seatsPerRow } = initializeValues;
    
    if (rows < 1 || rows > 26 || seatsPerRow < 1 || seatsPerRow > 30) {
      showError('Invalid configuration. Rows must be between 1-26 and seats per row between 1-30.');
      return;
    }

    initializeSeats({
      theatreId: id,
      screenNumber: selectedScreen,
      rows,
      seatsPerRow
    }, {
      onSuccess: () => {
        showSuccess(`Successfully initialized ${rows} rows with ${seatsPerRow} seats per row`);
        refetchSeats();
      },
      onError: (error) => {
        showError(error.message || 'Failed to initialize seats');
      }
    });
  };

  // Delete screen seats
  const handleDeleteScreenSeats = () => {
    if (!window.confirm(`Are you sure you want to delete all seats for Screen ${selectedScreen}?`)) {
      return;
    }

    deleteScreenSeats({
      theatreId: id,
      screenNumber: selectedScreen
    }, {
      onSuccess: () => {
        setSeatMap([]);
        showSuccess('All seats deleted successfully');
      },
      onError: (error) => {
        showError(error.message || 'Failed to delete seats');
      }
    });
  };

  // Handle input change for initialize values
  const handleInitializeChange = (e) => {
    const { name, value } = e.target;
    setInitializeValues(prev => ({
      ...prev,
      [name]: parseInt(value) || 0
    }));
  };

  // Loading state
  if (isLoadingTheatre) {
    return <LoadingSpinner />;
  }

  // Error state
  if (theatreError || !theatre) {
    return <NotFound message="Theatre not found" />;
  }

  // Determine if any operation is in progress
  const isSubmitting = isUpdatingSeats || isInitializingSeats || isDeletingSeats;

  return (
    <div>
      <div className="mb-6 flex items-center">
        <Button
          variant="ghost"
          size="sm"
          className="mr-4"
          onClick={() => navigate('/admin/theatres')}
          icon={<ArrowLeftIcon className="w-4 h-4" />}
        >
          Back to Theatres
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Manage Seats</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow mb-6 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="text-lg font-medium text-gray-900">{theatre.name}</h2>
            <p className="text-sm text-gray-500">Managing seats for Screen {selectedScreen}</p>
          </div>
          
          {/* Screen selector */}
          <div className="mt-4 sm:mt-0">
            <label htmlFor="screenSelector" className="block text-sm font-medium text-gray-700 mb-1">
              Select Screen
            </label>
            <select
              id="screenSelector"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              value={selectedScreen}
              onChange={(e) => handleScreenChange(parseInt(e.target.value))}
              disabled={isSubmitting}
            >
              {Array.from({ length: theatre.totalScreens || 0 }, (_, i) => i + 1).map(screen => (
                <option key={screen} value={screen}>
                  Screen {screen}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Tools section */}
        <div className="flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-4 border-t border-b border-gray-200 py-4 mb-6">
          {/* Seat type selector */}
          <div>
            <label htmlFor="seatType" className="block text-sm font-medium text-gray-700 mb-1">
              Seat Type
            </label>
            <select
              id="seatType"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              value={selectedSeatType}
              onChange={(e) => setSelectedSeatType(e.target.value)}
              disabled={isSubmitting}
            >
              {Object.entries(SeatTypes).map(([type, { label }]) => (
                <option key={type} value={type}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Bulk edit toggle */}
          <div>
            <Button
              variant={bulkEditMode ? 'primary' : 'outline'}
              size="sm"
              onClick={() => {
                setBulkEditMode(!bulkEditMode);
                setSelectedSeats([]);
              }}
              disabled={isSubmitting}
            >
              {bulkEditMode ? 'Exit Selection Mode' : 'Bulk Edit'}
            </Button>
          </div>
          
          {/* Apply bulk changes button */}
          {bulkEditMode && (
            <div>
              <Button
                variant="primary"
                size="sm"
                icon={<CheckIcon className="h-4 w-4 mr-1" />}
                onClick={applyBulkUpdate}
                disabled={selectedSeats.length === 0 || isSubmitting}
                loading={isUpdatingSeats}
              >
                Apply to {selectedSeats.length} Seats
              </Button>
            </div>
          )}
          
          {/* Spacer for flex layout */}
          <div className="flex-grow"></div>
          
          {/* Initialize seats section */}
          <div className="flex items-end space-x-2">
            <div>
              <label htmlFor="rows" className="block text-sm font-medium text-gray-700 mb-1">
                Rows
              </label>
              <input
                type="number"
                id="rows"
                name="rows"
                className="block w-20 rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={initializeValues.rows}
                onChange={handleInitializeChange}
                min="1"
                max="26"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label htmlFor="seatsPerRow" className="block text-sm font-medium text-gray-700 mb-1">
                Seats/Row
              </label>
              <input
                type="number"
                id="seatsPerRow"
                name="seatsPerRow"
                className="block w-20 rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={initializeValues.seatsPerRow}
                onChange={handleInitializeChange}
                min="1"
                max="30"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <Button
                variant="outline"
                size="sm"
                icon={<PlusIcon className="h-4 w-4 mr-1" />}
                onClick={handleInitializeSeats}
                disabled={isSubmitting}
                loading={isInitializingSeats}
              >
                Initialize
              </Button>
            </div>
            <div>
              <Button
                variant="danger"
                size="sm"
                icon={<TrashIcon className="h-4 w-4 mr-1" />}
                onClick={handleDeleteScreenSeats}
                disabled={isSubmitting || seatMap.length === 0}
                loading={isDeletingSeats}
              >
                Delete All
              </Button>
            </div>
          </div>
        </div>
        
        {/* Seat map legend */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Seat Types</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(SeatTypes).map(([type, { label, color }]) => (
              <div key={type} className="flex items-center">
                <div className={`w-6 h-6 flex items-center justify-center rounded ${color} mr-1`}>
                  <span className="text-xs">{type.charAt(0)}</span>
                </div>
                <span className="text-sm text-gray-700">{label}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Seat map with loading state */}
        {isLoadingSeats ? (
          <div className="flex justify-center items-center py-10">
            <LoadingSpinner size="lg" />
          </div>
        ) : seatMap && seatMap.length > 0 ? (
          <div className="overflow-x-auto mb-6">
            <div className="pb-6 text-center">
              <div className="inline-block w-full max-w-4xl mx-auto">
                {/* Screen display */}
                <div className="w-3/4 h-8 bg-gray-300 mx-auto mb-8 flex items-center justify-center rounded-t-lg text-sm font-medium text-gray-700">
                  SCREEN
                </div>
                
                {/* Seats grid */}
                <div className="flex flex-col space-y-3">
                  {seatMap.map(row => (
                    <div key={row.rowName} className="flex items-center">
                      {/* Row name */}
                      <div className="w-6 flex-shrink-0 text-center text-sm font-medium text-gray-700">
                        {row.rowName}
                      </div>
                      
                      {/* Seats */}
                      <div className="flex-grow flex justify-center">
                        <div className="flex space-x-2">
                          {row.seats && row.seats.length > 0 ? row.seats.map(seat => {
                            const seatType = seat.type || 'STANDARD';
                            const isSelected = selectedSeats.includes(seat.id);
                            const { color } = SeatTypes[seatType] || SeatTypes.STANDARD;
                            
                            return (
                              <button
                                key={seat.id}
                                className={`w-8 h-8 flex items-center justify-center rounded ${color} ${
                                  isSelected ? 'ring-2 ring-primary-500' : ''
                                } ${seatType === 'UNAVAILABLE' ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80 cursor-pointer'}`}
                                onClick={() => handleSeatClick(seat.id)}
                                disabled={isSubmitting}
                              >
                                <span className="text-xs">{seat.number}</span>
                              </button>
                            );
                          }) : <div className="text-sm text-gray-500">No seats in this row</div>}
                        </div>
                      </div>
                      
                      {/* Row name (right side) */}
                      <div className="w-6 flex-shrink-0 text-center text-sm font-medium text-gray-700">
                        {row.rowName}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {seatsData && seatsData.length > 0 
                ? "Error processing seat data. Please try refreshing the page."
                : "No seats have been configured for this screen yet. Use the Initialize button above to create seats."}
            </p>
            {seatsData && seatsData.length > 0 && (
              <pre className="mt-4 text-left bg-gray-100 p-4 rounded max-h-40 overflow-auto text-xs">
                {JSON.stringify(seatsData, null, 2)}
              </pre>
            )}
          </div>
        )}
        
        {/* Action buttons */}
        <div className="mt-6 flex justify-end">
          <Button
            variant="outline"
            onClick={() => navigate(`/admin/theatres/${id}`)}
            disabled={isSubmitting}
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ManageSeatsPage;