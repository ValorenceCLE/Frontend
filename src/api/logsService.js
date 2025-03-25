// logsService.js
import axios from '@/axios';

/**
 * Downloads the router log file.
 * @returns {Promise<Blob>} - The log file as a Blob.
 */
export async function downloadRouterLogs() {
  try {
    const response = await axios.get('/device/logs/router', { responseType: 'blob' });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || error.message);
  }
}

/**
 * Downloads the camera log file.
 * @returns {Promise<Blob>} - The log file as a Blob.
 */
export async function downloadCameraLogs() {
  try {
    const response = await axios.get('/device/logs/camera', { responseType: 'blob' });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || error.message);
  }
}
