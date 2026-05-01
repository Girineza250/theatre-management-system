// src/pages/auth/GoogleCallback.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@contexts/ToastContext';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    // Handle Google OAuth callback
    const handleCallback = () => {
      try {
        const hash = window.location.hash;
        if (hash && hash.includes('access_token')) {
          // Parse the access token from URL
          const params = new URLSearchParams(hash.replace('#', '?'));
          const accessToken = params.get('access_token');
          
          if (accessToken) {
            // Store the token and redirect
            localStorage.setItem('google_access_token', accessToken);
            showSuccess('Google authentication successful!');
            
            // Fetch user info or redirect to home
            navigate('/', { replace: true });
          } else {
            showError('No access token found in callback');
            navigate('/login', { replace: true });
          }
        } else {
          // No hash found, redirect to login
          navigate('/login', { replace: true });
        }
      } catch (error) {
        console.error('Google callback error:', error);
        showError('Google authentication failed. Please try again.');
        navigate('/login', { replace: true });
      }
    };

    handleCallback();
  }, [navigate, showSuccess, showError]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing Google sign-in...</p>
      </div>
    </div>
  );
};

export default GoogleCallback;