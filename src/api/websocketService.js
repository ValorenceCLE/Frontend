// websocketService.js

// Build a WebSocket URL based on the current page location
function getWsUrl(path) {
  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
  const host = window.location.hostname;
  // Use the backend port (8000) directly if we're in development mode
  // Otherwise use the same port as the current page (likely 80/443 in production)
  const port = process.env.NODE_ENV === 'development' ? '8000' : window.location.port;
  const baseUrl = port ? `${protocol}://${host}:${port}` : `${protocol}://${host}`;
  return `${baseUrl}${path}`;
}

/**
 * Creates a WebSocket connection with authentication and reconnection support
 */
function connectUsageWebSocket(url, callbacks = {}) {
  const { onOpen, onMessage, onError, onClose } = callbacks;
  
  // Add authentication token if available
  const token = localStorage.getItem("token");
  const authenticatedUrl = token ? `${url}?token=${token}` : url;
  
  // Create the WebSocket
  const socket = new WebSocket(authenticatedUrl);
  
  // Setup event handlers
  socket.onopen = (event) => {
    console.log("WebSocket connected:", url);
    if (onOpen && typeof onOpen === "function") onOpen(event);
  };

  socket.onmessage = (event) => {
    if (onMessage && typeof onMessage === "function") onMessage(event);
  };

  socket.onerror = (event) => {
    console.error("WebSocket error:", url, event);
    if (onError && typeof onError === "function") onError(event);
  };

  // Add reconnection logic
  socket.onclose = (event) => {
    console.log("WebSocket closed:", url, event.code, event.reason);
    if (onClose && typeof onClose === "function") onClose(event);
    
    // Only attempt to reconnect if the socket was unexpectedly closed
    // and we're not shutting down intentionally
    if (!event.wasClean && !window.isPageUnloading) {
      console.log(`WebSocket connection lost. Attempting to reconnect in 5 seconds...`);
      setTimeout(() => {
        console.log("Reconnecting WebSocket...");
        callbacks._reconnectSocket = connectUsageWebSocket(url, callbacks);
      }, 5000);
    }
  };

  return socket;
}

/**
 * Closes the WebSocket connection safely
 */
function closeWebSocket(socket) {
  if (!socket) return;
  
  try {
    // Only close if the connection is open or connecting
    if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
      // Set a flag to prevent reconnection attempts when intentionally closing
      socket._intentionalClose = true;
      socket.close(1000, "Closed by client");
    }
  } catch (err) {
    console.error("Error closing WebSocket:", err);
  }
}

// Add page unload detection to prevent reconnection attempts when leaving the page
window.addEventListener('beforeunload', () => {
  window.isPageUnloading = true;
});

/**
 * Convenience function for subscribing to the usage metrics endpoint.
 */
function subscribeToUsageMetrics(callbacks = {}) {
  const usageUrl = getWsUrl("/api/device/usage");
  return connectUsageWebSocket(usageUrl, callbacks);
}

function subscribeToMainVoltsMetrics(callbacks = {}) {
  const mainVoltsUrl = getWsUrl("/api/sensor/ina260/main");
  return connectUsageWebSocket(mainVoltsUrl, callbacks);
}

function subscribeToCameraVoltsMetrics(callbacks = {}) {
  const cameraVoltsUrl = getWsUrl("/api/sensor/ina260/relay_1");
  return connectUsageWebSocket(cameraVoltsUrl, callbacks);
}

function subscribeToRouterVoltsMetrics(callbacks = {}) {
  const routerVoltsUrl = getWsUrl("/api/sensor/ina260/relay_2");
  return connectUsageWebSocket(routerVoltsUrl, callbacks);
}

function subscribeToEnvironmentalMetrics(callbacks = {}) {
  const environmentalUrl = getWsUrl("/api/sensor/sht30/environmental");
  return connectUsageWebSocket(environmentalUrl, callbacks);
}

function subscribeToIna260Metrics(relayName, callbacks = {}) {
  // Construct the URL dynamically based on the relay name provided
  const ina260Url = getWsUrl(`/api/sensor/ina260/${relayName}`);
  // Call the connectUsageWebSocket function with the constructed URL and callbacks
  return connectUsageWebSocket(ina260Url, callbacks);
}

export {
  connectUsageWebSocket,
  closeWebSocket,
  subscribeToUsageMetrics,
  subscribeToMainVoltsMetrics,
  subscribeToCameraVoltsMetrics,
  subscribeToRouterVoltsMetrics,
  subscribeToEnvironmentalMetrics,
  subscribeToIna260Metrics
};