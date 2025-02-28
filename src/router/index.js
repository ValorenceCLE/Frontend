import { createRouter, createWebHistory } from "vue-router";
import { jwtDecode } from "jwt-decode";
import AdminView from "@/views/AdminView.vue";
import UserView from "@/views/UserView.vue";
import LoginView from "@/views/LoginView.vue";
// Import dynamic components

// Header Links (used as children)
import Help from "@/components/base/Help.vue";
import Contact from "@/components/base/Contact.vue";

// Admin Settings
import General from "@/components/settings/General.vue";
import Network from "@/components/settings/Network.vue";
import DateTime from "@/components/settings/DateTime.vue";
import Emails from "@/components/settings/Emails.vue";

// Admin Relays
import RelaySetup from "@/components/relays/RelaySetup.vue";
import RelayLogic from "@/components/logic/RelayLogic.vue";

// Admin Monitor
import HistoricalGraph from "@/components/monitor/Historical.vue";
import RealtimeGraph from "@/components/monitor/RealTime.vue";

// Admin Dashboard
import Dashboard from "@/components/dashboard/Dashboard.vue";

const routes = [
  { path: "/", component: LoginView, meta: { requiresAuth: false } },
  { path: "/login", component: LoginView, meta: { requiresAuth: false } },
  
  // User Routes
  {
    path: "/user",
    component: UserView,
    meta: { requiresAuth: true, role: "user" },
    children: [
      // Default child route renders the dashboard.
      {
        path: "",
        component: Dashboard,
        meta: { requiresAuth: true, role: "user" },
      },
      {
        path: "help",
        component: Help,
        meta: { requiresAuth: true, role: "user" },
      },
      {
        path: "contact",
        component: Contact,
        meta: { requiresAuth: true, role: "user" },
      },
      // Add other user-specific routes here.
    ],
  },

  // Admin Routes
  {
    path: "/admin",
    component: AdminView,
    meta: { requiresAuth: true, role: "admin" },
    children: [
      // Default child route renders the dashboard.
      {
        path: "",
        component: Dashboard,
        meta: { requiresAuth: true, role: "admin" },
      },
      {
        path: "help",
        component: Help,
        meta: { requiresAuth: true, role: "admin" },
      },
      {
        path: "contact",
        component: Contact,
        meta: { requiresAuth: true, role: "admin" },
      },
      // Settings Routes
      {
        path: "settings/general",
        component: General,
        meta: { requiresAuth: true, role: "admin" },
      },
      {
        path: "settings/network",
        component: Network,
        meta: { requiresAuth: true, role: "admin" },
      },
      {
        path: "settings/date-time",
        component: DateTime,
        meta: { requiresAuth: true, role: "admin" },
      },
      {
        path: "settings/emails",
        component: Emails,
        meta: { requiresAuth: true, role: "admin" },
      },
      // Relay Routes
      {
        path: "relays/logic",
        component: RelayLogic,
        meta: { requiresAuth: true, role: "admin" },
      },
      {
        path: "relays/settings",
        component: RelaySetup,
        meta: { requiresAuth: true, role: "admin" },
      },
      // Monitor Routes
      {
        path: "monitor/historical",
        component: HistoricalGraph,
        meta: { requiresAuth: true, role: "admin" },
      },
      {
        path: "monitor/real-time",
        component: RealtimeGraph,
        meta: { requiresAuth: true, role: "admin" },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!token) {
      return next("/");
    }
    const decodedToken = jwtDecode(token);
    const userRole = decodedToken.role;
    if (to.meta.role && to.meta.role !== userRole) {
      return next("/");
    }
  }
  next();
});
export default router;
