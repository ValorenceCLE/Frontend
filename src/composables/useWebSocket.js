// src/composables/useWebSocket.js
import { ref, onBeforeUnmount } from 'vue';
import { websocketService } from '@/services/websocketManager';

export function useWebSocket(endpoint, options = {}) {
  const {
    immediate = true,
    formatter = (data) => data,
    errorHandler = console.error,
  } = options;
  
  const data = ref(null);
  const error = ref(null);
  const isConnected = ref(false);
  let unsubscribe = null;
  
  const connect = () => {
    if (unsubscribe || !endpoint) return;
    
    try {
      // Determine which websocket endpoint to use
      let subscribeFunction;
      
      switch (endpoint) {
        case 'main':
          subscribeFunction = websocketService.subscribeToMainVolts;
          break;
        case 'environmental':
          subscribeFunction = websocketService.subscribeToEnvironmental;
          break;
        case 'usage':
          subscribeFunction = websocketService.subscribeToUsageMetrics;
          break;
        case 'camera':
          subscribeFunction = websocketService.subscribeToCameraVolts;
          break;
        case 'router':
          subscribeFunction = websocketService.subscribeToRouterVolts;
          break;
        case 'dashboard':
          subscribeFunction = websocketService.subscribeToDashboard;
          break;
        case 'settings':
          subscribeFunction = websocketService.subscribeToSettings;
          break;
        default:
          // For relay endpoints
          if (endpoint && endpoint.startsWith('relay_')) {
            subscribeFunction = (callback) => 
              websocketService.subscribeToRelay(endpoint, callback);
          } else if (endpoint) {
            // Try to use the endpoint directly if it's not empty
            subscribeFunction = (callback) => 
              websocketService.subscribeToRelay(endpoint, callback);
          } else {
            throw new Error(`Unknown websocket endpoint: ${endpoint}`);
          }
      }
      
      if (subscribeFunction) {
        unsubscribe = subscribeFunction((message) => {
          try {
            // Handle different message formats
            if (typeof message === 'object' && message.type) {
              // New format with type property
              if (message.type === 'json') {
                data.value = formatter(message.data);
                isConnected.value = true;
                error.value = null;
              } 
              else if (message.type === 'text') {
                console.log(`WebSocket text message: ${message.data}`);
                if (message.data.includes('Authentication failed')) {
                  error.value = new Error(message.data);
                }
              }
              else if (message.type === 'error') {
                error.value = new Error(message.data);
                errorHandler(`WebSocket error: ${message.data}`);
              }
            } 
            else if (message && message.data) {
              // Original format with raw event object
              const rawData = JSON.parse(message.data);
              data.value = formatter(rawData);
              isConnected.value = true;
              error.value = null;
            }
          } catch (err) {
            error.value = err;
            errorHandler(`Error processing websocket data: ${err.message}`);
          }
        });
      }
    } catch (err) {
      error.value = err;
      errorHandler(`Error connecting to websocket: ${err.message}`);
    }
  };
  
  const disconnect = () => {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
      isConnected.value = false;
    }
  };
  
  // Connect immediately if immediate is true and endpoint exists
  if (immediate && endpoint) {
    connect();
  }
  
  // Automatically disconnect when component unmounts
  onBeforeUnmount(() => {
    disconnect();
  });
  
  return {
    data,
    error,
    isConnected,
    connect,
    disconnect
  };
}