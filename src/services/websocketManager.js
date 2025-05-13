// src/services/websocketManager.js
class WebSocketManager {
  constructor() {
    this.sockets = new Map();
    this.subscribers = new Map();
    this.protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    this.baseUrl = this._buildBaseUrl();
    this.reconnectAttempts = new Map();
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.connectionTimeouts = new Map();
  }
  
  _buildBaseUrl() {
    const hostname = window.location.hostname;
    let port = window.location.port;
    if (!port) {
      port = window.location.protocol === 'https:' ? '443' : '80';
    }
    
    return `${this.protocol}//${hostname}:${port}/api`;
  }

  getWsUrl(endpoint) {
    const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${this.baseUrl}${formattedEndpoint}`;
  }

  /**
   * Get JWT token string from localStorage
   * @returns {string|null} Raw JWT token string or null if not found
   */
  getAuthToken() {
    try {
      const tokenData = localStorage.getItem('token');
      
      // First, check if it's a JSON object
      try {
        const parsedToken = JSON.parse(tokenData);
        // If it has a 'value' property, use that (new format)
        if (parsedToken && parsedToken.value) {
          return parsedToken.value;
        }
      } catch (e) {
        // Not JSON, assume it's a raw token string (old format)
      }
      
      // Return the token as-is if it wasn't JSON or didn't have a value property
      return tokenData;
    } catch (err) {
      console.error('Error getting auth token:', err);
      return null;
    }
  }

  subscribe(endpoint, callback) {
    const url = this.getWsUrl(endpoint);
    
    if (!this.subscribers.has(url)) {
      this.subscribers.set(url, []);
      this.reconnectAttempts.set(url, 0);
    }
    
    const subscribers = this.subscribers.get(url);
    subscribers.push(callback);
    
    if (!this.sockets.has(url)) {
      this.createSocket(url);
    }
    
    return () => this.unsubscribe(url, callback);
  }

  createSocket(url) {
    if (this.sockets.has(url)) return;
    
    try {
      // Get token and ensure it's just the JWT string, not a JSON object
      const token = this.getAuthToken();
      
      // Add token as a query parameter if available
      const socketUrl = token ? `${url}?token=${token}` : url;
      
      console.log('Connecting WebSocket to:', socketUrl.split('?')[0], 'with auth token');
      
      const socket = new WebSocket(socketUrl);
      
      // Set connection timeout
      const timeoutId = setTimeout(() => {
        if (socket.readyState !== WebSocket.OPEN) {
          socket.close();
          this.handleConnectionFailure(url, new Error('Connection timeout'));
        }
      }, 10000);
      
      this.connectionTimeouts.set(url, timeoutId);
      
      socket.onopen = () => {
        clearTimeout(this.connectionTimeouts.get(url));
        this.connectionTimeouts.delete(url);
        this.reconnectAttempts.set(url, 0);
        console.log(`WebSocket connected to ${url}`);
      };
      
      socket.onmessage = (event) => {
        // Handle both JSON and text messages
        try {
          // Try to parse as JSON first
          const jsonData = JSON.parse(event.data);
          
          // Forward JSON data to subscribers
          const subscribers = this.subscribers.get(url) || [];
          subscribers.forEach(callback => {
            try {
              callback({ 
                type: 'json',
                data: jsonData 
              });
            } catch (err) {
              console.error(`Subscriber callback error for ${url}:`, err);
            }
          });
        } catch (jsonError) {
          // If not JSON, treat as a text message (like authentication errors)
          console.warn(`Received non-JSON message: ${event.data.slice(0, 50)}...`);
          
          // Forward text message to subscribers
          const subscribers = this.subscribers.get(url) || [];
          subscribers.forEach(callback => {
            try {
              callback({
                type: 'text',
                data: event.data
              });
            } catch (err) {
              console.error(`Subscriber callback error for ${url}:`, err);
            }
          });
        }
      };
      
      socket.onerror = (error) => {
        console.error(`WebSocket error for ${url}:`, error);
      };
      
      socket.onclose = (event) => {
        if (this.connectionTimeouts.has(url)) {
          clearTimeout(this.connectionTimeouts.get(url));
          this.connectionTimeouts.delete(url);
        }
        
        this.sockets.delete(url);
        
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

  // Other methods remain the same...
  handleConnectionFailure(url, error) {
    console.error(`WebSocket connection failure for ${url}:`, error);
    
    const currentAttempts = this.reconnectAttempts.get(url) || 0;
    
    if (currentAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts.set(url, currentAttempts + 1);
      
      const baseDelay = this.reconnectDelay * Math.pow(1.5, currentAttempts);
      const jitter = Math.random() * 0.3 * baseDelay;
      const delay = Math.min(30000, baseDelay + jitter);
      
      setTimeout(() => {
        if (this.subscribers.has(url) && this.subscribers.get(url).length > 0) {
          this.createSocket(url);
        }
      }, delay);
    } else {
      const subscribers = this.subscribers.get(url) || [];
      subscribers.forEach(callback => {
        try {
          callback({
            type: 'error',
            data: `Connection failed after ${currentAttempts} attempts`
          });
        } catch (err) {
          console.error(`Error notifying subscriber about connection failure:`, err);
        }
      });
    }
  }

  unsubscribe(url, callback) {
    if (!this.subscribers.has(url)) return;
    
    const subscribers = this.subscribers.get(url);
    const index = subscribers.indexOf(callback);
    
    if (index !== -1) {
      subscribers.splice(index, 1);
    }
    
    if (subscribers.length === 0) {
      this.closeSocket(url);
      this.subscribers.delete(url);
      this.reconnectAttempts.delete(url);
    }
  }

  closeSocket(url) {
    if (this.connectionTimeouts.has(url)) {
      clearTimeout(this.connectionTimeouts.get(url));
      this.connectionTimeouts.delete(url);
    }
    
    const socket = this.sockets.get(url);
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.close(1000, 'Client disconnecting normally');
    }
    this.sockets.delete(url);
  }

  closeAll() {
    this.connectionTimeouts.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    this.connectionTimeouts.clear();
    
    for (const url of this.sockets.keys()) {
      this.closeSocket(url);
    }
    
    this.sockets.clear();
    this.subscribers.clear();
    this.reconnectAttempts.clear();
  }
}

// Create a singleton instance
const wsManager = new WebSocketManager();

// Define subscription helpers for specific endpoints
export const websocketService = {
  manager: wsManager,
  
  // Same helper methods as before
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
  
  closeAll() {
    wsManager.closeAll();
  }
};

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  websocketService.closeAll();
});

export default websocketService;