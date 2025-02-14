import { createRouter, createWebHistory } from "vue-router";
import AdminView from "@/views/AdminView.vue";
import UserView from "@/views/UserView.vue";
// Import dynamic components

// Header Links (used as children)
import Help from "@/components/etc/Help.vue";
import Contact from "@/components/etc/Contact.vue";

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
import Dashboard from "@/components/etc/Dashboard.vue";

const routes = [
  { path: "/", component: () => import("@/views/LoginView.vue") },
  
  // User Routes
  {
    path: "/user",
    component: UserView,
    children: [
      // Default child route renders the dashboard.
      {
        path: "",
        component: Dashboard,
      },
      {
        path: "help",
        component: Help,
      },
      {
        path: "contact",
        component: Contact,
      },
      // Add other user-specific routes here.
    ],
  },

  // Admin Routes
  {
    path: "/admin",
    component: AdminView,
    children: [
      // Default child route renders the dashboard.
      {
        path: "",
        component: Dashboard,
      },
      {
        path: "help",
        component: Help,
      },
      {
        path: "contact",
        component: Contact,
      },
      // Settings Routes
      {
        path: "settings/general",
        component: General,
      },
      {
        path: "settings/network",
        component: Network,
      },
      {
        path: "settings/date-time",
        component: DateTime,
      },
      {
        path: "settings/emails",
        component: Emails,
      },
      // Relay Routes
      {
        path: "relays/logic",
        component: RelayLogic,
      },
      {
        path: "relays/settings",
        component: RelaySetup,
      },
      // Monitor Routes
      {
        path: "monitor/historical",
        component: HistoricalGraph,
      },
      {
        path: "monitor/real-time",
        component: RealtimeGraph,
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
