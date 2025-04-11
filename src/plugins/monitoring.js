// src/plugins/monitoring.js
import { monitoringService } from '@/services/monitoringService';

export default {
  install(app, options = {}) {
    // Initialize the monitoring service
    monitoringService.init(options);
    
    // Add to Vue prototype for Options API access
    app.config.globalProperties.$monitor = monitoringService;
    
    // Provide for Composition API access
    app.provide('monitor', monitoringService);
    
    // Track route changes if Vue Router is available
    if (app.config.globalProperties.$router) {
      app.config.globalProperties.$router.beforeEach((to, from) => {
        monitoringService.markPerformance(`route:start:${to.path}`);
      });
      
      app.config.globalProperties.$router.afterEach((to) => {
        monitoringService.markPerformance(`route:end:${to.path}`);
        monitoringService.measurePerformance(
          `route:${to.path}`, 
          `route:start:${to.path}`, 
          `route:end:${to.path}`
        );
        
        // Track page view
        monitoringService.trackEvent('navigation', 'pageView', to.path);
      });
    }
    
    // Monitor Vue errors
    app.config.errorHandler = (err, vm, info) => {
      monitoringService.captureError({
        type: 'vue',
        message: err.message,
        stack: err.stack,
        info: info,
        component: vm?.$options?.name || 'anonymous',
        timestamp: new Date().toISOString()
      });
      
      // Call original error handler if available
      if (typeof options.errorHandler === 'function') {
        options.errorHandler(err, vm, info);
      } else {
        console.error(err);
      }
    };
  }
};