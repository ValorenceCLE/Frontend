// src/api/apiClient.js
import axios from '@/axios';
import configUtils from '@/utils/configUtils';

class ApiClient {
  constructor() {
    this.baseUrl = configUtils.get('api.baseUrl', '/api');
    this.timeout = configUtils.get('api.timeout', 30000);
  }

  /**
   * Make a GET request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Request options
   * @returns {Promise<any>} Response data
   */
  async get(endpoint, options = {}) {
    try {
      const url = this._formatEndpoint(endpoint);
      const response = await axios.get(url, {
        ...options,
        timeout: options.timeout || this.timeout
      });

      return options.responseType === 'blob' ? response.data : response.data;
    } catch (error) {
      return this._handleError(error);
    }
  }

  /**
   * Make a POST request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request payload
   * @param {Object} options - Additional options
   * @returns {Promise<any>} Response data
   */
  async post(endpoint, data = {}, options = {}) {
    try {
      const url = this._formatEndpoint(endpoint);
      const response = await axios.post(url, data, {
        ...options,
        timeout: options.timeout || this.timeout
      });

      return response.data;
    } catch (error) {
      return this._handleError(error);
    }
  }

  /**
   * Make a PUT request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request payload
   * @param {Object} options - Additional options
   * @returns {Promise<any>} Response data
   */
  async put(endpoint, data = {}, options = {}) {
    try {
      const url = this._formatEndpoint(endpoint);
      const response = await axios.put(url, data, {
        ...options,
        timeout: options.timeout || this.timeout
      });

      return response.data;
    } catch (error) {
      return this._handleError(error);
    }
  }

  /**
   * Make a DELETE request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Additional options
   * @returns {Promise<any>} Response data
   */
  async delete(endpoint, options = {}) {
    try {
      const url = this._formatEndpoint(endpoint);
      const response = await axios.delete(url, {
        ...options,
        timeout: options.timeout || this.timeout
      });

      return response.data;
    } catch (error) {
      return this._handleError(error);
    }
  }

  /**
   * Format the API endpoint URL
   * @private
   * @param {string} endpoint - API endpoint
   * @returns {string} Formatted URL
   */
  _formatEndpoint(endpoint) {
    // Ensure endpoint starts with '/'
    const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return formattedEndpoint;
  }

  /**
   * Handle API errors consistently
   * @private
   * @param {Error} error - The caught error
   * @throws {Error} Rethrows the error with a standardized message
   */
  _handleError(error) {
    // Extract meaningful error message if possible
    let errorMessage = 'An unknown error occurred';

    if (error.response) {
      // Server responded with an error status code
      const statusCode = error.response.status;

      // Get error details from response if available
      errorMessage = error.response.data?.detail ||
        error.response.data?.message ||
        `Request failed with status code ${statusCode}`;

      // Session expired / unauthorized
      if (statusCode === 401) {
        if (typeof window !== 'undefined') {
          // Clear token and redirect to login
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
      }

      // Permission denied
      if (statusCode === 403) {
        // Log the error for debugging
        console.error(`API Error (${error.config?.url || 'unknown endpoint'}):`, errorMessage);
      }
    } else if (error.request) {
      // Request was made but no response received (network error)
      errorMessage = 'Network error: Unable to reach the server';
    } else {
      // Error in setting up the request
      errorMessage = error.message || errorMessage;
    }

    // Log the error for debugging
    console.error(`API Error (${error.config?.url || 'unknown endpoint'}):`, errorMessage);

    // Rethrow with a standardized message
    throw new Error(errorMessage);
  }
}

export default new ApiClient();