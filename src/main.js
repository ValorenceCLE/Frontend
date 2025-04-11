// src/main.js
import { createApp } from 'vue';
import App from './App.vue';
import './assets/tailwind.css';
import router from './router';
import VChart from 'vue-echarts';
import { createPinia } from 'pinia';
import './utils/echarts';
import { useSpeedTestStore } from "@/store/speedTest";
import monitoringPlugin from './plugins/monitoring';
import { setupRouteProgress } from './utils/routeProgress';
import { monitoringService } from './services/monitoringService';
// Set up route progress indicator
setupRouteProgress(router);
const pinia = createPinia();
const app = createApp(App);

// Initialize monitoring with production settings
app.use(monitoringPlugin, {
  captureErrors: true,
  capturePerformance: true,
  captureUserEvents: true,
  logLevel: import.meta.env.PROD ? 'warn' : 'debug'  // Less verbose in production
});
monitoringService.init({
    captureErrors: true,
    capturePerformance: true,
    captureUserEvents: true,
    logLevel: 'debug'
});
monitoringService.markPerformance('app:start');

// Add a test mark that will definitely appear
monitoringService.markPerformance('test:mark');
performance.measure('test:measure', 'test:mark');
window.monitoringService = monitoringService;
// Now setup the rest of the app
app.use(router);
app.use(pinia);
app.component('v-chart', VChart);
app.mount('#app');

const speedTestStore = useSpeedTestStore();