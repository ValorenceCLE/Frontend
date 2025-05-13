// src/api/logsService.js - REFACTORED
import apiClient from './apiClient';

/**
 * Downloads the router log file.
 * @returns {Promise<Blob>} - The log file as a Blob.
 */
export async function downloadRouterLogs() {
  return apiClient.get('/device/logs/router', { responseType: 'blob' });
}

/**
 * Downloads the camera log file.
 * @returns {Promise<Blob>} - The log file as a Blob.
 */
export async function downloadCameraLogs() {
  return apiClient.get('/device/logs/camera', { responseType: 'blob' });
}