// src/services/monitoringService.js
import { ref } from 'vue';

class MonitoringService {
  constructor() {
    this.errors = ref([]);
    this.performanceMarks = {};
    this.userEvents = [];
    this.consoleOverrides = {};
    this.isInitialized = false;
    this.settings = {
      captureErrors: true,
      capturePerformance: true,
      captureUserEvents: false,
      logLevel: 'warn' // 'debug', 'info', 'warn', 'error', 'none'
    };
  }

  init(options = {}) {
    if (this.isInitialized) return;
    
    // Merge settings
    this.settings = { ...this.settings, ...options };
    
    // Set up global error handler
    if (this.settings.captureErrors) {
      this.setupErrorHandlers();
    }
    
    // Override console methods
    this.overrideConsole();
    
    // Mark initialization
    this.markPerformance('monitoring:initialized');
    this.isInitialized = true;
    
    this.log('info', 'Monitoring service initialized');
  }

  setupErrorHandlers() {
    // Global unhandled error handler
    window.addEventListener('error', (event) => {
      this.captureError({
        type: 'unhandled',
        message: event.message,
        stack: event.error?.stack,
        source: event.filename,
        line: event.lineno,
        column: event.colno,
        timestamp: new Date().toISOString()
      });
    });
    
    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError({
        type: 'promise',
        message: event.reason?.message || 'Unhandled Promise Rejection',
        stack: event.reason?.stack,
        timestamp: new Date().toISOString()
      });
    });
  }

  overrideConsole() {
    // Store original methods
    this.consoleOverrides = {
      log: console.log,
      info: console.info,
      warn: console.warn,
      error: console.error,
      debug: console.debug
    };
    
    // Replace with monitored versions
    const self = this;
    const logLevels = {
      'debug': 0,
      'info': 1,
      'warn': 2,
      'error': 3,
      'none': 4
    };
    
    const currentLevel = logLevels[this.settings.logLevel];
    
    // Override each console method
    if (currentLevel <= logLevels.debug) {
      console.debug = function(...args) {
        self.consoleOverrides.debug.apply(console, args);
        self.logToMonitoring('debug', ...args);
      };
    }
    
    if (currentLevel <= logLevels.info) {
      console.info = function(...args) {
        self.consoleOverrides.info.apply(console, args);
        self.logToMonitoring('info', ...args);
      };
      
      console.log = function(...args) {
        self.consoleOverrides.log.apply(console, args);
        self.logToMonitoring('info', ...args);
      };
    }
    
    if (currentLevel <= logLevels.warn) {
      console.warn = function(...args) {
        self.consoleOverrides.warn.apply(console, args);
        self.logToMonitoring('warn', ...args);
      };
    }
    
    if (currentLevel <= logLevels.error) {
      console.error = function(...args) {
        self.consoleOverrides.error.apply(console, args);
        self.logToMonitoring('error', ...args);
        
        // Capture as an error
        const errorMsg = args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' ');
        
        self.captureError({
          type: 'console',
          message: errorMsg,
          timestamp: new Date().toISOString()
        });
      };
    }
  }

  captureError(error) {
    this.errors.value.push(error);
    
    // Keep only the latest 50 errors
    if (this.errors.value.length > 50) {
      this.errors.value.shift();
    }
    
    // In production, you would send this to a backend or service
    this.log('error', 'Error captured:', error.message);
    
    // For integration with backend reporting
    if (typeof navigator.sendBeacon === 'function') {
      try {
        const errorData = JSON.stringify({
          type: 'client_error',
          data: error,
          session: this.getSessionInfo()
        });
        
        //navigator.sendBeacon('/api/logs/client', errorData);
      } catch (e) {
        // Silent fail for beacon - it's just for reporting
      }
    }
  }

  markPerformance(name) {
    if (!this.settings.capturePerformance) return;
    
    const now = performance.now();
    this.performanceMarks[name] = now;
    
    // Also use the browser's Performance API
    performance.mark(name);
    
    return now;
  }

  measurePerformance(name, startMark, endMark) {
    if (!this.settings.capturePerformance) return;
    
    // If endMark is not provided, use the current time
    const start = this.performanceMarks[startMark];
    const end = endMark ? this.performanceMarks[endMark] : performance.now();
    
    if (start && end) {
      const duration = end - start;
      
      // Save the measurement
      performance.measure(name, startMark, endMark || undefined);
      
      this.log('info', `Performance: ${name} took ${duration.toFixed(2)}ms`);
      
      return duration;
    }
    
    return null;
  }

  trackEvent(category, action, label = null, value = null) {
    if (!this.settings.captureUserEvents) return;
    
    const event = {
      category,
      action,
      label,
      value,
      timestamp: new Date().toISOString()
    };
    
    this.userEvents.push(event);
    
    // Keep only the latest 100 events
    if (this.userEvents.length > 100) {
      this.userEvents.shift();
    }
    
    this.log('debug', 'User event:', event);
    
    // For integration with backend analytics
    if (typeof navigator.sendBeacon === 'function') {
      try {
        const eventData = JSON.stringify({
          type: 'user_event',
          data: event,
          session: this.getSessionInfo()
        });
        
        //navigator.sendBeacon('/api/analytics/events', eventData);
      } catch (e) {
        // Silent fail for beacon - it's just for reporting
      }
    }
  }

  getSessionInfo() {
    return {
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      url: window.location.href,
      referrer: document.referrer,
      timestamp: new Date().toISOString()
    };
  }

  logToMonitoring(level, ...args) {
    // Implementation for centralized logging
    // In production, you might want to send these to a backend or service
  }

  log(level, ...args) {
    // Internal logging method
    const logLevels = {
      'debug': 0,
      'info': 1,
      'warn': 2,
      'error': 3,
      'none': 4
    };
    
    if (logLevels[level] >= logLevels[this.settings.logLevel]) {
      // Use the original console method
      this.consoleOverrides[level]?.apply(console, args);
    }
  }

  getErrors() {
    return this.errors.value;
  }

  getPerformanceData() {
    // Get all performance entries
    const measures = performance.getEntriesByType('measure');
    const marks = performance.getEntriesByType('mark');
    
    console.log('Available performance measures:', measures);
    console.log('Available performance marks:', marks);
    
    return {
      marks: marks,
      measures: measures
    };
  }

  getUserEvents() {
    return this.userEvents;
  }
}

export const monitoringService = new MonitoringService();