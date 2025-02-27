<template>
  <div id="app" class="bg-backgroundGradient min-h-screen">
    <!-- Loading overlay: shown while config is being fetched -->
    <Loading :isLoading="configStore.loading" />

    <!-- Toast notification: shown when an error exists -->
    <ToastNotification 
      :visible="Boolean(configStore.error)" 
      :message="configStore.error || ''" 
    />

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
import { onMounted } from "vue";
import { useConfigStore } from "./store/config.js";
import Loading from "./components/etc/Loading.vue";
import ToastNotification from "./components/etc/ToastNotification.vue";

const configStore = useConfigStore();

// Globally fetch configuration on app mount
onMounted(() => {
  // Only fetch config if we have a token
  const token = localStorage.getItem("token");
  if (token) {
    configStore.fetchConfig();
  }
});
</script>

<style>
/* Add any global styles here if needed */
</style>
