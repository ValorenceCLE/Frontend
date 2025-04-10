// src/services/websocketService.js

class WebSocketManager {
    constructor() {
        this.sockets = new Map(); // Store active connections
        this.subscribers = new Map(); // Store subscribers per endpoint
        
        // Auto-detect protocol based on the current page protocol
        this.protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        
        // Production environment should always use wss
        if (window.location.hostname !== 'localhost' && 
            window.location.hostname !== '127.0.0.1') {
          this.protocol = 'wss:';
        }
        
        this.baseUrl = this._buildBaseUrl();
        console.log(`WebSocket initialized with base URL: ${this.baseUrl}`);
        
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
    }
      
  
    /**
     * Detects the appropriate WebSocket protocol to use
     * Tries wss:// first if page is loaded over https://
     * Falls back to ws:// if secure connection fails or page is http://
     */
    _detectProtocol() {
      return window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    }
    
    /**
     * Build the base URL for WebSocket connections
     */
    _buildBaseUrl() {
        const hostname = window.location.hostname;
        const standardPorts = {'http:': '80', 'https:': '443'};
        const port = window.location.port || standardPorts[window.location.protocol] || '';
        
        // For production, we want to use the same hostname
        return `${this.protocol}//${hostname}${port ? ':' + port : ''}/api`;
    }
  
    /**
     * Determine the fallback protocol if the primary fails
     */
    _getFallbackProtocol() {
      return this.protocol === 'wss:' ? 'ws:' : null;
    }
  
    /**
     * Get WebSocket URL based on the endpoint
     * @param {string} endpoint - The endpoint path
     * @returns {string} Complete WebSocket URL
     */
    getWsUrl(endpoint) {
      return `${this.baseUrl}${endpoint}`;
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
      }
    }
  
    /**
     * Create a new WebSocket connection
     * Will attempt to use the primary protocol first, then fall back
     * if necessary and possible.
     * @param {string} url - The WebSocket URL
     */
    createSocket(url) {
      if (this.sockets.has(url)) return;
      
      try {
        const socket = new WebSocket(url);
        
        socket.onopen = () => {
          console.log(`WebSocket connected: ${url}`);
          this.reconnectAttempts = 0; // Reset reconnect attempts on successful connection
        };
        
        socket.onmessage = (event) => {
          // Forward message to all subscribers
          const subscribers = this.subscribers.get(url) || [];
          subscribers.forEach(callback => {
            try {
              callback(event);
            } catch (err) {
              console.error('Error in subscriber callback:', err);
            }
          });
        };
        
        socket.onerror = (error) => {
          console.error(`WebSocket error for ${url}:`, error);
          
          // If we're using wss:// and it failed, try ws:// as a fallback
          const fallbackProtocol = this._getFallbackProtocol();
          if (fallbackProtocol && this.protocol === 'wss:' && this.reconnectAttempts === 0) {
            console.log(`Attempting fallback to ${fallbackProtocol} protocol...`);
            this.protocol = fallbackProtocol;
            const fallbackUrl = url.replace('wss:', 'ws:');
            setTimeout(() => {
              this.createSocket(fallbackUrl);
            }, 500);
          }
        };
        
        socket.onclose = (event) => {
          console.log(`WebSocket closed: ${url}`, event);
          
          // Remove from active sockets
          this.sockets.delete(url);
          
          // Attempt to reconnect if we have subscribers
          const subscribers = this.subscribers.get(url) || [];
          if (subscribers.length > 0 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect(url);
          }
        };
        
        this.sockets.set(url, socket);
      } catch (error) {
        console.error(`Failed to create WebSocket for ${url}:`, error);
        this.scheduleReconnect(url);
      }
    }
  
    /**
     * Schedule a reconnection attempt with exponential backoff
     * @param {string} url - The WebSocket URL
     */
    scheduleReconnect(url) {
      this.reconnectAttempts++;
      const delay = Math.min(30000, this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts - 1));
      
      console.log(`Scheduling reconnect for ${url} in ${delay}ms (attempt ${this.reconnectAttempts})`);
      
      setTimeout(() => {
        if (this.subscribers.has(url) && this.subscribers.get(url).length > 0) {
          this.createSocket(url);
        }
      }, delay);
    }
  
    /**
     * Close a WebSocket connection
     * @param {string} url - The WebSocket URL
     */
    closeSocket(url) {
      const socket = this.sockets.get(url);
      if (socket) {
        if (socket.readyState === WebSocket.OPEN) {
          socket.close();
        }
        this.sockets.delete(url);
      }
      this.subscribers.delete(url);
    }
  
    /**
     * Close all WebSocket connections
     */
    closeAll() {
      for (const url of this.sockets.keys()) {
        this.closeSocket(url);
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
    
    // Close all connections (useful when unmounting app)
    closeAll() {
      wsManager.closeAll();
    }
  };
  
  // Add a cleanup function on window unload/beforeunload
  window.addEventListener('beforeunload', () => {
    websocketService.closeAll();
  });
  
  export default websocketService;