// main.js
import { createApp } from 'vue';
import App from './App.vue';
import './assets/tailwind.css'; // or your CSS file
import router from './router';

// 1) Import the <v-chart> component from "vue-echarts"
import VChart from 'vue-echarts';

const app = createApp(App);

// 2) Use your router, if you have one
app.use(router);

// 3) Globally register the "v-chart" component,
//    so you can use <v-chart> in any file
app.component('v-chart', VChart);

app.mount('#app');
