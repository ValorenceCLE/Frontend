// src/api/apiClient.js
import axios from '@/axios';

class ApiClient {
  /**
   * Make a GET request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Request options
   * @returns {Promise<any>} Response data
   */
  async get(endpoint, options = {}) {
    try {
      const response = await axios.get(endpoint, options);
      return options.responseType === 'blob' ? response.data : response.data;
    } catch (error) {
      this._handleError(error);
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
      const response = await axios.post(endpoint, data, options);
      return response.data;
    } catch (error) {
      this._handleError(error);
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
      const response = await axios.put(endpoint, data, options);
      return response.data;
    } catch (error) {
      this._handleError(error);
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
      const response = await axios.delete(endpoint, options);
      return response.data;
    } catch (error) {
      this._handleError(error);
    }
  }
  
  /**
   * Standardized error handling
   * @private
   * @param {Error} error - The caught error
   */
  _handleError(error) {
    const errorMessage = error.response?.data?.detail || error.message;
    console.error(`API Error: ${errorMessage}`);
    throw new Error(errorMessage);
  }
}

export default new ApiClient();