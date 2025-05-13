// src/api/relayService.js - REFACTORED
import apiClient from './apiClient';

/**
 * Get the state of all relays.
 * @returns {Promise<Object>} { relayId: string, state: string }
 */
export async function getAllRelayStates() {
  return await apiClient.get('/io/relays/state');
}

/**
 * Get the state of enabled relays.
 * @returns {Promise<Object>} { relayId: string, state: string }
 */
export async function getEnabledRelayStates() {
  return await apiClient.get('/io/relays/enabled/state');
}

/**
 * Get the state of a specific relay.
 * @param {string} relayId - The relay's ID.
 * @returns {Promise<Object>} { relayId: string, state: string }
 */
export async function getRelayState(relayId) {
  return await apiClient.get(`/io/${relayId}/state`);
}

/**
 * Turn on a single relay.
 * @param {string} relayId - The relay's ID.
 * @returns {Promise<Object>} Response from the API.
 */
export async function turnRelayOn(relayId) {
  return await apiClient.post(`/io/${relayId}/state/on`);
}

/**
 * Turn off a single relay.
 * @param {string} relayId - The relay's ID.
 * @returns {Promise<Object>} Response from the API.
 */
export async function turnRelayOff(relayId) {
  return await apiClient.post(`/io/${relayId}/state//off`);
}

/**
 * Pulse a single relay.
 * @param {string} relayId - The relay's ID.
 * @returns {Promise<Object>} Response from the API.
 */
export async function pulseRelay(relayId) {
  return await apiClient.post(`/io/${relayId}/state/pulse`);
}