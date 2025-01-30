import { createRouter, createWebHistory } from "vue-router";
import AdminView from "@/views/AdminView.vue";
import UserView from "@/views/UserView.vue";
// Import dynamic components

// Header Links
import Help from "@/components/etc/Help.vue";
import Contact from "@/components/etc/Contact.vue";

// Admin Settings
import General from "@/components/settings/General.vue";
import Network from "@/components/settings/Network.vue";
import DateTime from "@/components/settings/DateTime.vue";
import Configuration from "@/components/settings/Configuration.vue";
import Emails from "@/components/settings/Emails.vue";

// Admin Relays
import RelaySetup from "@/components/relays/RelaySetup.vue";
import RelayLogic from "@/components/logic/RelayLogic.vue";
// import RelaySchedule from "@/components/relays/RelaySchedule.vue";

// Admin Logs
// import Logs from "@/components/etc/Logs.vue";

// Admin Monitor
import HistoricalGraph from "@/components/monitor/Historical.vue";
import RealtimeGraph from "@/components/monitor/RealTime.vue";

// Admin Dashboard
import Dashboard from "@/components/etc/Dashboard.vue";
import DashboardSetup from "@/components/etc/DashboardSetup.vue";

const routes = [
  { path: "/", component: () => import("@/views/LoginView.vue") },
  
  // User Routes
  {
    path: "/user",
    component: UserView,
    children: [
      {
        path: "",
        component: Dashboard,
      },

      // Header Links in UserView
      {
        path: "help",
        component: Help,
      },
      {
        path: "contact",
        component: Contact,
      },
    ],
  },

  // Admin Routes
  {
    path: "/admin",
    component: AdminView,
    children: [
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

      // Dashboard route
      {
        path: "dashboard/view",
        component: Dashboard,
      },
      {
        path: "dashboard/setup",
        component: DashboardSetup,
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
      // {
      //   path: "relays/schedule",
      //   component: RelaySchedule,
      // },
      {
        path: "relays/settings",
        component: RelaySetup,
      },

      // Log Routes
      // {
      //   path: "logs/system",
      //   component: Logs,
      // },
      // {
      //   path: "logs/router",
      //   component: Logs,
      // },
      // {
      //   path: "logs/camera",
      //   component: Logs,
      // },

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
