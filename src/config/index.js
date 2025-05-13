// src/config/index.js
/**
 * Application-wide configuration
 */
export default {
  // API Configuration
  api: {
    baseUrl: '/api',
    timeout: 30000,
  },
  
  // WebSocket Configuration
  websocket: {
    reconnectAttempts: 5,
    reconnectDelay: 1000,
  },
  
  // UI Configuration
  ui: {
    toastDuration: 3000,
    loadingDelay: 200,
  },
  
  // Field Mappings (extracted from components)
  fieldMappings: {
    environmental: ['temperature', 'humidity'],
    main: ['volts', 'watts', 'amps'],
    relay: ['volts', 'watts', 'amps']
  },
  
  // Gauge Chart Colors
  chartColors: {
    "Volts": "#FF0000",
    "Amps": "#00FF00",
    "Watts": "#0000FF",
    "Temperature": "#FFA500",
    "Humidity": "#800080"
  },
  
  // Time Zones (extracted from DateTime.vue)
  timeZones: {
    "America/New_York": -5,
    "America/Chicago": -6,
    "America/Denver": -7,
    "America/Phoenix": -7,
    "America/Los_Angeles": -8,
    "America/Adak": -10,
    "Pacific/Honolulu": -10,
  }
};