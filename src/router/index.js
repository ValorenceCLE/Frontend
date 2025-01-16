import { createRouter, createWebHistory } from "vue-router";
import AdminView from "@/views/AdminView.vue";

// Import dynamic components

// Settings
import Network from "@/components/settings/Network.vue";
import DateTime from "@/components/settings/DateTime.vue";
import Configuration from "@/components/settings/Configuration.vue";
import Emails from "@/components/settings/Emails.vue";

// Relays
import RelaySettings from "@/components/relays/RelaySettings.vue";
import RelayLogic from "@/components/relays/RelayLogic.vue";
import RelaySchedule from "@/components/relays/RelaySchedule.vue";

// Logs
import Logs from "@/components/etc/Logs.vue";

// Monitor
import HistoricalGraph from "@/components/monitor/Historical.vue";
import RealtimeGraph from "@/components/monitor/Realtime.vue";

// Dashboard
import Dashboard from "@/components/etc/Dashboard.vue";

const routes = [
  { path: "/", component: () => import("@/views/LoginView.vue") },
  { path: "/user", component: () => import("@/views/UserView.vue") },
  { path: "/test", component: () => import("@/views/TestingView.vue") },
  {
    path: "/admin",
    component: AdminView,
    children: [
      // Default child route for `/admin` to render the Dashboard component
      {
        path: "",
        component: Dashboard,
      },

      // Dashboard route (accessible via /admin/dashboard/view)
      {
        path: "dashboard/view",
        component: Dashboard,
      },

      // Settings Routes
      {
        path: "settings/network",
        component: Network,
      },
      {
        path: "settings/date-time",
        component: DateTime,
      },
      {
        path: "settings/configuration",
        component: Configuration,
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
        path: "relays/schedule",
        component: RelaySchedule,
      },
      {
        path: "relays/settings",
        component: RelaySettings,
      },

      // Log Routes
      {
        path: "logs/system",
        component: Logs,
      },
      {
        path: "logs/router",
        component: Logs,
      },
      {
        path: "logs/camera",
        component: Logs,
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
