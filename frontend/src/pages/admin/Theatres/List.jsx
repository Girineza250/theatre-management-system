// src/pages/admin/Theatres/List.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetTheatres, useDeleteTheatre } from '@hooks/useTheatres';
import { useToast } from '@contexts/ToastContext';
import Button from '@components/common/Button';
import LoadingSpinner from '@components/common/LoadingSpinner';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  ExclamationCircleIcon,
  BuildingStorefrontIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  ArrowsUpDownIcon
} from '@heroicons/react/24/outline';

const TheatreList = () => {
  const { showSuccess, showError } = useToast();
  
  // State for search and sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  
  // Get theatres data using the hook
  const {
    data: theatres = [],
    isLoading,
    refetch
  } = useGetTheatres();
  
  // Delete theatre mutation
  const {
    mutate: deleteTheatre,
    isPending: isDeleting
  } = useDeleteTheatre({
    onSuccess: () => {
      showSuccess('Theatre deleted successfully');
      refetch();
    },
    onError: (error) => {
      showError(error.message || 'Failed to delete theatre');
    }
  });
  
  // Handle theatre deletion
  const handleDeleteTheatre = (id) => {
    if (window.confirm('Are you sure you want to delete this theatre?')) {
      deleteTheatre(id);
    }
  };
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  // Handle sort change
  const handleSortChange = (field) => {
    if (sortBy === field) {
      // Toggle sort order if same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to ascending
      setSortBy(field);
      setSortOrder('asc');
    }
  };
  
  // Filter and sort theatres
  const filteredTheatres = theatres
    .filter(theatre => {
      // Search filter
      return searchQuery === '' || 
        theatre.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (theatre.address && theatre.address.toLowerCase().includes(searchQuery.toLowerCase()));
    })
    .sort((a, b) => {
      // Sort by selected field
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'address':
          comparison = (a.address || '').localeCompare(b.address || '');
          break;
        case 'totalScreens':
          comparison = (a.totalScreens || 0) - (b.totalScreens || 0);
          break;
        default:
          comparison = a.name.localeCompare(b.name);
      }
      
      // Apply sort order
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">Theatres</h1>
        <Link to="/admin/theatres/create">
          <Button 
            variant="primary"
            icon={<PlusIcon className="h-5 w-5 mr-2" />}
          >
            Add Theatre
          </Button>
        </Link>
      </div>
      
      {/* Search */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search theatres..."
                  className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
            
            {/* Reset search */}
            <div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchQuery('')}
                disabled={!searchQuery}
              >
                Reset
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Theatres grid */}
      {filteredTheatres.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTheatres.map(theatre => (
            <div key={theatre.id} className="bg-white rounded-lg shadow overflow-hidden">
              {/* Theatre image */}
              <div className="h-48 bg-gray-200">
                {theatre.imageUrl ? (
                  <img 
                    className="h-full w-full object-cover" 
                    src={theatre.imageUrl} 
                    alt={theatre.name} 
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
              
              {/* Theatre details */}
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">{theatre.name}</h2>
                <div className="space-y-2 mb-4">
                  <div className="flex items-start">
                    <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-sm text-gray-600">{theatre.address || 'No address provided'}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <PhoneIcon className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
                    <span className="text-sm text-gray-600">{theatre.phoneNumber || 'No phone number'}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
                    <span className="text-sm text-gray-600">{theatre.email || 'No email'}</span>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-900 mr-2">Total Screens:</span>
                    <span className="text-sm text-gray-600">{theatre.totalScreens || 0}</span>
                  </div>
                  
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                    {theatre.description || 'No description available'}
                  </p>
                </div>
                
                {/* Actions */}
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <Link to={`/admin/theatres/${theatre.id}/seats`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      Manage Seats
                    </Button>
                  </Link>
                  
                  <Link to={`/admin/theatres/${theatre.id}/screenings`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      Screenings
                    </Button>
                  </Link>
                </div>
                
                <div className="flex space-x-2 mt-2">
                  <Link to={`/admin/theatres/${theatre.id}/edit`} className="flex-1">
                    <Button 
                      variant="primary" 
                      size="sm" 
                      className="w-full"
                      icon={<PencilSquareIcon className="h-4 w-4 mr-1" />}
                    >
                      Edit
                    </Button>
                  </Link>
                  
                  <Button 
                    variant="danger" 
                    size="sm" 
                    className="flex-1"
                    icon={<TrashIcon className="h-4 w-4 mr-1" />}
                    onClick={() => handleDeleteTheatre(theatre.id)}
                    disabled={isDeleting}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <ExclamationCircleIcon className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No theatres found</h3>
          <p className="text-gray-500 mb-6">
            {searchQuery
              ? 'No theatres match your search criteria. Try adjusting your search.'
              : 'There are no theatres in the system yet. Add your first theatre to get started.'
            }
          </p>
          <Link to="/admin/theatres/create">
            <Button 
              variant="primary"
              icon={<PlusIcon className="h-5 w-5 mr-2" />}
            >
              Add Theatre
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default TheatreList;