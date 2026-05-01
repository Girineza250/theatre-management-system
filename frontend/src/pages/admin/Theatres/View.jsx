// src/pages/admin/Theatres/View.jsx
import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useGetTheatre, useDeleteTheatre } from '@hooks/useTheatres';
import { useToast } from '@contexts/ToastContext';
import Button from '@components/common/Button';
import LoadingSpinner from '@components/common/LoadingSpinner';
import NotFound from '@components/common/NotFound';
import Tabs from '@components/common/Tabs';
import {
  ArrowLeftIcon,
  PencilSquareIcon,
  TrashIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  BuildingStorefrontIcon,
  PlusIcon,
  CalendarIcon,
  TicketIcon
} from '@heroicons/react/24/outline';

const ViewTheatrePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  // Use the hook to fetch theatre details
  const {
    data: theatre,
    isLoading,
    error
  } = useGetTheatre(id);

  // Use the hook for deleting a theatre
  const { mutate: deleteTheatre, isPending: isDeletePending } = useDeleteTheatre({
    onSuccess: () => {
      showSuccess('Theatre deleted successfully');
      navigate('/admin/theatres');
    },
    onError: (err) => {
      showError(err.message || 'Failed to delete theatre');
      setIsDeleting(false);
    }
  });
  
  // Handle theatre deletion
  const handleDeleteTheatre = async () => {
    setIsDeleting(true);
    
    // Show confirmation dialog
    if (window.confirm('Are you sure you want to delete this theatre? This will also delete all associated screens, seats, screenings, and bookings.')) {
      deleteTheatre(id);
    } else {
      setIsDeleting(false);
    }
  };
  
  // Loading state
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  // Error state
  if (error || !theatre) {
    return <NotFound message="Theatre not found" />;
  }
  
  // Define tabs for the theatre details
  const tabs = [
    {
      label: 'Overview',
      content: (
        <div className="py-4">
          <div className="space-y-6">
            {/* Description */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600">{theatre.description || 'No description available.'}</p>
            </div>
            
            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Contact Information</h3>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                <dt className="text-sm font-medium text-gray-500">Address</dt>
                <dd className="text-sm text-gray-900">{theatre.address || 'Not provided'}</dd>
                
                <dt className="text-sm font-medium text-gray-500">Phone</dt>
                <dd className="text-sm text-gray-900">{theatre.phoneNumber || 'Not provided'}</dd>
                
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="text-sm text-gray-900">{theatre.email || 'Not provided'}</dd>
              </dl>
            </div>
          </div>
        </div>
      )
    },
    {
      label: `Screens (${theatre.totalScreens || 0})`,
      content: (
        <div className="py-4">
          {theatre.screens && theatre.screens.length > 0 ? (
            <div className="overflow-hidden border border-gray-200 sm:rounded-lg mb-4">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Screen Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Format
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Capacity
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Array.from({ length: theatre.totalScreens || 0 }, (_, i) => ({
                    number: i + 1,
                    capacity: 0,
                    format: 'STANDARD'
                  })).map(screen => (
                    <tr key={screen.number}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Screen {screen.number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {screen.format}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {screen.capacity} seats
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link to={`/admin/theatres/${id}/screens/${screen.number}/seats`}>
                          <Button 
                            variant="outline" 
                            size="sm"
                          >
                            Manage Seats
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">
                No screens have been configured for this theatre yet.
              </p>
            </div>
          )}
          
          <div className="flex justify-center">
            <Link to={`/admin/theatres/${id}/seats`}>
              <Button 
                variant="primary"
                icon={<PlusIcon className="h-5 w-5 mr-2" />}
              >
                Manage All Seats
              </Button>
            </Link>
          </div>
        </div>
      )
    },
    {
      label: `Screenings`,
      content: (
        <div className="py-4">
          <div className="text-center py-8">
            <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">View Screenings</h3>
            <p className="mt-1 text-sm text-gray-500">
              Manage screenings for this theatre
            </p>
            <div className="mt-6 flex justify-center space-x-4">
              <Link to={`/admin/screenings?theatreId=${id}`}>
                <Button 
                  variant="outline"
                  icon={<CalendarIcon className="h-5 w-5 mr-2" />}
                >
                  View All Screenings
                </Button>
              </Link>
              <Link to={`/admin/screenings/create?theatreId=${id}`}>
                <Button 
                  variant="primary"
                  icon={<PlusIcon className="h-5 w-5 mr-2" />}
                >
                  Add Screening
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )
    }
  ];
  
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
        <h1 className="text-2xl font-bold text-gray-900">Theatre Details</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Header section with theatre image and basic details */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            {/* Theatre image */}
            <div className="flex-shrink-0 h-44 w-60 bg-gray-200 rounded-lg overflow-hidden">
              {theatre.imageUrl ? (
                <img 
                  src={theatre.imageUrl} 
                  alt={theatre.name} 
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/400x200?text=No+Image';
                  }}
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <BuildingStorefrontIcon className="h-16 w-16 text-gray-400" />
                </div>
              )}
            </div>
            
            {/* Theatre info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{theatre.name}</h2>
                  <p className="text-gray-500 flex items-center mt-1">
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    {theatre.address || 'No address provided'}
                  </p>
                </div>
                
                {/* Action buttons */}
                <div className="flex space-x-3 mt-4 md:mt-0">
                  <Link to={`/admin/theatres/${id}/edit`}>
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
                    loading={isDeleting || isDeletePending}
                    onClick={handleDeleteTheatre}
                  >
                    Delete
                  </Button>
                </div>
              </div>
              
              {/* Additional meta */}
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <span className="text-gray-500 mr-2">Total Screens:</span>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    {theatre.totalScreens || 0}
                  </span>
                </div>
                
                <div className="flex items-start text-sm">
                  <PhoneIcon className="h-4 w-4 text-gray-400 mt-0.5 mr-2" />
                  <div>
                    <span className="text-gray-900">{theatre.phoneNumber || 'No phone number'}</span>
                  </div>
                </div>
                
                <div className="flex items-start text-sm">
                  <EnvelopeIcon className="h-4 w-4 text-gray-400 mt-0.5 mr-2" />
                  <div>
                    <span className="text-gray-900">{theatre.email || 'No email'}</span>
                  </div>
                </div>
              </div>
              
              {/* Quick actions */}
              <div className="mt-6 space-x-3">
                <Link to={`/admin/screenings/create?theatreId=${id}`}>
                  <Button 
                    variant="primary" 
                    size="sm"
                    icon={<PlusIcon className="h-5 w-5 mr-1" />}
                  >
                    Add Screening
                  </Button>
                </Link>
                
                <Link to={`/admin/theatres/${id}/seats`}>
                  <Button 
                    variant="outline" 
                    size="sm"
                    icon={<TicketIcon className="h-5 w-5 mr-1" />}
                  >
                    Manage Seats
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabs section for details, screens, and screenings */}
        <div className="p-6">
          <Tabs tabs={tabs} />
        </div>
      </div>
    </div>
  );
};

export default ViewTheatrePage;