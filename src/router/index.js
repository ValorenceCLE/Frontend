// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import { jwtDecode } from "jwt-decode";

// Small components loaded normally
import Help from "@/components/base/Help.vue";
import Contact from "@/components/base/Contact.vue";

// Create a simple loading component
const RouteLoadingComponent = {
  template: `
    <div class="flex items-center justify-center h-full">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primaryMed"></div>
    </div>
  `
};

// Create a loader wrapper with timeout
const lazyLoad = (componentImport) => {
  return {
    component: componentImport,
    loading: RouteLoadingComponent,
    delay: 200,
    timeout: 5000
  };
};

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { 
      path: "/", 
      component: () => import("@/views/LoginView.vue"),
      meta: { requiresAuth: false } 
    },
    { 
      path: "/login", 
      component: () => import("@/views/LoginView.vue"),
      meta: { requiresAuth: false } 
    },
    
    // User Routes
    {
      path: "/user",
      component: () => import("@/views/UserView.vue"),
      meta: { requiresAuth: true, role: "user" },
      children: [
        {
          path: "",
          component: () => import("@/components/dashboard/Dashboard.vue"),
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
      ],
    },

    // Admin Routes
    {
      path: "/admin",
      component: () => import("@/views/AdminView.vue"),
      meta: { requiresAuth: true, role: "admin" },
      children: [
        {
          path: "",
          component: () => import("@/components/dashboard/Dashboard.vue"),
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
        
        // Settings Routes (grouped by feature)
        {
          path: "settings/general",
          component: () => import("@/components/settings/General.vue"),
          meta: { requiresAuth: true, role: "admin" },
        },
        {
          path: "settings/network",
          component: () => import("@/components/settings/Network.vue"),
          meta: { requiresAuth: true, role: "admin" },
        },
        {
          path: "settings/date-time",
          component: () => import("@/components/settings/DateTime.vue"),
          meta: { requiresAuth: true, role: "admin" },
        },
        {
          path: "settings/emails",
          component: () => import("@/components/settings/Emails.vue"),
          meta: { requiresAuth: true, role: "admin" },
        },
        
        // Relay Routes
        {
          path: "relays/logic",
          component: () => import("@/components/logic/RelayLogic.vue"),
          meta: { requiresAuth: true, role: "admin" },
        },
        {
          path: "relays/settings",
          component: () => import("@/components/relays/RelaySetup.vue"),
          meta: { requiresAuth: true, role: "admin" },
        },
        
        // Monitor Routes
        {
          path: "monitor/historical",
          component: () => import("@/components/monitor/Historical.vue"),
          meta: { requiresAuth: true, role: "admin" },
        },
        {
          path: "monitor/real-time",
          component: () => import("@/components/monitor/RealTime.vue"),
          meta: { requiresAuth: true, role: "admin" },
        },
      ],
    },
    // 404 route
    {
      path: "/:pathMatch(.*)*",
      component: {
        template: `
          <div class="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h1 class="text-4xl font-bold text-gray-800 mb-4">404</h1>
            <p class="text-xl text-gray-600 mb-6">Page not found</p>
            <router-link to="/" class="px-4 py-2 bg-primaryMed text-white rounded hover:bg-primaryLight">
              Return Home
            </router-link>
          </div>
        `
      }
    }
  ],
});

// Keep your existing auth guard
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