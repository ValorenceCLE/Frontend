import axios from '@/axios';

/**
 * Retrieve the relay configuration.
 * @param {string} relayId - The ID of the relay.
 * @returns {Promise<Object>} Relay configuration.
 */
export async function getRelayConfig(relayId) {
  try {
    const response = await axios.get(`/relay/${relayId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || error.message);
  }
}

/**
 * Retrieve the current state of a relay.
 * @param {string} relayId - The ID of the relay.
 * @returns {Promise<Object>} The relay state.
 */
export async function getRelayState(relayId) {
  try {
    const response = await axios.get(`/relay/${relayId}/state`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || error.message);
  }
}

/**
 * Update the state of a relay.
 * @param {string} relayId - The ID of the relay.
 * @param {string} state - New state ("on" or "off").
 * @returns {Promise<Object>} Response message.
 */
export async function updateRelayState(relayId, state) {
  try {
    const response = await axios.post(`/relay/${relayId}/state`, { state });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || error.message);
  }
}

/**
 * Pulse a relay.
 * @param {string} relayId - The ID of the relay.
 * @returns {Promise<Object>} Response message.
 */
export async function pulseRelay(relayId) {
  try {
    const response = await axios.post(`/relay/${relayId}/pulse`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || error.message);
  }
}
