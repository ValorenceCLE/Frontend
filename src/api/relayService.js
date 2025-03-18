import axios from '@/axios';

/**
 * Get the state of a specific relay.
 * @returns {Promise<Object>} { relayId: string, state: string }
 */
export async function getAllRelayStates(){
  try{
    const response = await axios.get('/io/relays/state');
    return response.data;
  }
  catch (error) {
    throw new Error(error.response?.data?.detail || error.message);
  }
}

/**
 * Get the state of a specific relay.
 * @returns {Promise<Object>} { relayId: string, state: string }
 */
export async function getEnabledRelayStates(){
  try{
    const response = await axios.get('/io/relays/enabled/state');
    return response.data;
  }
  catch (error) {
    throw new Error(error.response?.data?.detail || error.message);
  }
}

/**
 * Get the state of a specific relay.
 * @param {string} relayId - The relay's ID.
 * @returns {Promise<Object>} { relayId: string, state: string }
 */
export async function getRelayState(relayId) {
  try {
    const response = await axios.get(`/io/${relayId}/state`);
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
