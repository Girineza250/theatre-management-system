// src/pages/admin/Theatres/Create.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useCreateTheatre } from '@hooks/useTheatres'; // Changed import to use the specific hook
import { useToast } from '@contexts/ToastContext';
import Button from '@components/common/Button';
import Input from '@components/common/Input';
import LoadingSpinner from '@components/common/LoadingSpinner';
import {
  BuildingStorefrontIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';

const CreateTheatrePage = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [imagePreview, setImagePreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form validation rules
  const validationRules = {
    name: { required: true, minLength: 3 },
    address: { required: true },
    phoneNumber: { required: true, pattern: /^\+?[\d\s-()]+$/ },
    email: { required: true, email: true },
    description: { required: true, minLength: 10 },
    totalScreens: { required: true, min: 1, max: 20 }
  };
  
  // Initialize form
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm({
    defaultValues: {
      name: '',
      address: '',
      phoneNumber: '',
      email: '',
      description: '',
      totalScreens: 1,
      imageUrl: ''
    }
  });
  
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
  
  // Create theatre mutation
  const { mutate: createTheatre, isPending: isCreating } = useCreateTheatre({
    onSuccess: (data) => {
      showSuccess('Theatre created successfully');
      navigate(`/admin/theatres/${data.id}`);
    },
    onError: (error) => {
      showError(error.message || 'Failed to create theatre');
      setIsSubmitting(false);
    }
  });
  
  // Form submission handler
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    
    try {
      // Convert string to number for total screens
      data.totalScreens = Number(data.totalScreens);
      
      // Create theatre
      createTheatre(data);
    } catch (error) {
      showError(error.message || 'Failed to create theatre');
      setIsSubmitting(false);
    }
  };
  
  // Handle cancel
  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
      navigate('/admin/theatres');
    }
  };
  
  if (isCreating) {
    return <LoadingSpinner />;
  }
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Add New Theatre</h1>
        <Button
          variant="outline"
          onClick={handleCancel}
        >
          Cancel
        </Button>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow">
        <div className="p-6 space-y-6">
          {/* Theatre Image URL */}
          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
              Theatre Image URL
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <PhotoIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="imageUrl"
                placeholder="https://example.com/image.jpg"
                className={`pl-10 block w-full rounded-md shadow-sm sm:text-sm ${
                  errors.imageUrl
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                }`}
                {...register('imageUrl', {
                  pattern: {
                    value: /^(https?:\/\/[\w.-]+(\.[a-z]{2,})?(\/\S*)?|data:image\/(jpeg|png|gif);base64,[a-zA-Z0-9+/]+={0,2})$/i,
                    message: 'Please enter a valid URL or Base64 image data'
                  }
                })}
              />
            </div>
            {errors.imageUrl && (
              <p className="mt-1 text-sm text-red-600">{errors.imageUrl.message}</p>
            )}
            
            {/* Image preview */}
            {imagePreview && (
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image Preview
                </label>
                <div className="mt-1 h-48 max-w-xs bg-gray-100 rounded-md overflow-hidden">
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
          
          {/* Theatre Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Theatre Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <BuildingStorefrontIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="name"
                className={`pl-10 block w-full rounded-md shadow-sm sm:text-sm ${
                  errors.name
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                }`}
                {...register('name', { 
                  required: 'Theatre name is required',
                  minLength: {
                    value: 3,
                    message: 'Theatre name must be at least 3 characters'
                  }
                })}
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>
          
          {/* Address */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPinIcon className="h-5 w-5 text-gray-400" />
              </div>
              <textarea
                id="address"
                name="address"
                rows={3}
                className={`pl-10 block w-full rounded-md shadow-sm sm:text-sm ${
                  errors.address
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                }`}
                {...register('address', { 
                  required: 'Address is required'
                })}
              />
            </div>
            {errors.address && (
              <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
            )}
          </div>
          
          {/* Phone Number */}
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <PhoneIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                className={`pl-10 block w-full rounded-md shadow-sm sm:text-sm ${
                  errors.phoneNumber
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                }`}
                {...register('phoneNumber', {
                  required: 'Phone number is required',
                  pattern: {
                    value: /^\+?[\d\s-()]+$/,
                    message: 'Please enter a valid phone number'
                  }
                })}
              />
            </div>
            {errors.phoneNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.phoneNumber.message}</p>
            )}
          </div>
          
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <EnvelopeIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                id="email"
                name="email"
                className={`pl-10 block w-full rounded-md shadow-sm sm:text-sm ${
                  errors.email
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                }`}
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Please enter a valid email address'
                  }
                })}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>
          
          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              className={`block w-full rounded-md shadow-sm sm:text-sm ${
                errors.description
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
              }`}
              {...register('description', {
                required: 'Description is required',
                minLength: {
                  value: 10,
                  message: 'Description must be at least 10 characters long'
                }
              })}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>
          
          {/* Total Screens */}
          <div>
            <label htmlFor="totalScreens" className="block text-sm font-medium text-gray-700 mb-1">
              Total Screens
            </label>
            <input
              type="number"
              id="totalScreens"
              name="totalScreens"
              min="1"
              max="20"
              className={`block w-full rounded-md shadow-sm sm:text-sm ${
                errors.totalScreens
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
              }`}
              {...register('totalScreens', {
                required: 'Total screens is required',
                min: {
                  value: 1,
                  message: 'Theatre must have at least 1 screen'
                },
                max: {
                  value: 20,
                  message: 'Theatre cannot have more than 20 screens'
                }
              })}
            />
            {errors.totalScreens && (
              <p className="mt-1 text-sm text-red-600">{errors.totalScreens.message}</p>
            )}
          </div>
        </div>
        
        {/* Form actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting || isCreating}
            loading={isSubmitting || isCreating}
          >
            Create Theatre
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateTheatrePage;