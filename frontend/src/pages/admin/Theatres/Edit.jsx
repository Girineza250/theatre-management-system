// src/pages/admin/Theatres/Edit.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetTheatre, useUpdateTheatre } from '@hooks/useTheatres';
import { useForm } from 'react-hook-form';
import { useToast } from '@contexts/ToastContext';
import Button from '@components/common/Button';
import Input from '@components/common/Input';
import LoadingSpinner from '@components/common/LoadingSpinner';
import NotFound from '@components/common/NotFound';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const EditTheatrePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [imagePreview, setImagePreview] = useState('');
  
  // Get theatre details
  const {
    data: theatre,
    isLoading,
    error
  } = useGetTheatre(id);
  
  // Form handling
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm();
  
  // Watch image URL for preview
  const imageUrl = watch('imageUrl');
  
  // Update image preview when URL changes
  useEffect(() => {
    if (imageUrl) {
      setImagePreview(imageUrl);
    } else {
      setImagePreview('');
    }
  }, [imageUrl]);
  
  // Set form default values when theatre data is loaded
  useEffect(() => {
    if (theatre) {
      // Set form default values
      Object.entries(theatre).forEach(([key, value]) => {
        setValue(key, value);
      });
      
      // Set image preview
      if (theatre.imageUrl) {
        setImagePreview(theatre.imageUrl);
      }
    }
  }, [theatre, setValue]);
  
  // Update theatre mutation
  const { mutate: updateTheatre, isPending: isUpdating } = useUpdateTheatre({
    onSuccess: () => {
      showSuccess('Theatre updated successfully');
      navigate(`/admin/theatres/${id}`);
    },
    onError: (error) => {
      showError(error.message || 'Failed to update theatre');
    }
  });
  
  // Form submission handler
  const onSubmit = async (data) => {
    try {
      // Convert string to number for total screens
      data.totalScreens = Number(data.totalScreens);
      
      // Update theatre
      updateTheatre({ id, theatreData: data });
    } catch (error) {
      showError(error.message || 'Failed to update theatre');
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
        <h1 className="text-2xl font-bold text-gray-900">Edit Theatre</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column - Main details */}
            <div className="space-y-6">
              {/* Theatre name */}
              <Input
                id="name"
                label="Theatre Name"
                placeholder="Enter theatre name"
                error={errors.name?.message}
                required
                {...register('name', { 
                  required: 'Theatre name is required',
                  maxLength: {
                    value: 100,
                    message: 'Theatre name cannot exceed 100 characters'
                  }
                })}
              />
              
              {/* Address */}
              <Input
                id="address"
                label="Address"
                placeholder="Enter full address"
                error={errors.address?.message}
                required
                {...register('address', { 
                  required: 'Address is required',
                  maxLength: {
                    value: 200,
                    message: 'Address cannot exceed 200 characters'
                  }
                })}
              />
              
              {/* Phone number */}
              <Input
                id="phoneNumber"
                label="Phone Number"
                placeholder="Enter phone number"
                error={errors.phoneNumber?.message}
                {...register('phoneNumber', {
                  maxLength: {
                    value: 20,
                    message: 'Phone number cannot exceed 20 characters'
                  }
                })}
              />
              
              {/* Email */}
              <Input
                id="email"
                type="email"
                label="Email"
                placeholder="Enter email address"
                error={errors.email?.message}
                {...register('email', {
                  maxLength: {
                    value: 100,
                    message: 'Email cannot exceed 100 characters'
                  },
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
              />
            </div>
            
            {/* Right column - Additional details */}
            <div className="space-y-6">
              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  rows={5}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Enter theatre description"
                  {...register('description', {
                    maxLength: {
                      value: 500,
                      message: 'Description cannot exceed 500 characters'
                    }
                  })}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>
              
              {/* Total screens */}
              <Input
                id="totalScreens"
                type="number"
                label="Total Screens"
                placeholder="Enter number of screens"
                min={1}
                error={errors.totalScreens?.message}
                required
                {...register('totalScreens', { 
                  required: 'Total screens is required',
                  min: {
                    value: 1,
                    message: 'Total screens must be at least 1'
                  },
                  max: {
                    value: 30,
                    message: 'Total screens cannot exceed 30'
                  }
                })}
              />
              
              {/* Image URL */}
              <Input
                id="imageUrl"
                label="Image URL"
                placeholder="https://example.com/image.jpg"
                error={errors.imageUrl?.message}
                {...register('imageUrl', {
                  maxLength: {
                    value: 255,
                    message: 'URL cannot exceed 255 characters'
                  },
                  pattern: {
                    value: /^(https?:\/\/)?[\w.-]+\.[a-z]{2,}(\/\S*)?$/i,
                    message: 'Please enter a valid URL'
                  }
                })}
              />
              
              {/* Image preview */}
              {imagePreview && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image Preview
                  </label>
                  <div className="mt-1 h-40 w-full bg-gray-100 rounded-md overflow-hidden">
                    <img 
                      src={imagePreview}
                      alt="Theatre preview" 
                      className="h-full w-full object-cover" 
                      onError={() => setImagePreview('')}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-8 flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/theatres')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={isUpdating}
            >
              Update Theatre
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTheatrePage;