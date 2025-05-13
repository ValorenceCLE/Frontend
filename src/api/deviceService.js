// src/api/deviceService.js - REFACTORED
import apiClient from './apiClient';

/**
 * Reboot the device by calling the backend API.
 * @returns {Promise<Object>} Response from the backend.
 */
export const rebootDevice = async () => {
  return await apiClient.post('/device/reboot');
};