// src/pages/admin/Users/View.jsx - Updated to use real data
import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useToast } from '@contexts/ToastContext';
import { useGetUser, useDeleteUser } from '@hooks/useUsers';
import Button from '@components/common/Button';
import LoadingSpinner from '@components/common/LoadingSpinner';
import NotFound from '@components/common/NotFound';
import {
  ArrowLeftIcon,
  PencilSquareIcon,
  TrashIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  TicketIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { formatDate } from '@utils/formatUtils';

const ViewUserPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  
  // Fetch user data
  const {
    data: userData,
    isLoading,
    error,
    refetch
  } = useGetUser(id, {
    retry: 1,
    refetchOnWindowFocus: false
  });
  
  // Delete user mutation
  const deleteUserMutation = useDeleteUser({
    onSuccess: () => {
      showSuccess('User deleted successfully');
      navigate('/admin/users');
    },
    onError: (error) => {
      showError(error.message || 'Failed to delete user');
    }
  });
  
  // Handle user deletion
  const handleDeleteUser = async () => {
    if (!userData?.user) return;
    
    const user = userData.user;
    
    if (user.role === 'ROLE_ADMIN') {
      showError('Cannot delete admin users');
      return;
    }
    
    if (!window.confirm(`Are you sure you want to delete user "${user.username}"?`)) {
      return;
    }
    
    deleteUserMutation.mutate(user.id);
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  // Error state
  if (error || !userData) {
    return (
      <div className="p-12 text-center">
        <NotFound 
          title="User not found"
          message="The user you're looking for doesn't exist or you don't have permission to view it."
          showHomeButton={false}
        />
        <div className="mt-4">
          <Button
            variant="primary"
            onClick={() => navigate('/admin/users')}
          >
            Back to Users
          </Button>
        </div>
      </div>
    );
  }
  
  const user = userData.user;
  const bookings = userData.bookings || [];
  
  return (
    <div>
      <div className="mb-6 flex items-center">
        <Button
          variant="ghost"
          size="sm"
          className="mr-4"
          onClick={() => navigate('/admin/users')}
          icon={<ArrowLeftIcon className="w-4 h-4" />}
        >
          Back to Users
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">User Details</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User info card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-20 w-20 bg-primary-100 rounded-full flex items-center justify-center text-primary-600">
                  <UserIcon className="h-10 w-10" />
                </div>
                <div className="ml-4">
                  <h2 className="text-xl font-bold text-gray-900">{user.username}</h2>
                  <p className="text-sm text-gray-500">
                    {user.firstName} {user.lastName}
                  </p>
                  <span className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.role === 'ROLE_ADMIN' 
                      ? 'bg-red-100 text-red-800' 
                      : user.role === 'ROLE_MANAGER'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                  }`}>
                    {user.role?.replace('ROLE_', '') || 'USER'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Email</h4>
                    <p className="text-gray-600">{user.email}</p>
                  </div>
                </div>
                
                {user.phoneNumber && (
                  <div className="flex items-start">
                    <PhoneIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Phone</h4>
                      <p className="text-gray-600">{user.phoneNumber}</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">User ID</h4>
                    <p className="text-gray-600">#{user.id}</p>
                  </div>
                  
                  {user.createdAt && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Member Since</h4>
                      <p className="text-gray-600">{formatDate(user.createdAt)}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200 flex space-x-3">
                <Link to={`/admin/users/${id}/edit`}>
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
                  loading={deleteUserMutation.isLoading}
                  onClick={handleDeleteUser}
                  disabled={user.role === 'ROLE_ADMIN'}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bookings and activity section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Bookings</h2>
                <div className="text-sm text-gray-500">
                  {bookings.length} total booking{bookings.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {bookings.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {bookings.map(booking => (
                    <div key={booking.id} className="py-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <TicketIcon className="h-5 w-5 text-gray-400 mr-2" />
                            <h3 className="text-base font-semibold text-gray-900">
                              {booking.movieTitle || 'Movie Booking'}
                            </h3>
                          </div>
                          <div className="mt-1 space-y-1">
                            <p className="text-sm text-gray-500">
                              Booking #: {booking.bookingNumber || booking.id}
                            </p>
                            {booking.screeningTime && (
                              <div className="flex items-center text-sm text-gray-500">
                                <CalendarIcon className="h-4 w-4 mr-1" />
                                {formatDate(booking.screeningTime)}
                              </div>
                            )}
                            {booking.theatreName && (
                              <p className="text-sm text-gray-500">
                                Theatre: {booking.theatreName}
                              </p>
                            )}
                            {booking.bookedSeats && booking.bookedSeats.length > 0 && (
                              <p className="text-sm text-gray-500">
                                Seats: {Array.isArray(booking.bookedSeats) 
                                  ? booking.bookedSeats.join(', ') 
                                  : booking.bookedSeats}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            booking.paymentStatus === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                            booking.paymentStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            booking.paymentStatus === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {booking.paymentStatus || 'UNKNOWN'}
                          </span>
                          {booking.totalAmount && (
                            <span className="text-base font-semibold text-gray-900 mt-1">
                              ${booking.totalAmount.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="mt-3">
                        <Link to={`/admin/bookings/${booking.id}`}>
                          <Button 
                            variant="outline" 
                            size="sm"
                            icon={<TicketIcon className="h-4 w-4 mr-1" />}
                          >
                            View Booking
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <TicketIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No bookings</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    This user has not made any bookings yet.
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Statistics card */}
          <div className="mt-6 bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">User Statistics</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{bookings.length}</div>
                  <div className="text-sm text-gray-500">Total Bookings</div>
                </div>
                
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {bookings.filter(b => b.paymentStatus === 'COMPLETED').length}
                  </div>
                  <div className="text-sm text-gray-500">Completed</div>
                </div>
                
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {bookings.filter(b => b.paymentStatus === 'PENDING').length}
                  </div>
                  <div className="text-sm text-gray-500">Pending</div>
                </div>
                
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    ${bookings.reduce((total, booking) => total + (booking.totalAmount || 0), 0).toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-500">Total Spent</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewUserPage;