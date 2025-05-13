// src/api/networkService.js - REFACTORED
import apiClient from './apiClient';

/**
 * Get the state of the router.
 * @param {Object} options - Options for the request.
 * @param {number} options.retries - Number of retry attempts.
 * @param {number} options.timeout - Timeout in seconds for each request.
 * @param {number} options.port - Port to use for the ping.
 * @returns {Promise<Object>} { host: string, online: boolean, latency_ms: number }
 */
export async function getRouterStatus({ retries = 2, timeout = 1, port = 443 } = {}) {
  const queryParams = `?hosts=192.168.1.1&retries=${retries}&timeout=${timeout}&port=${port}`;
  const response = await apiClient.get(`/network/ping${queryParams}`);
  return {
    host: response.results[0].host,
    online: response.results[0].online,
    latency_ms: response.results[0].latency_ms,
  };
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
  const queryParams = `?hosts=192.168.1.3&retries=${retries}&timeout=${timeout}&port=${port}`;
  const response = await apiClient.get(`/network/ping${queryParams}`);
  return {
    host: response.results[0].host,
    online: response.results[0].online,
    latency_ms: response.results[0].latency_ms,
  };
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
  const queryParams = `?hosts=192.168.1.1,192.168.1.3&retries=${retries}&timeout=${timeout}&port=${port}`;
  return await apiClient.get(`/network/ping${queryParams}`);
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
  const queryParams = `?hosts=${host}&retries=${retries}&timeout=${timeout}&port=${port}`;
  const response = await apiClient.get(`/network/ping${queryParams}`);
  return {
    host: response.results[0].host,
    online: response.results[0].online,
    latency_ms: response.results[0].latency_ms,
  };
}

/**
 * Perform a speed test.
 * @param {boolean} forceUpdate - Whether to force a new test instead of using cached results.
 * @returns {Promise<Object>} Speed test results including download and upload speeds.
 */
export async function performSpeedTest(forceUpdate = false) {
  const response = await apiClient.get('/network/speedtest', {
    params: { force: forceUpdate }
  });
  
  // Extract just the results part
  if (response.results) {
    return response.results;
  } else if (response.status) {
    console.log("Speedtest status:", response.status);
    return null;
  } else if (response.error) {
    console.error("Speedtest error:", response.error);
    return null;
  } else {
    return response; // If somehow the structure is different
  }
}