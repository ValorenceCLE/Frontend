import { createRouter, createWebHistory } from "vue-router";

// Lazy-load Views
const AdminView = () => import("@/views/AdminView.vue");
const UserView = () => import("@/views/UserView.vue");
const LoginView = () => import("@/views/LoginView.vue");

// Lazy-load Components (Header Links)
const Help = () => import("@/components/base/Help.vue");
const Contact = () => import("@/components/base/Contact.vue");

// Lazy-load Admin Settings
const General = () => import("@/components/settings/General.vue");
const Network = () => import("@/components/settings/Network.vue");
const DateTime = () => import("@/components/settings/DateTime.vue");
const Emails = () => import("@/components/settings/Emails.vue");

// Lazy-load Admin Relays
const RelaySetup = () => import("@/components/relays/RelaySetup.vue");
const RelayLogic = () => import("@/components/logic/RelayLogic.vue");

// Lazy-load Admin Monitor
const HistoricalGraph = () => import("@/components/monitor/Historical.vue");
const RealtimeGraph = () => import("@/components/monitor/RealTime.vue");

// Lazy-load Admin Dashboard
const Dashboard = () => import("@/components/dashboard/Dashboard.vue");

const routes = [
  { path: "/", component: LoginView, meta: { requiresAuth: false } },
  { path: "/login", component: LoginView, meta: { requiresAuth: false } },
  
  // User Routes
  {
    path: "/user",
    component: UserView,
    meta: { requiresAuth: true, role: "user" },
    children: [
      { path: "", component: Dashboard, meta: { requiresAuth: true, role: "user" } },
      { path: "help", component: Help, meta: { requiresAuth: true, role: "user" } },
      { path: "contact", component: Contact, meta: { requiresAuth: true, role: "user" } },
    ],
  },

  // Admin Routes
  {
    path: "/admin",
    component: AdminView,
    meta: { requiresAuth: true, role: "admin" },
    children: [
      { path: "", component: Dashboard, meta: { requiresAuth: true, role: "admin" } },
      { path: "help", component: Help, meta: { requiresAuth: true, role: "admin" } },
      { path: "contact", component: Contact, meta: { requiresAuth: true, role: "admin" } },
      
      // Settings
      { path: "settings/general", component: General, meta: { requiresAuth: true, role: "admin" } },
      { path: "settings/network", component: Network, meta: { requiresAuth: true, role: "admin" } },
      { path: "settings/date-time", component: DateTime, meta: { requiresAuth: true, role: "admin" } },
      { path: "settings/emails", component: Emails, meta: { requiresAuth: true, role: "admin" } },

      // Relays
      { path: "relays/logic", component: RelayLogic, meta: { requiresAuth: true, role: "admin" } },
      { path: "relays/settings", component: RelaySetup, meta: { requiresAuth: true, role: "admin" } },

      // Monitor
      { path: "monitor/historical", component: HistoricalGraph, meta: { requiresAuth: true, role: "admin" } },
      { path: "monitor/real-time", component: RealtimeGraph, meta: { requiresAuth: true, role: "admin" } },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

let userRole = null;
const token = localStorage.getItem("token");

if (token) {
  try {
    userRole = jwtDecode(token).role;
  } catch (error) {
    console.error("Invalid token", error);
    localStorage.removeItem("token");
  }
}

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    if (!token) return next("/");

    if (to.meta.role && to.meta.role !== userRole) {
      return next("/");
    }
  }
  next();
});


export default router;
