// src/api/configService.js
import apiClient from '@/api/apiClient';

/**
 * Fetch the full configuration from the server.
 * @param {number} cacheBuster - Optional timestamp to prevent caching
 * @returns {Promise<Object>} The configuration object
 */
export async function fetchConfig(cacheBuster = null) {
  try {
    let url = '/config/';
    
    // Add cache-busting parameter if provided
    if (cacheBuster) {
      url += `?t=${cacheBuster}`;
    }
    
    const response = await apiClient.get(url);
    return response;
  } catch (error) {
    console.error('Error fetching configuration:', error);
    throw error;
  }
}

/**
 * Update the full configuration on the server.
 * @param {Object} config - The full configuration object to update
 * @returns {Promise<Object>} The API response with updated config
 */
export async function updateConfig(config) {
  try {
    const response = await apiClient.post('/config/', config);
    return response;
  } catch (error) {
    console.error('Error updating configuration:', error);
    throw error;
  }
}

/**
 * Update a specific configuration section on the server.
 * @param {string} section - The section name to update (e.g., "general", "network")
 * @param {Object} data - The section data to update
 * @returns {Promise<Object>} The API response with updated section
 */
export async function updateConfigSection(section, data) {
  try {
    const response = await apiClient.post(`/config/${section}`, data);
    return response;
  } catch (error) {
    console.error(`Error updating ${section} configuration:`, error);
    throw error;
  }
}

/**
 * Revert configuration to defaults on the server.
 * @returns {Promise<Object>} The API response with default config
 */
export async function revertToDefaults() {
  try {
    const response = await apiClient.post('/config/revert');
    return response;
  } catch (error) {
    console.error('Error reverting configuration to defaults:', error);
    throw error;
  }
}