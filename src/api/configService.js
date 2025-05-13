// src/api/configService.js
import apiClient from './apiClient';

/**
 * Fetch the full configuration
 * @returns {Promise<Object>} The complete configuration object
 */
export async function fetchConfig() {
  return await apiClient.get('/config/');
}

/**
 * Update the full configuration
 * @param {Object} newConfig - The updated configuration
 * @returns {Promise<Object>} API response
 */
export async function updateConfig(newConfig) {
  return await apiClient.post('/config/', newConfig);
}

/**
 * Update a specific configuration section
 * @param {string} section - The section name to update (e.g., "general", "network", etc.)
 * @param {Object} newData - The updated data for that section
 * @returns {Promise<Object>} API response
 */
export async function updateConfigSection(section, newData) {
  return await apiClient.post(`/config/${section}`, newData);
}

/**
 * Fetch a specific configuration section
 * @param {string} section - The section name to fetch
 * @returns {Promise<Object>} The configuration section data
 */
export async function fetchConfigSection(section) {
  return await apiClient.get(`/config/${section}`);
}

/**
 * Revert to default configuration by removing custom configuration
 * @returns {Promise<Object>} API response
 */
export async function revertToDefaults() {
  return await apiClient.post('/config/revert');
}