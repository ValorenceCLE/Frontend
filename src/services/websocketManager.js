// src/services/websocketManager.js
class WebSocketManager {
  constructor() {
    this.sockets = new Map();
    this.subscribers = new Map();
    this.reconnectAttempts = new Map();
    this.protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    this.baseUrl = this._buildBaseUrl();
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
  }
  
  /**
   * Build the base URL for WebSocket connections
   * @private
   */
  _buildBaseUrl() {
    const hostname = window.location.hostname;
    const port = window.location.port || (window.location.protocol === 'https:' ? '443' : '80');
    return `${this.protocol}//${hostname}:${port}/api`;
  }
  
  /**
   * Get WebSocket URL for an endpoint
   * @param {string} endpoint - The endpoint path
   * @returns {string} Complete WebSocket URL
   */
  getUrl(endpoint) {
    const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${this.baseUrl}${formattedEndpoint}`;
  }
  
  /**
   * Subscribe to a WebSocket endpoint
   * @param {string} endpoint - The endpoint to subscribe to
   * @param {Function} callback - Callback function for messages
   * @returns {Function} Unsubscribe function
   */
  subscribe(endpoint, callback) {
    const url = this.getUrl(endpoint);
    
    // Initialize subscribers for this endpoint
    if (!this.subscribers.has(url)) {
      this.subscribers.set(url, []);
      this.reconnectAttempts.set(url, 0);
    }
    
    // Add the subscriber
    const subscribers = this.subscribers.get(url);
    subscribers.push(callback);
    
    // Create socket if it doesn't exist
    if (!this.sockets.has(url)) {
      this.createSocket(url);
    }
    
    // Return unsubscribe function
    return () => this.unsubscribe(url, callback);
  }
  
  /**
   * Create a new WebSocket connection
   * @private
   * @param {string} url - The WebSocket URL
   */
  createSocket(url) {
    if (this.sockets.has(url)) return;
    
    try {
      const socket = new WebSocket(url);
      
      socket.onopen = () => {
        this.reconnectAttempts.set(url, 0);
      };
      
      socket.onmessage = (event) => {
        const subscribers = this.subscribers.get(url) || [];
        subscribers.forEach(callback => {
          try {
            callback(event);
          } catch (err) {
            console.error(`Subscriber error for ${url}:`, err);
          }
        });
      };
      
      socket.onerror = (error) => {
        console.error(`WebSocket error for ${url}:`, error);
      };
      
      socket.onclose = () => {
        this.sockets.delete(url);
        
        // Attempt reconnection if we have subscribers
        const subscribers = this.subscribers.get(url) || [];
        if (subscribers.length > 0) {
          this.handleReconnection(url);
        }
      };
      
      this.sockets.set(url, socket);
    } catch (error) {
      console.error(`Error creating WebSocket for ${url}:`, error);
      this.handleReconnection(url);
    }
  }
  
  /**
   * Handle reconnection attempt
   * @private
   * @param {string} url - The WebSocket URL
   */
  handleReconnection(url) {
    const attempts = this.reconnectAttempts.get(url) || 0;
    if (attempts < this.maxReconnectAttempts) {
      this.reconnectAttempts.set(url, attempts + 1);
      
      // Use exponential backoff with jitter
      const delay = this.reconnectDelay * Math.pow(1.5, attempts) * (0.9 + Math.random() * 0.2);
      
      setTimeout(() => {
        if (this.subscribers.has(url) && this.subscribers.get(url).length > 0) {
          this.createSocket(url);
        }
      }, delay);
    }
  }
  
  /**
   * Unsubscribe from a WebSocket endpoint
   * @private
   * @param {string} url - The WebSocket URL
   * @param {Function} callback - The callback to remove
   */
  unsubscribe(url, callback) {
    if (!this.subscribers.has(url)) return;
    
    const subscribers = this.subscribers.get(url);
    const index = subscribers.indexOf(callback);
    
    if (index !== -1) {
      subscribers.splice(index, 1);
    }
    
    // Close socket if no more subscribers
    if (subscribers.length === 0) {
      this.closeSocket(url);
      this.subscribers.delete(url);
      this.reconnectAttempts.delete(url);
    }
  }
  
  /**
   * Close a WebSocket connection
   * @private
   * @param {string} url - The WebSocket URL
   */
  closeSocket(url) {
    const socket = this.sockets.get(url);
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.close(1000, 'Client disconnecting');
    }
    this.sockets.delete(url);
  }
  
  /**
   * Close all WebSocket connections
   */
  closeAll() {
    for (const url of this.sockets.keys()) {
      this.closeSocket(url);
    }
    this.sockets.clear();
    this.subscribers.clear();
    this.reconnectAttempts.clear();
  }
}

// Create singleton instance
const websocketManager = new WebSocketManager();

// Define helper methods for specific endpoints (keeping compatibility with your current code)
export const websocketService = {
  // Reference to manager instance
  manager: websocketManager,
  
  // Helper methods from your original implementation
  subscribeToUsageMetrics(callback) {
    return websocketManager.subscribe('/device/usage', callback);
  },
  
  subscribeToMainVolts(callback) {
    return websocketManager.subscribe('/sensor/ina260/main', callback);
  },
  
  subscribeToCameraVolts(callback) {
    return websocketManager.subscribe('/sensor/ina260/relay_1', callback);
  },
  
  subscribeToRouterVolts(callback) {
    return websocketManager.subscribe('/sensor/ina260/relay_2', callback);
  },
  
  subscribeToEnvironmental(callback) {
    return websocketManager.subscribe('/sensor/sht30/environmental', callback);
  },
  
  subscribeToRelay(relayName, callback) {
    return websocketManager.subscribe(`/sensor/ina260/${relayName}`, callback);
  },
  
  closeAll() {
    websocketManager.closeAll();
  }
};

export default websocketManager;