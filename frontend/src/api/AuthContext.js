// In AuthContext.jsx, update the checkAuthStatus function:
const checkAuthStatus = () => {
  try {
    // Check for Google user in localStorage
    const googleUser = localStorage.getItem('google_user');
    const authProvider = localStorage.getItem('auth_provider');
    
    if (googleUser && authProvider === 'google') {
      try {
        const parsedUser = JSON.parse(googleUser);
        console.log('Found Google authenticated user:', parsedUser.email);
        
        // Set up Google user with proper structure
        const googleAuthUser = {
          ...parsedUser,
          isAuthenticated: true
        };
        
        setUser(googleAuthUser);
        setRequiresTwoFactor(false);
        setLoading(false);
        return;
      } catch (error) {
        console.error('Error parsing Google user:', error);
      }
    }
    
    // Rest of your existing auth check code...
    // Check for regular token/user...
  } catch (error) {
    console.error('Auth check error:', error);
    setLoading(false);
  }
};