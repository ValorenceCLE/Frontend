import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '@/views/LoginView.vue';
import UserView from '@/views/UserView.vue';
import AdminView from '@/views/AdminView.vue';


const routes = [
  { path: '/', component: LoginView },
  { path: '/user', component: UserView },
  { path: '/admin', component: AdminView },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
