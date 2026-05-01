import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '@contexts/AuthContext';
import { useToast } from '@contexts/ToastContext';
import Button from '@components/common/Button';
import Input from '@components/common/Input';
import { AtSymbolIcon, LockClosedIcon, UserIcon, PhoneIcon } from '@heroicons/react/24/outline';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const { showSuccess, showError } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get form utilities from react-hook-form
  const { 
    register, 
    handleSubmit, 
    watch,
    formState: { errors }
  } = useForm();
  
  // Watch password field for confirmation validation
  const password = watch('password', '');
  
  // Handle form submission
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    
    try {
      // Register user
      const success = await registerUser(data);
      
      if (success) {
        // Registration successful
        showSuccess('Registration successful! Please login.');
        navigate('/login');
      } else {
        // Registration failed
        showError('Registration failed. Please try again.');
      }
    } catch (error) {
      showError(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
              sign in to your existing account
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            {/* Username */}
            <Input
              id="username"
              name="username"
              type="text"
              label="Username"
              placeholder="Choose a username"
              autoComplete="username"
              startIcon={<AtSymbolIcon className="h-5 w-5 text-gray-400" />}
              error={errors.username?.message}
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
              name="email"
              type="email"
              label="Email address"
              placeholder="your.email@example.com"
              autoComplete="email"
              startIcon={<AtSymbolIcon className="h-5 w-5 text-gray-400" />}
              error={errors.email?.message}
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
              name="password"
              type="password"
              label="Password"
              placeholder="Create a password"
              autoComplete="new-password"
              startIcon={<LockClosedIcon className="h-5 w-5 text-gray-400" />}
              error={errors.password?.message}
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
              name="confirmPassword"
              type="password"
              label="Confirm Password"
              placeholder="Confirm your password"
              autoComplete="new-password"
              startIcon={<LockClosedIcon className="h-5 w-5 text-gray-400" />}
              error={errors.confirmPassword?.message}
              {...register('confirmPassword', { 
                required: 'Please confirm your password',
                validate: value => 
                  value === password || 'The passwords do not match'
              })}
            />
            
            {/* First Name */}
            <Input
              id="firstName"
              name="firstName"
              type="text"
              label="First Name"
              placeholder="Your first name"
              autoComplete="given-name"
              startIcon={<UserIcon className="h-5 w-5 text-gray-400" />}
              error={errors.firstName?.message}
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
              name="lastName"
              type="text"
              label="Last Name"
              placeholder="Your last name"
              autoComplete="family-name"
              startIcon={<UserIcon className="h-5 w-5 text-gray-400" />}
              error={errors.lastName?.message}
              {...register('lastName', { 
                required: 'Last name is required',
                maxLength: {
                  value: 50,
                  message: 'Last name cannot exceed 50 characters'
                }
              })}
            />
            
            {/* Phone Number (Optional) */}
            <Input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              label="Phone Number (Optional)"
              placeholder="Your phone number"
              autoComplete="tel"
              startIcon={<PhoneIcon className="h-5 w-5 text-gray-400" />}
              error={errors.phoneNumber?.message}
              {...register('phoneNumber', { 
                maxLength: {
                  value: 20,
                  message: 'Phone number cannot exceed 20 characters'
                }
              })}
            />
          </div>
          
          {/* Terms and Conditions */}
          <div className="flex items-center">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              {...register('terms', { 
                required: 'You must agree to the terms and conditions'
              })}
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
              I agree to the{' '}
              <a href="#" className="text-primary-600 hover:text-primary-500">
                Terms and Conditions
              </a>
            </label>
          </div>
          {errors.terms && (
            <p className="mt-1 text-sm text-red-600">{errors.terms.message}</p>
          )}
          
          <div>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              loading={isSubmitting}
            >
              Register
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;