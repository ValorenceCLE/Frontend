import { createApp } from 'vue';
import App from './App.vue';
import './assets/tailwind.css'; // Tailwind file
import router from './router';

createApp(App).use(router).mount('#app');
