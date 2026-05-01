// src/pages/public/NotFound.jsx
import { Link } from 'react-router-dom';
import Button from '@components/common/Button';
import { HomeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        {/* 404 Symbol */}
        <h1 className="text-9xl font-extrabold text-primary-500">404</h1>
        <h2 className="mt-4 text-3xl font-bold text-gray-900 tracking-tight">
          Page Not Found
        </h2>
        <p className="mt-6 text-base text-gray-500 max-w-md mx-auto">
          Sorry, we couldn't find the page you're looking for. The page might have been moved, deleted, or may have never existed.
        </p>
        
        {/* Action buttons */}
        <div className="mt-10 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center">
          <Link to="/">
            <Button 
              variant="primary"
              icon={<HomeIcon className="w-5 h-5 mr-2" />}
            >
              Back to Home
            </Button>
          </Link>
          
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
            icon={<ArrowLeftIcon className="w-5 h-5 mr-2" />}
          >
            Go Back
          </Button>
        </div>
        
        {/* Additional help links */}
        <div className="mt-8">
          <p className="text-sm text-gray-500">
            Looking for something specific? Try one of these:
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-2">
            <Link to="/movies" className="text-primary-600 hover:text-primary-700">
              Movies
            </Link>
            <Link to="/about" className="text-primary-600 hover:text-primary-700">
              About Us
            </Link>
            <Link to="/contact" className="text-primary-600 hover:text-primary-700">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;