// src/pages/auth/TwoFactorAuth.jsx - Fixed version
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import { useToast } from '@contexts/ToastContext';
import Button from '@components/common/Button';
import Input from '@components/common/Input';
import { LockClosedIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

const TwoFactorAuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOtp, twoFactorData, requiresTwoFactor, loading, isAuthenticated, isAdmin, isManager } = useAuth();
  const { showSuccess, showError } = useToast();
  
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // If not in 2FA state and not loading, redirect to login
  useEffect(() => {
    if (!requiresTwoFactor && !loading && !isAuthenticated) {
      console.log('No 2FA required and not authenticated, redirecting to login');
      navigate('/login');
      return;
    }
    
    // If already authenticated (2FA completed), redirect based on role
    if (isAuthenticated && !loading) {
      console.log('2FA completed, user authenticated, determining redirect...');
      
      // Determine redirect path based on role and location state
      let redirectPath = '/';
      
      if (isAdmin || isManager) {
        redirectPath = '/admin';
        console.log('Admin/Manager user after 2FA, redirecting to:', redirectPath);
      } else {
        redirectPath = location.state?.from || '/';
        console.log('Regular user after 2FA, redirecting to:', redirectPath);
      }
      
      navigate(redirectPath, { replace: true });
    }
  }, [requiresTwoFactor, loading, isAuthenticated, navigate, location, isAdmin, isManager]);
  
  // Handle OTP verification
  const handleVerify = async (e) => {
    e.preventDefault();
    
    if (!otp) {
      showError('Please enter the verification code');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const success = await verifyOtp(otp);
      
      if (success) {
        showSuccess('2FA verification successful!');
        // Don't redirect here - let useEffect handle it after auth state updates
      } else {
        showError('Invalid verification code. Please try again.');
      }
    } catch (error) {
      showError(error.message || 'Verification failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // If not in 2FA state or loading, show loading or nothing
  if (!requiresTwoFactor || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  // If already authenticated (shouldn't happen due to useEffect, but safety check)
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <ShieldCheckIcon className="mx-auto h-16 w-16 text-primary-600" />
          <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Two-Factor Authentication
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            A verification code has been sent to {twoFactorData?.email}
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleVerify}>
          <div className="rounded-md shadow-sm">
            <Input
              id="otp"
              name="otp"
              type="text"
              placeholder="Enter 6-digit verification code"
              autoComplete="one-time-code"
              startIcon={<LockClosedIcon className="h-5 w-5 text-gray-400" />}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="rounded-md"
              required
              pattern="[0-9]{6}"
              maxLength={6}
            />
          </div>
          
          <div>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              loading={isSubmitting}
            >
              Verify
            </Button>
          </div>
          
          <div className="text-sm text-center">
            <p className="mt-2 text-gray-600">
              Didn't receive the code? Please check your spam folder or
              <button
                type="button"
                className="ml-1 font-medium text-primary-600 hover:text-primary-500"
                onClick={() => navigate('/login')}
              >
                try again
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TwoFactorAuthPage;