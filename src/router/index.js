import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '@/views/LoginView.vue';
import UserView from '@/views/UserView.vue';
import AdminView from '@/views/AdminView.vue';
import TestingView from '@/views/TestingView.vue';

const routes = [
  { path: '/', component: LoginView },
  { path: '/user', component: UserView },
  { path: '/admin', component: AdminView },
  { path: '/test', component: TestingView },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
