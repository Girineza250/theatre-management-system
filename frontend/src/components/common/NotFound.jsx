import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Button from '@components/common/Button';

/**
 * Not Found component for displaying 404 errors or resource not found states
 */
const NotFound = ({ 
  title = "Not Found", 
  message = "The resource you're looking for doesn't exist or has been moved.", 
  showHomeButton = true,
  showBackButton = true,
  homeButtonText = "Back to Home",
  backButtonText = "Go Back"
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
      {/* 404 Symbol */}
      <div className="text-center">
        <h1 className="text-9xl font-extrabold text-primary-500">404</h1>
        <h2 className="mt-4 text-3xl font-bold text-gray-900 tracking-tight">
          {title}
        </h2>
        <p className="mt-6 text-base text-gray-500 max-w-md mx-auto">
          {message}
        </p>
        
        {/* Action buttons */}
        <div className="mt-10 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center">
          {showHomeButton && (
            <Link to="/">
              <Button variant="primary">
                {homeButtonText}
              </Button>
            </Link>
          )}
          
          {showBackButton && (
            <Button 
              variant="outline" 
              onClick={() => window.history.back()}
            >
              {backButtonText}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

NotFound.propTypes = {
  title: PropTypes.string,
  message: PropTypes.string,
  showHomeButton: PropTypes.bool,
  showBackButton: PropTypes.bool,
  homeButtonText: PropTypes.string,
  backButtonText: PropTypes.string
};

export default NotFound;