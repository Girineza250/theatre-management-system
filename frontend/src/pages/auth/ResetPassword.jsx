// src/pages/auth/ResetPassword.jsx - Fixed version with better error handling
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import { useToast } from '@contexts/ToastContext';
import Button from '@components/common/Button';
import Input from '@components/common/Input';
import { LockClosedIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { validateResetToken, resetPassword } = useAuth();
  const { showSuccess, showError } = useToast();
  
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [isTokenValidating, setIsTokenValidating] = useState(true);
  const [resetComplete, setResetComplete] = useState(false);
  const [validationError, setValidationError] = useState('');
  
  // Get token from URL params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenFromUrl = params.get('token');
    
    console.log('Token from URL:', tokenFromUrl); // Debug log
    
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      validateToken(tokenFromUrl);
    } else {
      setIsTokenValidating(false);
      setValidationError('Reset token not found in URL. Please request a new password reset link.');
      showError('Reset token not found in URL. Please request a new password reset link.');
    }
  }, [location]);
  
  // Validate token
  const validateToken = async (resetToken) => {
    setIsTokenValidating(true);
    setValidationError('');
    
    console.log('Validating token:', resetToken); // Debug log
    
    try {
      const result = await validateResetToken(resetToken);
      
      console.log('Validation result:', result); // Debug log
      
      if (result.valid && result.data) {
        setIsTokenValid(true);
        setEmail(result.data.email);
        console.log('Token is valid, email:', result.data.email); // Debug log
      } else {
        setIsTokenValid(false);
        const errorMsg = result.error || 'Invalid or expired reset token. Please request a new password reset link.';
        setValidationError(errorMsg);
        showError(errorMsg);
        console.log('Token validation failed:', result); // Debug log
      }
    } catch (error) {
      console.error('Token validation error:', error); // Debug log
      setIsTokenValid(false);
      const errorMsg = error.message || 'Invalid or expired reset token. Please request a new password reset link.';
      setValidationError(errorMsg);
      showError(errorMsg);
    } finally {
      setIsTokenValidating(false);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      showError('Passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      showError('Password must be at least 6 characters long');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log('Attempting to reset password with token:', token); // Debug log
      const success = await resetPassword(token, newPassword);
      
      if (success) {
        setResetComplete(true);
        showSuccess('Password has been reset successfully. You can now login with your new password.');
      } else {
        showError('Failed to reset password. Please try again.');
      }
    } catch (error) {
      console.error('Password reset error:', error); // Debug log
      showError(error.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Show loading while validating token
  if (isTokenValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Validating reset token...</p>
        </div>
      </div>
    );
  }
  
  // Show invalid token message
  if (!isTokenValid && !isTokenValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <div className="rounded-md bg-red-50 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Invalid token</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{validationError}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 space-y-4">
            <Link to="/forgot-password">
              <Button variant="primary">
                Request New Reset Link
              </Button>
            </Link>
            <div>
              <Link to="/login" className="text-sm text-primary-600 hover:text-primary-500">
                Return to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Show reset complete message
  if (resetComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <div className="rounded-md bg-green-50 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Password reset successful</h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>Your password has been reset successfully. You can now login with your new password.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <Link to="/login">
              <Button variant="primary">
                Go to Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  // Show password reset form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <ShieldCheckIcon className="mx-auto h-16 w-16 text-primary-600" />
          <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Reset Password
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your new password for {email}
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              placeholder="New password"
              autoComplete="new-password"
              startIcon={<LockClosedIcon className="h-5 w-5 text-gray-400" />}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="rounded-md"
              required
              minLength={6}
            />
            
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Confirm new password"
              autoComplete="new-password"
              startIcon={<LockClosedIcon className="h-5 w-5 text-gray-400" />}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="rounded-md"
              required
              minLength={6}
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
              Reset Password
            </Button>
          </div>
          
          <div className="text-sm text-center">
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
              Return to login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;