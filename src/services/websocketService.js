// src/services/websocketService.js - Improved for production

class WebSocketManager {
  constructor() {
    this.sockets = new Map(); // Store active connections
    this.subscribers = new Map(); // Store subscribers per endpoint
    
    // Always use secure WebSockets in production
    this.protocol = 'wss:';
    
    this.baseUrl = this._buildBaseUrl();
    
    this.reconnectAttempts = new Map(); // Track attempts per URL
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.connectionTimeouts = new Map(); // Track connection timeouts
  }
  
  /**
   * Build the base URL for WebSocket connections
   * Creates a consistent URL that works with the FastAPI backend
   */
  _buildBaseUrl() {
    const hostname = window.location.hostname;
    
    // Determine the appropriate port
    let port = window.location.port;
    if (!port) {
      // If no port is specified in URL, use default ports
      port = window.location.protocol === 'https:' ? '443' : '80';
    }
    
    // Construct the WebSocket URL
    // This approach ensures the WebSocket connects to the same domain as the page
    // which works well with FastAPI's WebSocket routing
    return `${this.protocol}//${hostname}:${port}/api`;
  }

  /**
   * Get WebSocket URL based on the endpoint
   * @param {string} endpoint - The endpoint path
   * @returns {string} Complete WebSocket URL
   */
  getWsUrl(endpoint) {
    // Ensure endpoint starts with a slash
    const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${this.baseUrl}${formattedEndpoint}`;
  }

  /**
   * Subscribe to a WebSocket endpoint
   * @param {string} endpoint - The endpoint to subscribe to
   * @param {Function} callback - Callback function to receive messages
   * @returns {Function} Unsubscribe function
   */
  subscribe(endpoint, callback) {
    const url = this.getWsUrl(endpoint);
    
    // Initialize subscribers array for this endpoint if it doesn't exist
    if (!this.subscribers.has(url)) {
      this.subscribers.set(url, []);
      this.reconnectAttempts.set(url, 0);
    }
    
    // Add this subscriber
    const subscribers = this.subscribers.get(url);
    subscribers.push(callback);
    
    // Create new socket connection if none exists
    if (!this.sockets.has(url)) {
      this.createSocket(url);
    }
    
    // Return unsubscribe function
    return () => this.unsubscribe(url, callback);
  }

  /**
   * Unsubscribe from a WebSocket endpoint
   * @param {string} url - The WebSocket URL
   * @param {Function} callback - The callback function to remove
   */
  unsubscribe(url, callback) {
    if (!this.subscribers.has(url)) return;
    
    const subscribers = this.subscribers.get(url);
    const index = subscribers.indexOf(callback);
    
    if (index !== -1) {
      subscribers.splice(index, 1);
    }
    
    // If no more subscribers, close and remove the socket
    if (subscribers.length === 0) {
      this.closeSocket(url);
      this.subscribers.delete(url);
      this.reconnectAttempts.delete(url);
    }
  }

  /**
   * Create a new WebSocket connection with proper error handling and timeouts
   * @param {string} url - The WebSocket URL
   */
  createSocket(url) {
    if (this.sockets.has(url)) return;
    
    try {
      const socket = new WebSocket(url);
      
      // Set connection timeout (10 seconds)
      const timeoutId = setTimeout(() => {
        if (socket.readyState !== WebSocket.OPEN) {
          socket.close();
          this.handleConnectionFailure(url, new Error('Connection timeout'));
        }
      }, 10000);
      
      this.connectionTimeouts.set(url, timeoutId);
      
      socket.onopen = () => {
        // Clear the connection timeout
        clearTimeout(this.connectionTimeouts.get(url));
        this.connectionTimeouts.delete(url);
        
        // Reset reconnect attempts on successful connection
        this.reconnectAttempts.set(url, 0);
      };
      
      socket.onmessage = (event) => {
        // Forward message to all subscribers
        const subscribers = this.subscribers.get(url) || [];
        subscribers.forEach(callback => {
          try {
            callback(event);
          } catch (err) {
            // Log subscriber errors but don't break the WebSocket
            this._logError(`Subscriber callback error for ${url}:`, err);
          }
        });
      };
      
      socket.onerror = (error) => {
        this._logError(`WebSocket error for ${url}:`, error);
      };
      
      socket.onclose = (event) => {
        // Clean up timeout if it exists
        if (this.connectionTimeouts.has(url)) {
          clearTimeout(this.connectionTimeouts.get(url));
          this.connectionTimeouts.delete(url);
        }
        
        // Remove from active sockets
        this.sockets.delete(url);
        
        // Attempt to reconnect if we have subscribers
        const subscribers = this.subscribers.get(url) || [];
        if (subscribers.length > 0) {
          this.handleConnectionFailure(url, new Error(`WebSocket closed with code: ${event.code}`));
        }
      };
      
      this.sockets.set(url, socket);
    } catch (error) {
      this.handleConnectionFailure(url, error);
    }
  }

  /**
   * Handle connection failures and reconnection logic
   * @param {string} url - The WebSocket URL
   * @param {Error} error - The error that caused the failure
   */
  handleConnectionFailure(url, error) {
    this._logError(`WebSocket connection failure for ${url}:`, error);
    
    // Get current attempt count
    const currentAttempts = this.reconnectAttempts.get(url) || 0;
    
    // Check if we should retry
    if (currentAttempts < this.maxReconnectAttempts) {
      // Update attempt count
      this.reconnectAttempts.set(url, currentAttempts + 1);
      
      // Calculate backoff delay (exponential with jitter)
      const baseDelay = this.reconnectDelay * Math.pow(1.5, currentAttempts);
      const jitter = Math.random() * 0.3 * baseDelay; // Add up to 30% jitter
      const delay = Math.min(30000, baseDelay + jitter); // Cap at 30 seconds
      
      // Schedule reconnection
      setTimeout(() => {
        if (this.subscribers.has(url) && this.subscribers.get(url).length > 0) {
          this.createSocket(url);
        }
      }, delay);
    } else {
      // Max attempts reached - notify subscribers
      const subscribers = this.subscribers.get(url) || [];
      subscribers.forEach(callback => {
        try {
          // Send a custom error event to subscribers
          callback({
            type: 'error',
            data: JSON.stringify({
              error: 'Connection failed after maximum retry attempts'
            })
          });
        } catch (err) {
          // Just log errors with callbacks
          this._logError(`Error notifying subscriber about connection failure for ${url}:`, err);
        }
      });
    }
  }

  /**
   * Close a WebSocket connection
   * @param {string} url - The WebSocket URL
   */
  closeSocket(url) {
    // Clear any pending timeouts
    if (this.connectionTimeouts.has(url)) {
      clearTimeout(this.connectionTimeouts.get(url));
      this.connectionTimeouts.delete(url);
    }
    
    // Close the socket if it exists
    const socket = this.sockets.get(url);
    if (socket) {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close(1000, 'Client disconnecting normally');
      }
      this.sockets.delete(url);
    }
  }

  /**
   * Close all WebSocket connections
   */
  closeAll() {
    // Clear all timeouts
    this.connectionTimeouts.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    this.connectionTimeouts.clear();
    
    // Close all sockets
    for (const url of this.sockets.keys()) {
      this.closeSocket(url);
    }
    
    // Clear all data structures
    this.sockets.clear();
    this.subscribers.clear();
    this.reconnectAttempts.clear();
  }
  
  /**
   * Log errors in a production-friendly way
   * @param {string} message - Error message
   * @param {Error} error - Error object
   */
  _logError(message, error) {
    // Production-grade logging
    // In a real production app, you might want to send these to a 
    // monitoring service like Sentry, LogRocket, etc.
    console.error(message, error);
    
    // If an error monitoring service exists, use it
    if (window.errorReportingService) {
      window.errorReportingService.captureException(error, {
        extra: { message }
      });
    }
  }
}

// Create a singleton instance
const wsManager = new WebSocketManager();

// Define subscription helpers for specific endpoints
export const websocketService = {
  // Main manager instance
  manager: wsManager,
  
  // Helper methods for common endpoints
  subscribeToUsageMetrics(callback) {
    return wsManager.subscribe('/device/usage', callback);
  },
  
  subscribeToMainVolts(callback) {
    return wsManager.subscribe('/sensor/ina260/main', callback);
  },
  
  subscribeToCameraVolts(callback) {
    return wsManager.subscribe('/sensor/ina260/relay_1', callback);
  },
  
  subscribeToRouterVolts(callback) {
    return wsManager.subscribe('/sensor/ina260/relay_2', callback);
  },
  
  subscribeToEnvironmental(callback) {
    return wsManager.subscribe('/sensor/sht30/environmental', callback);
  },
  
  subscribeToRelay(relayName, callback) {
    return wsManager.subscribe(`/sensor/ina260/${relayName}`, callback);
  },
  subscribeToGeneralSettings(callback) {
    return wsManager.subscribe('/settings/general', callback);
  },
  
  // Close all connections (useful when unmounting app)
  closeAll() {
    wsManager.closeAll();
  }
};

// Add a cleanup function on window unload
window.addEventListener('beforeunload', () => {
  websocketService.closeAll();
});

export default websocketService;