import axios from '@/axios';

/**
 * Get the state of a specific relay.
 * @param {string} relayId - The relay's ID.
 * @returns {Promise<Object>} { relayId: string, state: string }
 */
export async function getRelayState(relayId) {
  try {
    const response = await axios.get(`/io/${relayId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || error.message);
  }
}

/**
 * Get the state of all relays.
 * @returns {Promise<Object>} An object mapping relay IDs to states.
 */
export async function getAllRelays() {
  try {
    const response = await axios.get('/relays/');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || error.message);
  }
}

/**
 * Turn on a group of relays.
 * @param {Array<string>} relayIds - List of relay IDs.
 * @returns {Promise<Object>} Response object mapping relay IDs to new states.
 */
export async function turnRelaysOn(relayIds) {
  try {
    const response = await axios.post('/relays/on', relayIds, {
      headers: { "Content-Type": "application/json" }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || error.message);
  }
}

/**
 * Turn off a group of relays.
 * @param {Array<string>} relayIds - List of relay IDs.
 * @returns {Promise<Object>} Response object mapping relay IDs to new states.
 */
export async function turnRelaysOff(relayIds) {
  try {
    const response = await axios.post('/relays/off', relayIds, {
      headers: { "Content-Type": "application/json" }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || error.message);
  }
}

/**
 * Pulse a group of relays.
 * @param {Array<string>} relayIds - List of relay IDs.
 * @returns {Promise<Object>} Response object mapping relay IDs to new states.
 */
export async function pulseRelays(relayIds) {
  try {
    const response = await axios.post('/relays/pulse', relayIds, {
      headers: { "Content-Type": "application/json" }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || error.message);
  }
}

/**
 * Turn on a single relay.
 * @param {string} relayId - The relay's ID.
 * @returns {Promise<Object>} Response from the API.
 */
export async function turnRelayOn(relayId) {
  try {
    const response = await axios.post(`/io/${relayId}/state/on`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || error.message);
  }
}

/**
 * Turn off a single relay.
 * @param {string} relayId - The relay's ID.
 * @returns {Promise<Object>} Response from the API.
 */
export async function turnRelayOff(relayId) {
  try {
    const response = await axios.post(`/io/${relayId}/state//off`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || error.message);
  }
}

/**
 * Pulse a single relay.
 * @param {string} relayId - The relay's ID.
 * @returns {Promise<Object>} Response from the API.
 */
export async function pulseRelay(relayId) {
  try {
    const response = await axios.post(`/io/${relayId}/state/pulse`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || error.message);
  }
}
