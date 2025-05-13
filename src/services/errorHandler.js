// src/services/errorHandler.js
import { errorService } from './errorService';

/**
 * Global error handling service
 */
export default {
  /**
   * Handle API errors
   * @param {Error} error - The error object
   * @param {Object} options - Handler options
   * @returns {Error} The processed error
   */
  handleApiError(error, { showToast = true, retryOperation = null } = {}) {
    // Network error (server unreachable)
    if (!error.response) {
      if (showToast) {
        errorService.addError('Network error: Unable to reach the server');
      }
      
      // Add operation to retry queue if provided
      if (typeof retryOperation === 'function') {
        errorService.addPendingOperation(retryOperation);
      }
      
      return error;
    }
    
    // Authentication error
    if (error.response.status === 401) {
      if (showToast) {
        errorService.addError('Your session has expired. Please log in again.');
      }
      
      // Clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
      
      return error;
    }
    
    // Permission error
    if (error.response.status === 403) {
      if (showToast) {
        errorService.addError('You do not have permission to perform this action');
      }
      
      return error;
    }
    
    // Server error
    if (error.response.status >= 500) {
      if (showToast) {
        errorService.addError('A server error occurred. Please try again later.');
      }
      
      return error;
    }
    
    // Default handling
    if (showToast) {
      errorService.addError(error);
    }
    
    return error;
  }
};