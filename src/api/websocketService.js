// websocketService.js

// Utility to build a WebSocket URL based on the current window location.
function getWsUrl(path) {
  const protocol = "ws"; // Always use ws since the backend is running locally
  const host = "localhost"; // Backend is running locally
  const port = "8000"; // Replace with the actual port your backend WebSocket server is running on
  return `${protocol}://${host}:${port}${path}`;
}

/**
 * Creates a WebSocket connection to the given URL and assigns callback functions.
 */
export function connectUsageWebSocket(url, callbacks = {}) {
  const { onOpen, onMessage, onError, onClose } = callbacks;
  const socket = new WebSocket(url);

  socket.onopen = (event) => {
    if (onOpen && typeof onOpen === "function") onOpen(event);
  };

  socket.onmessage = (event) => {
    if (onMessage && typeof onMessage === "function") onMessage(event);
  };

  socket.onerror = (event) => {
    if (onError && typeof onError === "function") onError(event);
  };

  socket.onclose = (event) => {
    if (onClose && typeof onClose === "function") onClose(event);
  };

  return socket;
}

/**
 * Closes the WebSocket connection if it is open.
 */
export function closeWebSocket(socket) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.close();
  }
}

/**
 * Convenience function for subscribing to the usage metrics endpoint.
 */
export function subscribeToUsageMetrics(callbacks = {}) {
  const usageUrl = getWsUrl("/api/device/usage");
  return connectUsageWebSocket(usageUrl, callbacks);
}

export function subscribeToMainVoltsMetrics(callbacks = {}) {
  const mainVoltsUrl = getWsUrl("/api/sensor/ina260/main");
  return connectUsageWebSocket(mainVoltsUrl, callbacks);
}

export function subscribeToCameraVoltsMetrics(callbacks = {}) {
  const cameraVoltsUrl = getWsUrl("/api/sensor/ina260/relay_1");
  return connectUsageWebSocket(cameraVoltsUrl, callbacks);
}

export function subscribeToRouterVoltsMetrics(callbacks = {}) {
  const routerVoltsUrl = getWsUrl("/api/sensor/ina260/relay_2");
  return connectUsageWebSocket(routerVoltsUrl, callbacks);
}

export function subscribeToEnvironmentalMetrics(callbacks = {}) {
  const environmentalUrl = getWsUrl("/api/sensor/sht30/environmental");
  return connectUsageWebSocket(environmentalUrl, callbacks);
}


export function subscribeToIna260Metrics(relayrName, callbacks = {}) {
  // Construct the URL dynamically based on the relay name provided
  const ina260Url = getWsUrl(`/api/sensor/ina260/${relayrName}`);
  // Call the connectUsageWebSocket function with the constructed URL and callbacks
  return connectUsageWebSocket(ina260Url, callbacks);
}