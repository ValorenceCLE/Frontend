import relaysData from './data/relays.json';

const RelayApi = {
  // Handle GET requests to /api/relays
  get: (endpoint) => {
    if (endpoint === '/api/relays') {
      return { success: true, data: relaysData.relays };
    }
    return { success: false, error: 'Endpoint not found.' };
  },

  // Handle POST requests to /api/relays
  post: (endpoint, payload) => {
    if (endpoint === '/api/relays') {
      const newRelay = { ...payload };
      relaysData.relays.push(newRelay);
      return { success: true, data: newRelay };
    }
    return { success: false, error: 'Endpoint not found.' };
  }
};

export default RelayApi;
