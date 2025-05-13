// src/composables/useWebSocket.js - REFACTORED
import { ref, onBeforeUnmount } from 'vue';
import websocketManager from '@/services/websocketManager';

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
      unsubscribe = websocketManager.subscribe(endpoint, (event) => {
        try {
          const rawData = JSON.parse(event.data);
          data.value = formatter(rawData);
          isConnected.value = true;
          error.value = null;
        } catch (err) {
          error.value = err;
          errorHandler(`Error processing websocket data: ${err.message}`);
        }
      });
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
  
  // Connect immediately if requested
  if (immediate && endpoint) {
    connect();
  }
  
  // Cleanup on component unmount
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