// src/pages/admin/Users/Edit.jsx - Complete updated version with real data integration
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useToast } from '@contexts/ToastContext';
import { useGetUser, useUpdateUser } from '@hooks/useUsers';
import Button from '@components/common/Button';
import Input from '@components/common/Input';
import LoadingSpinner from '@components/common/LoadingSpinner';
import NotFound from '@components/common/NotFound';
import { ArrowLeftIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const EditUserPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [passwordSection, setPasswordSection] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
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
  
  // Update user mutation
  const updateUserMutation = useUpdateUser({
    onSuccess: () => {
      showSuccess('User updated successfully');
      navigate(`/admin/users/${id}`);
    },
    onError: (error) => {
      console.error('Update user error:', error);
      showError(error.message || 'Failed to update user');
    }
  });
  
  // Form handling
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      username: '',
      email: '',
      firstName: '',
      lastName: '',
      phoneNumber: '',
      role: 'ROLE_USER',
      password: '',
      confirmPassword: ''
    }
  });
  
  // Watch password for confirmation validation
  const password = watch('password');
  
  // Extract user data from the response
  const user = userData?.user || userData;
  
  // Set form default values when user data is loaded
  useEffect(() => {
    if (user) {
      console.log('Setting form values with user data:', user);
      reset({
        username: user.username || '',
        email: user.email || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phoneNumber: user.phoneNumber || '',
        role: user.role || 'ROLE_USER',
        password: '',
        confirmPassword: ''
      });
    }
  }, [user, reset]);
  
  // Form submission handler
  const onSubmit = async (data) => {
    try {
      console.log('Form submission data:', data);
      
      // Remove confirm password before sending to API
      const { confirmPassword, ...userData } = data;
      
      // Only include password if the password section is open and a password was entered
      if (!passwordSection || !userData.password?.trim()) {
        delete userData.password;
      }
      
      // Ensure role is in correct format
      if (userData.role && !userData.role.startsWith('ROLE_')) {
        userData.role = `ROLE_${userData.role}`;
      }
      
      console.log('Sending update request with data:', userData);
      
      // Update user
      updateUserMutation.mutate({ id: parseInt(id), userData });
    } catch (error) {
      console.error('Form submission error:', error);
      showError(error.message || 'Failed to update user');
    }
  };
  
  // Toggle password section
  const togglePasswordSection = () => {
    setPasswordSection(!passwordSection);
    if (!passwordSection) {
      // Reset password fields when opening section
      setValue('password', '');
      setValue('confirmPassword', '');
      setShowPassword(false);
      setShowConfirmPassword(false);
    }
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
  if (error || !user) {
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
        <h1 className="text-2xl font-bold text-gray-900">
          Edit User: {user.username}
        </h1>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column - Account details */}
            <div className="space-y-6">
              <h2 className="text-lg font-medium text-gray-900">Account Information</h2>
              
              {/* Username */}
              <Input
                id="username"
                label="Username"
                placeholder="Enter username"
                error={errors.username?.message}
                required
                helperText="Username must be unique and contain only letters, numbers, and underscores"
                {...register('username', { 
                  required: 'Username is required',
                  minLength: {
                    value: 3,
                    message: 'Username must be at least 3 characters'
                  },
                  maxLength: {
                    value: 20,
                    message: 'Username cannot exceed 20 characters'
                  },
                  pattern: {
                    value: /^[a-zA-Z0-9_]+$/,
                    message: 'Username can only contain letters, numbers and underscores'
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
                required
                helperText="Email must be unique and valid"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
              />
              
              {/* Role */}
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  id="role"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  {...register('role', { required: 'Role is required' })}
                >
                  <option value="ROLE_USER">User</option>
                  <option value="ROLE_MANAGER">Manager</option>
                  <option value="ROLE_ADMIN">Admin</option>
                </select>
                {errors.role && (
                  <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  User role determines access permissions in the system
                </p>
              </div>
              
              {/* Password toggle button */}
              <div className="border-t border-gray-200 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={togglePasswordSection}
                >
                  {passwordSection ? 'Cancel Password Change' : 'Change Password'}
                </Button>
                <p className="mt-2 text-sm text-gray-500">
                  Leave password fields empty to keep the current password
                </p>
              </div>
              
              {/* Password section (conditionally shown) */}
              {passwordSection && (
                <div className="space-y-6 mt-4 p-4 border border-gray-200 rounded-md bg-gray-50">
                  <h3 className="text-sm font-medium text-gray-900">Change Password</h3>
                  
                  {/* Password */}
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      label="New Password"
                      placeholder="Enter new password"
                      error={errors.password?.message}
                      helperText="Password must be at least 6 characters long"
                      endIcon={
                        <button
                          type="button"
                          className="text-gray-400 hover:text-gray-600"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeSlashIcon className="h-5 w-5" />
                          ) : (
                            <EyeIcon className="h-5 w-5" />
                          )}
                        </button>
                      }
                      {...register('password', { 
                        required: passwordSection ? 'Password is required when changing password' : false,
                        minLength: passwordSection ? {
                          value: 6,
                          message: 'Password must be at least 6 characters'
                        } : undefined,
                        maxLength: {
                          value: 40,
                          message: 'Password cannot exceed 40 characters'
                        }
                      })}
                    />
                  </div>
                  
                  {/* Confirm Password */}
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      label="Confirm New Password"
                      placeholder="Confirm new password"
                      error={errors.confirmPassword?.message}
                      endIcon={
                        <button
                          type="button"
                          className="text-gray-400 hover:text-gray-600"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <EyeSlashIcon className="h-5 w-5" />
                          ) : (
                            <EyeIcon className="h-5 w-5" />
                          )}
                        </button>
                      }
                      {...register('confirmPassword', { 
                        validate: value => {
                          if (passwordSection && password && value !== password) {
                            return 'The passwords do not match';
                          }
                          return true;
                        }
                      })}
                    />
                  </div>
                </div>
              )}
            </div>
            
            {/* Right column - Personal details */}
            <div className="space-y-6">
              <h2 className="text-lg font-medium text-gray-900">Personal Information</h2>
              
              {/* User ID (read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User ID
                </label>
                <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 text-sm">
                  #{user.id}
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Internal user identifier (read-only)
                </p>
              </div>
              
              {/* First Name */}
              <Input
                id="firstName"
                label="First Name"
                placeholder="Enter first name"
                error={errors.firstName?.message}
                required
                {...register('firstName', { 
                  required: 'First name is required',
                  maxLength: {
                    value: 50,
                    message: 'First name cannot exceed 50 characters'
                  },
                  pattern: {
                    value: /^[a-zA-Z\s]+$/,
                    message: 'First name can only contain letters and spaces'
                  }
                })}
              />
              
              {/* Last Name */}
              <Input
                id="lastName"
                label="Last Name"
                placeholder="Enter last name"
                error={errors.lastName?.message}
                required
                {...register('lastName', { 
                  required: 'Last name is required',
                  maxLength: {
                    value: 50,
                    message: 'Last name cannot exceed 50 characters'
                  },
                  pattern: {
                    value: /^[a-zA-Z\s]+$/,
                    message: 'Last name can only contain letters and spaces'
                  }
                })}
              />
              
              {/* Phone Number */}
              <Input
                id="phoneNumber"
                label="Phone Number"
                placeholder="Enter phone number (optional)"
                error={errors.phoneNumber?.message}
                helperText="Optional - Enter phone number with country code"
                {...register('phoneNumber', {
                  maxLength: {
                    value: 20,
                    message: 'Phone number cannot exceed 20 characters'
                  },
                  pattern: {
                    value: /^[\+]?[\d\s\-\(\)]+$/,
                    message: 'Invalid phone number format'
                  }
                })}
              />
              
              {/* Account Status Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Account Status</h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <p>Status: <span className="font-medium">Active</span></p>
                  {user.createdAt && (
                    <p>Created: <span className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</span></p>
                  )}
                  {user.lastLogin && (
                    <p>Last Login: <span className="font-medium">{new Date(user.lastLogin).toLocaleDateString()}</span></p>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Form Actions */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin/users')}
                disabled={isSubmitting || updateUserMutation.isLoading}
              >
                Cancel
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate(`/admin/users/${id}`)}
                disabled={isSubmitting || updateUserMutation.isLoading}
              >
                View User
              </Button>
              
              <Button
                type="submit"
                variant="primary"
                loading={isSubmitting || updateUserMutation.isLoading}
                disabled={isSubmitting || updateUserMutation.isLoading}
              >
                {isSubmitting || updateUserMutation.isLoading ? 'Updating...' : 'Update User'}
              </Button>
            </div>
          </div>
          
          {/* Debug info (only in development) */}
          {import.meta.env.DEV && (
            <div className="mt-6 p-4 bg-gray-100 rounded-md">
              <details>
                <summary className="text-sm font-medium text-gray-700 cursor-pointer">
                  Debug Information
                </summary>
                <pre className="mt-2 text-xs text-gray-600 overflow-auto">
                  User Data: {JSON.stringify(user, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default EditUserPage;