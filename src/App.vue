<!-- src/App.vue -->
<template>
  <div id="app" class="bg-backgroundGradient min-h-screen">
    <!-- Loading overlay: shown while config is being fetched -->
    <Loading :isLoading="initialLoading" />

    <!-- Global error display -->
    <GlobalErrorDisplay />

    <!-- The main content of your app -->
    <router-view />
  </div>
</template>

<script>
export default {
  name: "App",
};
</script>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useConfigStore } from "./store/config.js";
import Loading from "./components/etc/Loading.vue";
import GlobalErrorDisplay from "./components/etc/GlobalErrorDisplay.vue";
import { errorService } from "./services/errorService";

const configStore = useConfigStore();
const initialLoading = ref(false);
const configRefreshInterval = ref(null);

// Globally fetch configuration on app mount
onMounted(async () => {
  // Only fetch config if we have a token and we're not on the login page
  const token = localStorage.getItem("token");
  const path = window.location.pathname;
  const isAuthPage = path === "/" || path === "/login";
  
  if (token && !isAuthPage) {
    initialLoading.value = true;
    
    try {
      await configStore.fetchConfig();
      console.log("✅ Initial configuration loaded successfully");
      
      // Setup auto-refresh interval to keep config fresh
      // Using a longer interval (5 minutes) to avoid excessive requests
      configRefreshInterval.value = setInterval(async () => {
        const token = localStorage.getItem("token");
        if (token) {
          try {
            await configStore.fetchConfig();
            console.log("🔄 Periodic configuration refresh completed");
          } catch (error) {
            console.error("❌ Error during periodic config refresh:", error);
          }
        }
      }, 5 * 60 * 1000); // Refresh every 5 minutes
      
    } catch (error) {
      console.error("❌ Error loading initial configuration:", error);
      errorService.addError("Failed to load application configuration");
      
      // If unauthorized, redirect to login
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    } finally {
      initialLoading.value = false;
    }
  }
  
  // Add navigation listener to refresh config on page navigation
  window.addEventListener('popstate', refreshConfigOnNavigation);
});

// Function to refresh config on navigation
const refreshConfigOnNavigation = async () => {
  const token = localStorage.getItem("token");
  const path = window.location.pathname;
  const isAuthPage = path === "/" || path === "/login";
  
  if (token && !isAuthPage) {
    try {
      await configStore.fetchConfig();
      console.log("🔄 Configuration refreshed after navigation");
    } catch (error) {
      console.error("❌ Error refreshing config after navigation:", error);
    }
  }
};

// Clean up on unmount
onBeforeUnmount(() => {
  if (configRefreshInterval.value) {
    clearInterval(configRefreshInterval.value);
  }
  
  window.removeEventListener('popstate', refreshConfigOnNavigation);
});
</script>