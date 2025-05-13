// src/api/networkService.js
import apiClient from './apiClient';
import configUtils from '@/utils/configUtils';

/**
 * Get network status for specified hosts
 * @param {string|string[]} hosts - Host IP addresses to check
 * @param {Object} options - Network ping options
 * @returns {Promise<Object>} Network status results
 */
export async function getNetworkStatus(hosts, options = {}) {
  // Get default options from config
  const defaultOptions = configUtils.get('network.pingOptions', {
    retries: 2,
    timeout: 1,
    port: 443
  });
  
  // Merge with provided options
  const pingOptions = { ...defaultOptions, ...options };
  
  // Format hosts as comma-separated string if it's an array
  const hostsParam = Array.isArray(hosts) ? hosts.join(',') : hosts;
  
  // Build query parameters
  const queryParams = `?hosts=${hostsParam}&retries=${pingOptions.retries}&timeout=${pingOptions.timeout}&port=${pingOptions.port}`;
  
  // Make API request
  return await apiClient.get(`/network/ping${queryParams}`);
}

/**
 * Get the state of the router.
 * @param {Object} options - Options for the request.
 * @returns {Promise<Object>} Router status information
 */
export async function getRouterStatus(options = {}) {
  const routerIp = configUtils.get('network.devices.router', '192.168.1.1');
  const response = await getNetworkStatus(routerIp, options);
  
  return {
    host: response.results[0].host,
    online: response.results[0].online,
    latency_ms: response.results[0].latency_ms,
  };
}

/**
 * Get the state of the camera.
 * @param {Object} options - Options for the request.
 * @returns {Promise<Object>} Camera status information
 */
export async function getCameraStatus(options = {}) {
  const cameraIp = configUtils.get('network.devices.camera', '192.168.1.3');
  const response = await getNetworkStatus(cameraIp, options);
  
  return {
    host: response.results[0].host,
    online: response.results[0].online,
    latency_ms: response.results[0].latency_ms,
  };
}

/**
 * Get the status of all network devices.
 * @param {Object} options - Options for the request.
 * @returns {Promise<Object>} All devices status information
 */
export async function getAllNetworkStatuses(options = {}) {
  const routerIp = configUtils.get('network.devices.router', '192.168.1.1');
  const cameraIp = configUtils.get('network.devices.camera', '192.168.1.3');
  
  return await getNetworkStatus([routerIp, cameraIp], options);
}

/**
 * Perform a speed test.
 * @param {boolean} forceUpdate - Whether to force a new test instead of using cached results.
 * @returns {Promise<Object>} Speed test results
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