<template>
  <div class="flex items-center justify-center w-full h-full relative">
    <div class="w-full mx-auto relative" style="width: 60rem">
      <!-- Header -->
      <div
        class="bg-gray-200 px-2 py-2 rounded-md shadow border border-gray-500 max-w-xl flex justify-center items-center mx-auto relative"
      >
        <div class="flex flex-col items-center justify-center w-full h-14">
          <!-- Main title dynamically passed from the config's general.system_name -->
          <div class="flex items-center">
            <h1 class="text-FormHeader text-textColor mb-1">
              {{ displayed_system_name }}
            </h1>
          </div>
          <p class="text-Body text-textColor">{{ formattedDateTime }}</p>
        </div>
      </div>

      <!-- Main Layout with Equal Height Columns -->
      <div class="w-full mt-2 space-y-0.5 flex text-center space-x-2 break-words items-stretch">
        <!-- Left Column (Three Stacked Content Boxes with Additional Content) -->
        <div class="flex-[1] flex flex-col gap-3">
          <!-- Controller Section -->
          <div
            class="bg-gray-200 rounded-lg border border-gray-500 shadow-md flex flex-col items-center justify-start flex-1"
          >
            <h1 class="text-center border-b border-gray-900 w-full text-FormSubmit text-textColor">
              Controller
            </h1>
            <div class="text-Form font-semibold text-textColor text-left w-full px-2">
              <div class="flex justify-between">
                CPU:
                <span>{{ usage.cpu }}%</span>
              </div>
              <div class="flex justify-between">
                Memory:
                <span>{{ usage.memory }}%</span>
              </div>
              <div class="flex justify-between">
                Disk:
                <span>{{ usage.disk }}%</span>
              </div>
            </div>
          </div>

          <!-- Router Section -->
          <div
            class="bg-gray-200 rounded-lg border border-gray-500 shadow-md flex flex-col items-center justify-start flex-1"
          >
            <h1 class="text-center border-b border-gray-900 w-full text-FormSubmit text-textColor">
              Router
            </h1>
            <div class="text-Form font-semibold text-textColor text-left w-full px-2">
              <div class="flex justify-between">
                Status:
                <span>
                  {{ networkLoading ? "Loading..." : (routerResults.online ? "Online" : "Offline") }}
                </span>
              </div>
              <div class="flex justify-between">
                Vin:
                <span>12v</span>
              </div>
              <div class="flex justify-between">
                Logs:
                <span>
                  <button
                    type="button"
                    class="flex items-center justify-center"
                    @click="handleDownloadRouterLogs"
                  >
                    <img
                      src="@/assets/icons/download.svg"
                      alt="Download Icon"
                      class="w-5 h-5"
                    />
                  </button>
                </span>
              </div>
            </div>
          </div>

          <!-- Camera Section -->
          <div
            class="bg-gray-200 rounded border border-gray-500 shadow flex flex-col items-center justify-start flex-1"
          >
            <h1 class="text-center border-b border-gray-900 w-full text-FormSubmit text-textColor">
              Camera
            </h1>
            <div class="text-Form font-semibold text-textColor text-left w-full px-2">
              <div class="flex justify-between">
                Status:
                <span>
                  {{ networkLoading ? "Loading..." : (cameraResults.online ? "Online" : "Offline") }}
                </span>
              </div>
              <div class="flex justify-between">
                Vin:
                <span>18v</span>
              </div>
              <div class="flex justify-between">
                Logs:
                <span>
                  <button
                    type="button"
                    class="flex items-center justify-center"
                    @click="handleDownloadCameraLogs"
                  >
                    <img
                      src="@/assets/icons/download.svg"
                      alt="Download Icon"
                      class="w-5 h-5"
                    />
                  </button>
                </span>
              </div>
            </div>
          </div>
        </div>
        <!-- Main Content Column -->
        <div class="flex-[2.8] flex flex-col gap-3">
          <BasicConfiguration class="flex-1" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import BasicConfiguration from "./BasicConfiguration.vue";
import { useConfigStore } from "@/store/config";
import { getAllNetworkStatuses } from "@/api/networkService";
import { subscribeToUsageMetrics, closeWebSocket } from "@/api/websocketService";
import { downloadRouterLogs, downloadCameraLogs } from "@/api/logsService";

export default {
  name: "General",
  components: { BasicConfiguration },
  data() {
    return {
      currentTime: new Date(), // Store the current date object
      // Reactive network statuses with default values.
      routerResults: { online: false },
      cameraResults: { online: false },
      networkLoading: true, // Flag for loading state.
      // Reactive usage metrics for Controller section.
      usage: { cpu: 0, memory: 0, disk: 0 },
      socket: null, // To store the WebSocket instance.
    };
  },
  computed: {
    // Access the global configuration store.
    configStore() {
      return useConfigStore();
    },
    // Dynamically display system name from global config general object.
    displayed_system_name() {
      const config = this.configStore.configData;
      return config && config.general && config.general.system_name
        ? config.general.system_name
        : "Unknown System";
    },
    formattedDateTime() {
      const date = this.currentTime;
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    },
  },
  methods: {
    refreshConfig() {
      // Trigger a manual refresh of the configuration without reloading the page.
      this.configStore.refreshConfig();
    },
    async fetchNetworkStatuses() {
      try {
        const response = await getAllNetworkStatuses();
        const results = response.results;
        if (results && results.length >= 2) {
          this.routerResults = results[0];
          this.cameraResults = results[1];
        } else if (results && results.length === 1) {
          this.routerResults = results[0];
        }
      } catch (error) {
        console.error("Error fetching network statuses:", error);
      } finally {
        this.networkLoading = false;
      }
    },
    setupUsageWebSocket() {
      // Use the dedicated function for subscribing to usage metrics.
      this.socket = subscribeToUsageMetrics({
        onOpen: (event) => {
          console.log("Usage WebSocket connected.", event);
        },
        onMessage: (event) => {
          try {
            const data = JSON.parse(event.data);
            this.usage = data;
          } catch (err) {
            console.error("Error parsing usage WebSocket message:", err);
          }
        },
        onError: (event) => {
          console.error("Usage WebSocket error:", event);
        },
        onClose: (event) => {
          console.log("Usage WebSocket closed:", event);
        },
      });
    },
    async handleDownloadRouterLogs() {
      try {
        const blob = await downloadRouterLogs();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "router.log";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error("Error downloading router logs:", error);
      }
    },
    async handleDownloadCameraLogs() {
      try {
        const blob = await downloadCameraLogs();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "camera.log";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error("Error downloading camera logs:", error);
      }
    },
  },
  mounted() {
    // Update currentTime every second so displayed time is live.
    this.timer = setInterval(() => {
      this.currentTime = new Date();
    }, 1000);
    // Fire-and-forget network status fetch.
    this.fetchNetworkStatuses();
    // Set up the WebSocket subscription for usage metrics.
    this.setupUsageWebSocket();
  },
  beforeUnmount() {
    clearInterval(this.timer);
    closeWebSocket(this.socket);
  },
};
</script>
