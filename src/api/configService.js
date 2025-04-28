// src/api/configService.js
import axios from '@/axios';

/**
 * Fetch the full configuration.
 */
export async function fetchConfig() {
  try {
    const response = await axios.get('/config/');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || error.message);
  }
}

/**
 * Update the full configuration.
 */
export async function updateConfig(newConfig) {
  try {
    const response = await axios.post('/config/', newConfig);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || error.message);
  }
}

/**
 * Update a specific configuration section.
 * @param {string} section - The section name to update (e.g., "general", "network", etc.).
 * @param {Object} newData - The updated data for that section.
 * @returns {Promise<Object>} The API response.
 */
export async function updateConfigSection(section, newData) {
  try {
    const response = await axios.post(`/config/${section}`, newData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || error.message);
  }
}

/**
 * Fetch a specific configuration section.
 * @param {string} section - The section name to fetch.
 * @returns {Promise<Object>} The configuration section data.
 */
export async function fetchConfigSection(section) {
  try {
    const response = await axios.get(`/config/${section}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || error.message);
  }
}

/**
 * Revert to default configuration by removing custom configuration.
 * @returns {Promise<Object>} The API response.
 */
export async function revertToDefaults() {
  try {
    const response = await axios.post('/config/revert');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || error.message);
  }
}