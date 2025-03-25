// websocketService.js

/**
 * Creates a WebSocket connection to the given URL and assigns callback functions.
 * @param {string} url - The WebSocket URL to connect to.
 * @param {Object} callbacks - An object containing callback functions.
 * @param {Function} callbacks.onOpen - Called when the connection opens.
 * @param {Function} callbacks.onMessage - Called when a message is received.
 * @param {Function} callbacks.onError - Called when an error occurs.
 * @param {Function} callbacks.onClose - Called when the connection closes.
 * @returns {WebSocket} - The created WebSocket instance.
 */
export function connectUsageWebSocket(url, callbacks = {}) {
    const { onOpen, onMessage, onError, onClose } = callbacks;
    const socket = new WebSocket(url);
  
    socket.onopen = (event) => {
      if (onOpen && typeof onOpen === "function") {
        onOpen(event);
      }
    };
  
    socket.onmessage = (event) => {
      if (onMessage && typeof onMessage === "function") {
        onMessage(event);
      }
    };
  
    socket.onerror = (event) => {
      if (onError && typeof onError === "function") {
        onError(event);
      }
    };
  
    socket.onclose = (event) => {
      if (onClose && typeof onClose === "function") {
        onClose(event);
      }
    };
  
    return socket;
  }
  
  /**
   * Closes the WebSocket connection if it is open.
   * @param {WebSocket} socket - The WebSocket instance to close.
   */
  export function closeWebSocket(socket) {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.close();
    }
  }
  
  /**
   * Convenience function for subscribing to the usage metrics endpoint.
   * This reduces boilerplate in your Vue components.
   * @param {Object} callbacks - Callback functions for WebSocket events.
   * @returns {WebSocket} - The WebSocket instance connected to the usage endpoint.
   */
  export function subscribeToUsageMetrics(callbacks = {}) {
    // Adjust this URL as needed (or make it configurable)
    const usageUrl = "ws://192.168.1.4/api/device/usage";
    return connectUsageWebSocket(usageUrl, callbacks);
  }
  