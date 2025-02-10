
// import { createApp } from 'vue'; 
// import App from './App.vue'; // Basic Vue 3 app
// import './assets/tailwind.css'; // Tailwind CSS
// import router from './router'; // Vue Router
// import VChart from 'vue-echarts'; // Apache ECharts
// import { createPinia } from 'pinia'; // Pinia state management

// const pinia = createPinia(); // Create a Pinia instance
// const app = createApp(App); // Create a Vue app instance


// app.use(router); // Use Vue Router
// app.use(pinia); // Use Pinia for state management
// app.component('v-chart', VChart); // Register ECharts component

// app.mount('#app');



// New code
import { createApp } from 'vue';
import App from './App.vue';
import './assets/tailwind.css';
import router from './router';
import VChart from 'vue-echarts';
import { createPinia } from 'pinia';
import './utils/echarts';
const pinia = createPinia();
const app = createApp(App);
app.use(router);
app.use(pinia);
app.component('v-chart', VChart);
app.mount('#app');