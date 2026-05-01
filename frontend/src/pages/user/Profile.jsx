// src/pages/user/Profile.jsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@contexts/AuthContext';
import { useToast } from '@contexts/ToastContext';
import Button from '@components/common/Button';
import Input from '@components/common/Input';
import Tabs from '@components/common/Tabs';
import { 
  UserIcon, 
  KeyIcon, 
  ShieldCheckIcon, 
  CheckCircleIcon,
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';

const ProfilePage = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const { showSuccess, showError } = useToast();
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // Profile form
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors }
  } = useForm({
    defaultValues: {
      username: user?.username || '',
      email: user?.email || '',
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phoneNumber: user?.phoneNumber || ''
    }
  });
  
  // Password form
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    watch: watchPassword,
    formState: { errors: passwordErrors }
  } = useForm();
  
  // Watch new password for confirmation validation
  const newPassword = watchPassword('newPassword', '');
  
  // Handle profile update
  const onProfileSubmit = async (data) => {
    setIsUpdatingProfile(true);
    
    try {
      await updateProfile(data);
      showSuccess('Profile updated successfully');
    } catch (error) {
      showError(error.message || 'Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };
  
  // Handle password change
  const onPasswordSubmit = async (data) => {
    setIsChangingPassword(true);
    
    try {
      await changePassword(data);
      showSuccess('Password changed successfully');
      resetPasswordForm();
    } catch (error) {
      showError(error.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };
  
  // Profile tab content
  const ProfileTabContent = () => (
    <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Input
          label="Username"
          id="username"
          name="username"
          startIcon={<UserCircleIcon className="h-5 w-5 text-gray-400" />}
          error={profileErrors.username?.message}
          disabled={true} // Username usually cannot be changed
          {...registerProfile('username')}
        />
        
        <Input
          label="Email"
          id="email"
          name="email"
          type="email"
          startIcon={<EnvelopeIcon className="h-5 w-5 text-gray-400" />}
          error={profileErrors.email?.message}
          {...registerProfile('email', {
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address'
            }
          })}
        />
        
        <Input
          label="First Name"
          id="firstName"
          name="firstName"
          startIcon={<UserIcon className="h-5 w-5 text-gray-400" />}
          error={profileErrors.firstName?.message}
          {...registerProfile('firstName', {
            required: 'First name is required'
          })}
        />
        
        <Input
          label="Last Name"
          id="lastName"
          name="lastName"
          startIcon={<UserIcon className="h-5 w-5 text-gray-400" />}
          error={profileErrors.lastName?.message}
          {...registerProfile('lastName', {
            required: 'Last name is required'
          })}
        />
        
        <Input
          label="Phone Number"
          id="phoneNumber"
          name="phoneNumber"
          type="tel"
          startIcon={<PhoneIcon className="h-5 w-5 text-gray-400" />}
          error={profileErrors.phoneNumber?.message}
          {...registerProfile('phoneNumber')}
        />
      </div>
      
      <div className="flex justify-end">
        <Button
          type="submit"
          variant="primary"
          loading={isUpdatingProfile}
        >
          Save Changes
        </Button>
      </div>
    </form>
  );
  
  // Security tab content
  const SecurityTabContent = () => (
    <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-6">
      <Input
        label="Current Password"
        id="currentPassword"
        name="currentPassword"
        type="password"
        startIcon={<KeyIcon className="h-5 w-5 text-gray-400" />}
        error={passwordErrors.currentPassword?.message}
        {...registerPassword('currentPassword', {
          required: 'Current password is required'
        })}
      />
      
      <Input
        label="New Password"
        id="newPassword"
        name="newPassword"
        type="password"
        startIcon={<KeyIcon className="h-5 w-5 text-gray-400" />}
        error={passwordErrors.newPassword?.message}
        {...registerPassword('newPassword', {
          required: 'New password is required',
          minLength: {
            value: 6,
            message: 'Password must be at least 6 characters'
          }
        })}
      />
      
      <Input
        label="Confirm New Password"
        id="confirmNewPassword"
        name="confirmNewPassword"
        type="password"
        startIcon={<KeyIcon className="h-5 w-5 text-gray-400" />}
        error={passwordErrors.confirmNewPassword?.message}
        {...registerPassword('confirmNewPassword', {
          required: 'Please confirm your new password',
          validate: value =>
            value === newPassword || 'The passwords do not match'
        })}
      />
      
      <div className="flex justify-end">
        <Button
          type="submit"
          variant="primary"
          loading={isChangingPassword}
        >
          Change Password
        </Button>
      </div>
    </form>
  );
  
  // Preferences tab content
  const PreferencesTabContent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Email Notifications</h3>
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="booking-confirmations"
                name="booking-confirmations"
                type="checkbox"
                defaultChecked
                className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="booking-confirmations" className="font-medium text-gray-700">
                Booking Confirmations
              </label>
              <p className="text-gray-500">Receive emails when you make a new booking.</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="movie-releases"
                name="movie-releases"
                type="checkbox"
                defaultChecked
                className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="movie-releases" className="font-medium text-gray-700">
                New Movie Releases
              </label>
              <p className="text-gray-500">Get notified about new movies and screenings.</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="promotions"
                name="promotions"
                type="checkbox"
                className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="promotions" className="font-medium text-gray-700">
                Promotions and Offers
              </label>
              <p className="text-gray-500">Receive special offers and discounts.</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="pt-6 border-t border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Theme Preferences</h3>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input 
              type="radio" 
              id="theme-light" 
              name="theme" 
              value="light" 
              className="sr-only"
              defaultChecked
            />
            <label 
              htmlFor="theme-light"
              className="cursor-pointer flex flex-col items-center"
            >
              <div className="w-16 h-16 rounded-full bg-white border-2 border-primary-600 flex items-center justify-center">
                <span className="block w-8 h-8 rounded-full bg-yellow-400"></span>
              </div>
              <span className="mt-2 text-sm font-medium">Light</span>
            </label>
          </div>
          
          <div className="relative">
            <input 
              type="radio" 
              id="theme-dark" 
              name="theme" 
              value="dark" 
              className="sr-only"
            />
            <label 
              htmlFor="theme-dark"
              className="cursor-pointer flex flex-col items-center"
            >
              <div className="w-16 h-16 rounded-full bg-gray-800 border-2 border-gray-300 flex items-center justify-center">
                <span className="block w-8 h-8 rounded-full bg-gray-600"></span>
              </div>
              <span className="mt-2 text-sm font-medium">Dark</span>
            </label>
          </div>
          
          <div className="relative">
            <input 
              type="radio" 
              id="theme-system" 
              name="theme" 
              value="system" 
              className="sr-only"
            />
            <label 
              htmlFor="theme-system"
              className="cursor-pointer flex flex-col items-center"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-white to-gray-800 border-2 border-gray-300 flex items-center justify-center">
                <span className="block w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-gray-600"></span>
              </div>
              <span className="mt-2 text-sm font-medium">System</span>
            </label>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end pt-6">
        <Button
          type="button"
          variant="primary"
          onClick={() => showSuccess('Preferences saved')}
        >
          Save Preferences
        </Button>
      </div>
    </div>
  );
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 flex flex-col sm:flex-row items-center bg-gray-50 border-b">
            <div className="h-24 w-24 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 text-4xl font-bold mb-4 sm:mb-0">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="sm:ml-6 text-center sm:text-left">
              <h2 className="text-xl font-bold text-gray-900">{user?.username}</h2>
              <p className="text-gray-600">{user?.email}</p>
              <p className="text-sm text-gray-500 mt-1">Member since {new Date().getFullYear()}</p>
            </div>
          </div>
          
          <Tabs 
            tabs={[
              { 
                label: "Profile", 
                icon: <UserIcon className="h-5 w-5" />,
                content: <ProfileTabContent />
              },
              { 
                label: "Security", 
                icon: <ShieldCheckIcon className="h-5 w-5" />,
                content: <SecurityTabContent />
              },
              { 
                label: "Preferences", 
                icon: <CheckCircleIcon className="h-5 w-5" />,
                content: <PreferencesTabContent />
              }
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;