import { createContext, useState, useContext, useCallback } from 'react';
import PropTypes from 'prop-types';
import Toast from '@components/common/Toast';

// Create Toast Context
const ToastContext = createContext(null);

/**
 * Toast provider component to wrap the application
 * Provides toast functionality throughout the app
 */
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  /**
   * Add a toast notification
   * @param {string} message - Toast message
   * @param {Object} options - Toast options
   */
  const addToast = useCallback((message, options = {}) => {
    const id = Date.now().toString();
    const toast = {
      id,
      message,
      ...options
    };
    
    setToasts(prevToasts => [...prevToasts, toast]);
    
    return id;
  }, []);

  /**
   * Remove a toast notification
   * @param {string} id - Toast ID to remove
   */
  const removeToast = useCallback((id) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }, []);

  /**
   * Show an info toast
   * @param {string} message - Toast message
   * @param {Object} options - Toast options
   */
  const showInfo = useCallback((message, options = {}) => {
    return addToast(message, { ...options, type: 'info' });
  }, [addToast]);

  /**
   * Show a success toast
   * @param {string} message - Toast message
   * @param {Object} options - Toast options
   */
  const showSuccess = useCallback((message, options = {}) => {
    return addToast(message, { ...options, type: 'success' });
  }, [addToast]);

  /**
   * Show a warning toast
   * @param {string} message - Toast message
   * @param {Object} options - Toast options
   */
  const showWarning = useCallback((message, options = {}) => {
    return addToast(message, { ...options, type: 'warning' });
  }, [addToast]);

  /**
   * Show an error toast
   * @param {string} message - Toast message
   * @param {Object} options - Toast options
   */
  const showError = useCallback((message, options = {}) => {
    return addToast(message, { ...options, type: 'error' });
  }, [addToast]);

  // Context value
  const value = {
    toasts,
    addToast,
    removeToast,
    showInfo,
    showSuccess,
    showWarning,
    showError
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      
      {/* Render toasts */}
      <div className="toast-container" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type || 'info'}
            duration={toast.duration || 5000}
            position={toast.position || 'bottom-right'}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

ToastProvider.propTypes = {
  children: PropTypes.node.isRequired
};

/**
 * Custom hook to use the toast context
 * @returns {Object} Toast context
 */
export const useToast = () => {
  const context = useContext(ToastContext);
  
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  
  return context;
};