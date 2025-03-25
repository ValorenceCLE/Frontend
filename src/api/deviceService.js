// deviceService.js
import axios from '@/axios';

/**
 * Reboot the device by calling the backend API.
 * @returns {Promise<Object>} Response from the backend.
 */
export const rebootDevice = async () => {
    try {
        const response = await axios.post('/device/reboot');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.detail || 'Failed to reboot the device.');
    }
};
