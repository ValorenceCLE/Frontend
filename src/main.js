// src/main.js
import { createApp } from 'vue';
import App from './App.vue';
import './assets/tailwind.css';
import router from './router';
import VChart from 'vue-echarts';
import { createPinia } from 'pinia';
import './utils/echarts';
import { useSpeedTestStore } from "@/store/speedTest";
import { setupRouteProgress } from './utils/routeProgress';

// Set up route progress indicator
setupRouteProgress(router);

const pinia = createPinia();
const app = createApp(App);
app.use(router);
app.use(pinia);
app.component('v-chart', VChart);
app.mount('#app');

const speedTestStore = useSpeedTestStore();