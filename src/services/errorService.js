// src/services/errorService.js
import { ref, readonly } from 'vue';

class ErrorService {
  constructor() {
    this._errors = ref([]);
    this._isOffline = ref(false);
    this._pendingOperations = [];
    
    // Monitor network status
    window.addEventListener('online', this._handleOnline.bind(this));
    window.addEventListener('offline', this._handleOffline.bind(this));
  }
  
  get errors() {
    return readonly(this._errors);
  }
  
  get isOffline() {
    return readonly(this._isOffline);
  }
  
  // Add an error to the error queue
  addError(error) {
    const id = Date.now();
    const errorObj = {
      id,
      message: this._formatErrorMessage(error),
      timestamp: new Date(),
      dismissed: false
    };
    
    this._errors.value.push(errorObj);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      this.dismissError(id);
    }, 5000);
    
    return id;
  }
  
  // Dismiss an error
  dismissError(id) {
    const index = this._errors.value.findIndex(err => err.id === id);
    if (index !== -1) {
      this._errors.value[index].dismissed = true;
      
      // Remove after animation completes
      setTimeout(() => {
        this._errors.value = this._errors.value.filter(err => err.id !== id);
      }, 300);
    }
  }
  
  // Add operation to retry when back online
  addPendingOperation(operation) {
    if (typeof operation === 'function') {
      this._pendingOperations.push(operation);
    }
  }
  
  // Format error message for display
  _formatErrorMessage(error) {
    if (typeof error === 'string') {
      return error;
    }
    
    if (error.response) {
      // Server responded with an error
      const status = error.response.status;
      
      switch (status) {
        case 401:
          return 'Your session has expired. Please log in again.';
        case 403:
          return 'You don\'t have permission to perform this action.';
        case 404:
          return 'The requested resource could not be found.';
        case 500:
          return 'A server error occurred. Please try again later.';
        default:
          return error.response.data?.detail || 'An unexpected error occurred.';
      }
    } else if (error.request) {
      // Request made but no response received
      this._isOffline.value = true;
      return 'Unable to connect to the server. Please check your connection.';
    } else {
      // Error in setting up the request
      return error.message || 'An unexpected error occurred.';
    }
  }
  
  // Handle coming back online
  _handleOnline() {
    this._isOffline.value = false;
    
    // Show notification
    this.addError('Connection restored. Resuming operations...');
    
    // Retry pending operations
    while (this._pendingOperations.length > 0) {
      const operation = this._pendingOperations.shift();
      setTimeout(() => {
        try {
          operation();
        } catch (e) {
          console.error('Failed to execute pending operation:', e);
        }
      }, 0);
    }
  }
  
  // Handle going offline
  _handleOffline() {
    this._isOffline.value = true;
    this.addError('You are currently offline. Some features may be unavailable.');
  }
}

export const errorService = new ErrorService();