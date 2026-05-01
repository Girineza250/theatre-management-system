// src/pages/admin/Bookings.jsx - FIXED VERSION
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useBookings } from '@hooks/useBookings';
import { useToast } from '@contexts/ToastContext';
import { formatDate, formatCurrency } from '@utils/formatUtils';
import Button from '@components/common/Button';
import LoadingSpinner from '@components/common/LoadingSpinner';
import {
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  ExclamationCircleIcon,
  TicketIcon,
  CalendarIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';

const AdminBookingsPage = () => {
  const { showSuccess, showError } = useToast();
  
  // State for search, filters, and sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [sortBy, setSortBy] = useState('bookingTime');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Convert dates to ISO DateTime format for API
  const formatDateForAPI = (dateString) => {
    if (!dateString) return undefined;
    // Convert YYYY-MM-DD to YYYY-MM-DDTHH:mm:ss
    return `${dateString}T00:00:00`;
  };
  
  // Get all bookings with optional filters
  const { useGetAllBookings, useUpdateBookingStatus, useDeleteBooking } = useBookings();
  const { 
    data: bookings = [], 
    isLoading,
    refetch: refetchBookings
  } = useGetAllBookings({
    status: selectedStatus || undefined,
    fromDate: formatDateForAPI(dateRange.from),
    toDate: formatDateForAPI(dateRange.to)
  });
  
  // Update booking status mutation
  const {
    mutate: updateBookingStatus,
    isPending: isUpdating
  } = useUpdateBookingStatus({
    onSuccess: () => {
      showSuccess('Booking status updated successfully');
      refetchBookings();
    },
    onError: (error) => {
      showError(error.message || 'Failed to update booking status');
    }
  });
  
  // Delete booking mutation
  const {
    mutate: deleteBooking,
    isPending: isDeleting
  } = useDeleteBooking({
    onSuccess: () => {
      showSuccess('Booking deleted successfully');
      refetchBookings();
    },
    onError: (error) => {
      showError(error.message || 'Failed to delete booking');
    }
  });
  
  // Handle booking status update
  const handleStatusUpdate = (id, newStatus) => {
    updateBookingStatus({ id, status: newStatus });
  };
  
  // Handle booking deletion
  const handleDeleteBooking = (id) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      deleteBooking(id);
    }
  };
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  // Handle status filter change
  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
  };
  
  // Handle date range change
  const handleDateChange = (field, value) => {
    setDateRange(prev => ({ ...prev, [field]: value }));
  };
  
  // Handle sort change
  const handleSortChange = (field) => {
    if (sortBy === field) {
      // Toggle sort order if same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to descending for dates
      setSortBy(field);
      setSortOrder(field === 'bookingTime' || field === 'screeningTime' ? 'desc' : 'asc');
    }
  };
  
  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedStatus('');
    setDateRange({ from: '', to: '' });
  };
  
  // Filter and sort bookings
  const filteredBookings = bookings
    .filter(booking => {
      // Search filter for booking number, username, or movie title
      return searchQuery === '' || 
        booking.bookingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.movieTitle.toLowerCase().includes(searchQuery.toLowerCase());
    })
    .sort((a, b) => {
      // Sort by selected field
      let comparison = 0;
      
      switch (sortBy) {
        case 'bookingNumber':
          comparison = a.bookingNumber.localeCompare(b.bookingNumber);
          break;
        case 'username':
          comparison = a.username.localeCompare(b.username);
          break;
        case 'movieTitle':
          comparison = a.movieTitle.localeCompare(b.movieTitle);
          break;
        case 'bookingTime':
          comparison = new Date(a.bookingTime) - new Date(b.bookingTime);
          break;
        case 'screeningTime':
          comparison = new Date(a.screeningTime) - new Date(b.screeningTime);
          break;
        case 'totalAmount':
          comparison = a.totalAmount - b.totalAmount;
          break;
        case 'paymentStatus':
          comparison = a.paymentStatus.localeCompare(b.paymentStatus);
          break;
        default:
          comparison = new Date(b.bookingTime) - new Date(a.bookingTime); // Default newest first
      }
      
      // Apply sort order
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  
  // Loading state
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">Bookings</h1>
        <div className="flex space-x-4">
          <Button 
            variant="outline"
            icon={<DocumentArrowDownIcon className="h-5 w-5 mr-2" />}
            onClick={() => showSuccess('Export functionality will be implemented soon')}
          >
            Export
          </Button>
        </div>
      </div>
      
      {/* Filters and search */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="search"
                  type="text"
                  placeholder="Search bookings..."
                  className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
            
            {/* Status filter */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FunnelIcon className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  id="status"
                  className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  value={selectedStatus}
                  onChange={handleStatusChange}
                >
                  <option value="">All Statuses</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="PENDING">Pending</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="REFUNDED">Refunded</option>
                </select>
              </div>
            </div>
            
            {/* From date filter */}
            <div>
              <label htmlFor="fromDate" className="block text-sm font-medium text-gray-700 mb-1">
                From Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CalendarIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="fromDate"
                  type="date"
                  className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  value={dateRange.from}
                  onChange={(e) => handleDateChange('from', e.target.value)}
                />
              </div>
            </div>
            
            {/* To date filter */}
            <div>
              <label htmlFor="toDate" className="block text-sm font-medium text-gray-700 mb-1">
                To Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CalendarIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="toDate"
                  type="date"
                  className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  value={dateRange.to}
                  onChange={(e) => handleDateChange('to', e.target.value)}
                  min={dateRange.from}
                />
              </div>
            </div>
          </div>
          
          {/* Reset filters */}
          <div className="flex justify-end mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={resetFilters}
              disabled={!searchQuery && !selectedStatus && !dateRange.from && !dateRange.to}
            >
              Reset Filters
            </Button>
          </div>
        </div>
      </div>
      
      {/* Bookings list */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredBookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {/* Table headers with sort functionality */}
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSortChange('bookingNumber')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Booking #</span>
                      {sortBy === 'bookingNumber' && (
                        <ArrowsUpDownIcon className={`h-4 w-4 transition-transform ${sortOrder === 'desc' ? 'transform rotate-180' : ''}`} />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSortChange('username')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>User</span>
                      {sortBy === 'username' && (
                        <ArrowsUpDownIcon className={`h-4 w-4 transition-transform ${sortOrder === 'desc' ? 'transform rotate-180' : ''}`} />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSortChange('movieTitle')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Movie</span>
                      {sortBy === 'movieTitle' && (
                        <ArrowsUpDownIcon className={`h-4 w-4 transition-transform ${sortOrder === 'desc' ? 'transform rotate-180' : ''}`} />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSortChange('screeningTime')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Screening</span>
                      {sortBy === 'screeningTime' && (
                        <ArrowsUpDownIcon className={`h-4 w-4 transition-transform ${sortOrder === 'desc' ? 'transform rotate-180' : ''}`} />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSortChange('totalAmount')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Amount</span>
                      {sortBy === 'totalAmount' && (
                        <ArrowsUpDownIcon className={`h-4 w-4 transition-transform ${sortOrder === 'desc' ? 'transform rotate-180' : ''}`} />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSortChange('paymentStatus')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Status</span>
                      {sortBy === 'paymentStatus' && (
                        <ArrowsUpDownIcon className={`h-4 w-4 transition-transform ${sortOrder === 'desc' ? 'transform rotate-180' : ''}`} />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings.map(booking => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {booking.bookingNumber}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(booking.bookingTime, { dateStyle: 'short', timeStyle: 'short' })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{booking.username}</div>
                      <div className="text-xs text-gray-500">{booking.userEmail}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{booking.movieTitle}</div>
                      <div className="text-xs text-gray-500">{booking.theatreName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(booking.screeningTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(booking.totalAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        booking.paymentStatus === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        booking.paymentStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        booking.paymentStatus === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                        booking.paymentStatus === 'REFUNDED' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {booking.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <select 
                          className="text-sm rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                          value={booking.paymentStatus}
                          onChange={(e) => handleStatusUpdate(booking.id, e.target.value)}
                          disabled={isUpdating}
                        >
                          <option value="COMPLETED">Completed</option>
                          <option value="PENDING">Pending</option>
                          <option value="CANCELLED">Cancelled</option>
                          <option value="REFUNDED">Refunded</option>
                        </select>
                        
                        <Link to={`/bookings/${booking.id}`}>
                          <Button 
                            variant="outline" 
                            size="sm"
                            icon={<TicketIcon className="h-4 w-4" />}
                          >
                            View
                          </Button>
                        </Link>
                        
                        <Button 
                          variant="danger" 
                          size="sm"
                          icon={<TrashIcon className="h-4 w-4" />}
                          onClick={() => handleDeleteBooking(booking.id)}
                          loading={isDeleting}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <ExclamationCircleIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-500 mb-6">
              {searchQuery || selectedStatus || dateRange.from || dateRange.to
                ? 'No bookings match your filters. Try adjusting your search criteria.'
                : 'There are no bookings in the system yet.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBookingsPage;