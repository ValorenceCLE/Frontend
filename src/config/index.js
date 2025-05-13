// src/config/index.js
/**
 * Application-wide configuration
 * This file centralizes configuration values to avoid hardcoding them throughout the application
 */

export default {
  // API Configuration
  api: {
    baseUrl: '/api',
    timeout: 30000, // 30 seconds
  },
  
  // WebSocket Configuration
  websocket: {
    baseUrl: window.location.protocol === 'https:' ? 'wss://' : 'ws://',
    reconnectAttempts: 5,
    reconnectDelay: 1000, // Base delay in ms before reconnecting
    connectionTimeout: 10000, // 10 seconds connection timeout
  },
  
  // UI Configuration
  ui: {
    toastDuration: 3000, // Duration for toast notifications
    loadingDelay: 200, // Delay before showing loading indicators
    dateFormat: 'YYYY-MM-DD',
    timeFormat: 'HH:mm',
    // Color definitions for UI elements
    colors: {
      red: '#eb191a',
      green: '#2a980c',
      yellow: '#FFDF00',
      blue: '#0a44a3',
      gray: '#d1d5db'
    }
  },
  
  // Field Mappings (for sensors and data sources)
  fieldMappings: {
    // Maps display field names to API field names
    display: {
      "Volts": "voltage",
      "Amps": "current",
      "Watts": "power",
      "Temperature": "temperature",
      "Humidity": "humidity"
    },
    
    // Available fields by source type
    sources: {
      environmental: ["temperature", "humidity"],
      main: ["voltage", "current", "power"],
      relay: ["voltage", "current", "power"]
    }
  },
  
  // Chart Configuration
  charts: {
    colors: {
      "Volts": "#FF0000",  // Red
      "Amps": "#00FF00",   // Green 
      "Watts": "#0000FF",  // Blue
      "Temperature": "#FFA500", // Orange
      "Humidity": "#800080"     // Purple
    },
    
    // Default chart options
    defaults: {
      animation: {
        duration: 300
      },
      responsive: true,
      maintainAspectRatio: false
    },
    
    // Real-time chart specific settings
    realTime: {
      maxDataPoints: 120, // Maximum number of data points to keep in memory
      refreshRate: 1000,  // Update interval in ms
      symbolThreshold: 1000, // Maximum points before hiding symbols
      smoothThreshold: 500   // Maximum points before disabling smooth lines
    },
    
    // Historical chart specific settings
    historical: {
      maxDataPoints: 2500,  // Target data points per field
      samplingThreshold: 2000, // When to enable data sampling
      downloadFormat: 'csv',
      intervals: {
        minimum: '10s',     // Minimum interval
        default: '1m',      // Default interval
        options: ['10s', '30s', '1m', '5m', '10m', '30m', '1h', '3h', '6h']
      }
    },
    
    // Gauge chart specific settings
    gauge: {
      defaultScale: 1,
      maxScale: 2.0,
      colorStops: [
        [0, '#2a980c'],    // Green at 0%
        [0.5, '#FFDF00'],  // Yellow at 50%
        [1, '#eb191a']     // Red at 100%
      ]
    }
  },
  
  // Time Zones Configuration
  timeZones: {
    "America/New_York": -5,
    "America/Chicago": -6,
    "America/Denver": -7,
    "America/Phoenix": -7, // No DST
    "America/Los_Angeles": -8,
    "America/Adak": -10,
    "Pacific/Honolulu": -10, // No DST
  },
  
  // Gauge-specific configurations
  gauges: {
    main: {
      min: 0,
      max: 24,
      unit: 'v',
      title: 'Main Power'
    },
    temperature: {
      min: -32,
      max: 120, 
      unit: '°F',
      title: 'Temperature'
    },
    humidity: {
      min: 0,
      max: 100,
      unit: '%',
      title: 'Humidity'
    }
  },
  
  // Relay Configuration
  relay: {
    defaultPulseTime: 5, // Default pulse duration in seconds
    pollingInterval: 2000, // Polling interval for relay states in milliseconds
  },
  
  // Network Configuration
  network: {
    // Default device IPs used in network status checks
    devices: {
      router: "192.168.1.1",
      camera: "192.168.1.3"
    },
    pingOptions: {
      retries: 2,
      timeout: 1,
      port: 443
    },
    speedTest: {
      pollingInterval: 30000 // 30 seconds
    }
  },
  
  // System Configuration
  system: {
    maxConfigFileSize: 5 * 1024 * 1024, // 5MB max config file size
    acceptedConfigFileTypes: ['.json'],
    maxEmailRecipients: 5 // Maximum number of email recipients
  }
};