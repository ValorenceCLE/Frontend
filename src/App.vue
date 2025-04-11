<template>
  <div id="app" class="bg-backgroundGradient min-h-screen">
    <!-- Loading overlay: shown while config is being fetched -->
    <Loading :isLoading="configStore.loading" />

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
import { onMounted } from "vue";
import { useConfigStore } from "./store/config.js";
import Loading from "./components/etc/Loading.vue";
import GlobalErrorDisplay from "./components/etc/GlobalErrorDisplay.vue";

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
