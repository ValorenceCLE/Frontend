import axios from '@/axios';

/**
 * Get the state of the router.
 * @param {Object} options - Options for the request.
 * @param {number} options.retries - Number of retry attempts.
 * @param {number} options.timeout - Timeout in seconds for each request.
 * @param {number} options.port - Port to use for the ping.
 * @returns {Promise<Object>} { host: string, online: boolean, latency_ms: number }
 */
export async function getRouterStatus({ retries = 2, timeout = 1, port = 443 } = {}) {
    try {
        const response = await axios.get(`/network/ping?hosts=192.168.1.1&retries=${retries}&timeout=${timeout}&port=${port}`);
        const result = response.data.results[0]; // Assuming the first result is for the router
        return {
            host: result.host,
            online: result.online,
            latency_ms: result.latency_ms,
        };
    } catch (error) {
        throw new Error(error.response?.data?.detail || error.message);
    }
}

/**
 * Get the state of the camera.
 * @param {Object} options - Options for the request.
 * @param {number} options.retries - Number of retry attempts.
 * @param {number} options.timeout - Timeout in seconds for each request.
 * @param {number} options.port - Port to use for the ping.
 * @returns {Promise<Object>} { host: string, online: boolean, latency_ms: number }
 */
export async function getCameraStatus({ retries = 2, timeout = 1, port = 443 } = {}) {
    try {
        const response = await axios.get(`/network/ping?hosts=192.168.1.3&retries=${retries}&timeout=${timeout}&port=${port}`);
        const result = response.data.results[0]; // Assuming the first result is for the camera
        return {
            host: result.host,
            online: result.online,
            latency_ms: result.latency_ms,
        };
    } catch (error) {
        throw new Error(error.response?.data?.detail || error.message);
    }
}

/**
 * Get the status of all network devices with additional query parameters.
 * @param {Object} options - Options for the request.
 * @param {number} options.retries - Number of retry attempts.
 * @param {number} options.timeout - Timeout in seconds for each request.
 * @param {number} options.port - Port to use for the ping.
 * @returns {Promise<Object>} { summary: Object, results: Array }
 */
export async function getAllNetworkStatuses({ retries = 2, timeout = 1, port = 443 } = {}) {
    try {
        const response = await axios.get(`/network/ping?hosts=192.168.1.1,192.168.1.3&retries=${retries}&timeout=${timeout}&port=${port}`);
        return response.data; // Return the full response with summary and results
    } catch (error) {
        throw new Error(error.response?.data?.detail || error.message);
    }
}

/**
 * Get the status of a specific network device.
 * @param {string} host - The IP address of the device.
 * @param {Object} options - Options for the request.
 * @param {number} options.retries - Number of retry attempts.
 * @param {number} options.timeout - Timeout in seconds for each request.
 * @param {number} options.port - Port to use for the ping.
 * @returns {Promise<Object>} { host: string, online: boolean, latency_ms: number }
 */
export async function getNetworkStatus(host, { retries = 2, timeout = 1, port = 443 } = {}) {
    try {
        const response = await axios.get(`/network/ping?hosts=${host}&retries=${retries}&timeout=${timeout}&port=${port}`);
        const result = response.data.results[0]; // Assuming the first result is for the specified host
        return {
            host: result.host,
            online: result.online,
            latency_ms: result.latency_ms,
        };
    } catch (error) {
        throw new Error(error.response?.data?.detail || error.message);
    }
}

/**
 * Perform a speed test.
 * @param {boolean} forceUpdate - Whether to force a new test instead of using cached results.
 * @returns {Promise<Object>} Speed test results including download and upload speeds.
 */
export async function performSpeedTest(forceUpdate = false) {
    try {
        const response = await axios.get('/network/speedtest', {
            params: { force: forceUpdate }
        });
        
        // Extract just the results part
        if (response.data.results) {
            return response.data.results;
        } else if (response.data.status) {
            console.log("Speedtest status:", response.data.status);
            return null;
        } else if (response.data.error) {
            console.error("Speedtest error:", response.data.error);
            return null;
        } else {
            return response.data; // If somehow the structure is different
        }
    } catch (error) {
        console.error("Speedtest request failed:", error);
        throw new Error(error.response?.data?.detail || error.message);
    }
}