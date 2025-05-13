// src/api/configService.js - REFACTORED
import apiClient from './apiClient';

/**
 * Fetch the full configuration.
 */
export async function fetchConfig() {
  return await apiClient.get('/config/');
}

/**
 * Update the full configuration.
 */
export async function updateConfig(newConfig) {
  console.log("API Service - Updating config:", newConfig); // Debug log
  const response = await apiClient.post('/config/', newConfig);
  console.log("API Service - Update response:", response); // Debug log
  return response;
}

/**
 * Update a specific configuration section.
 * @param {string} section - The section name to update (e.g., "general", "network", etc.).
 * @param {Object} newData - The updated data for that section.
 * @returns {Promise<Object>} The API response.
 */
export async function updateConfigSection(section, newData) {
  console.log(`API Service - Updating section ${section}:`, newData); // Debug log
  const response = await apiClient.post(`/config/${section}`, newData);
  console.log(`API Service - Section ${section} response:`, response); // Debug log
  return response;
}

/**
 * Fetch a specific configuration section.
 * @param {string} section - The section name to fetch.
 * @returns {Promise<Object>} The configuration section data.
 */
export async function fetchConfigSection(section) {
  return await apiClient.get(`/config/${section}`);
}

/**
 * Revert to default configuration by removing custom configuration.
 * @returns {Promise<Object>} The API response.
 */
export async function revertToDefaults() {
  return await apiClient.post('/config/revert');
}