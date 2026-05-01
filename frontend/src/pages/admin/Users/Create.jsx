// src/pages/admin/Users/Create.jsx - Updated to use real data
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useToast } from '@contexts/ToastContext';
import { useCreateUser } from '@hooks/useUsers';
import Button from '@components/common/Button';
import Input from '@components/common/Input';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const CreateUserPage = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  
  // Form handling
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      phoneNumber: '',
      role: 'ROLE_USER'
    }
  });
  
  // Watch password for confirmation validation
  const password = watch('password');
  
  // Create user mutation
  const createUserMutation = useCreateUser({
    onSuccess: (data) => {
      showSuccess('User created successfully');
      navigate('/admin/users');
    },
    onError: (error) => {
      showError(error.message || 'Failed to create user');
    }
  });
  
  // Form submission handler
  const onSubmit = async (data) => {
    // Remove confirmPassword before sending to API
    const { confirmPassword, ...userData } = data;
    
    // Convert role string to proper format if needed
    if (userData.role && !userData.role.startsWith('ROLE_')) {
      userData.role = `ROLE_${userData.role}`;
    }
    
    createUserMutation.mutate(userData);
  };
  
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
        <h1 className="text-2xl font-bold text-gray-900">Create User</h1>
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
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
              />
              
              {/* Password */}
              <Input
                id="password"
                type="password"
                label="Password"
                placeholder="Enter password"
                error={errors.password?.message}
                required
                {...register('password', { 
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  },
                  maxLength: {
                    value: 40,
                    message: 'Password cannot exceed 40 characters'
                  }
                })}
              />
              
              {/* Confirm Password */}
              <Input
                id="confirmPassword"
                type="password"
                label="Confirm Password"
                placeholder="Confirm password"
                error={errors.confirmPassword?.message}
                required
                {...register('confirmPassword', { 
                  required: 'Please confirm your password',
                  validate: value => 
                    value === password || 'The passwords do not match'
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
              </div>
            </div>
            
            {/* Right column - Personal details */}
            <div className="space-y-6">
              <h2 className="text-lg font-medium text-gray-900">Personal Information</h2>
              
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
                  }
                })}
              />
              
              {/* Phone Number */}
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
            </div>
          </div>
          
          <div className="mt-8 flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/users')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={createUserMutation.isLoading}
              disabled={createUserMutation.isLoading}
            >
              Create User
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUserPage;