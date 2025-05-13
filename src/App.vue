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

<!-- App.vue - Add this script before your existing setup -->
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

// Make refresh function available globally for debugging
if (process.env.NODE_ENV === 'production') {
  window.refreshConfig = async () => {
    try {
      await configStore.fetchConfig();
      console.log("🔄 Manual configuration refresh completed");
      return "✅ Configuration refreshed successfully";
    } catch (error) {
      console.error("❌ Error during manual config refresh:", error);
      return "❌ Error refreshing configuration";
    }
  };
  
  // Create debug UI for refreshing config
  onMounted(() => {
    setTimeout(() => {
      // Check if button already exists
      if (document.getElementById('config-refresh-button')) return;
      
      const debugButton = document.createElement('button');
      debugButton.id = 'config-refresh-button';
      debugButton.innerText = 'Refresh Config';
      debugButton.style.position = 'fixed';
      debugButton.style.top = '10px';
      debugButton.style.right = '10px';
      debugButton.style.zIndex = '9999';
      debugButton.style.padding = '5px 10px';
      debugButton.style.backgroundColor = '#4F46E5';
      debugButton.style.color = 'white';
      debugButton.style.border = 'none';
      debugButton.style.borderRadius = '4px';
      debugButton.style.cursor = 'pointer';
      debugButton.style.fontSize = '12px';
      
      debugButton.addEventListener('click', async () => {
        debugButton.innerText = 'Refreshing...';
        debugButton.disabled = true;
        
        try {
          await configStore.fetchConfig();
          debugButton.innerText = 'Refreshed!';
          setTimeout(() => {
            debugButton.innerText = 'Refresh Config';
            debugButton.disabled = false;
          }, 1500);
        } catch (error) {
          debugButton.innerText = 'Error!';
          setTimeout(() => {
            debugButton.innerText = 'Refresh Config';
            debugButton.disabled = false;
          }, 1500);
        }
      });
      
      document.body.appendChild(debugButton);
    }, 1000);
  });
}
</script>