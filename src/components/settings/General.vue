<!-- src/components/settings/General.vue -->
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
                <span>{{ router_volts }}</span>
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
                <span>{{ camera_volts }}</span>
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

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import BasicConfiguration from "./BasicConfiguration.vue";
import { useConfig } from '@/composables/useConfig';
import { getAllNetworkStatuses } from "@/api/networkService";
import { downloadRouterLogs, downloadCameraLogs } from "@/api/logsService";
import { useWebSocket } from '@/composables/useWebSocket';

// Use the config composable instead of direct store access
const { configData, isConfigLoaded } = useConfig(null, { autoFetch: true });

// Current time for display
const currentTime = ref(new Date());
const timer = ref(null);

// Network statuses
const routerResults = ref({ online: false });
const cameraResults = ref({ online: false });
const networkLoading = ref(true);
const networkPollInterval = ref(null);

// Usage metrics - using websocket composable
const { data: usageData } = useWebSocket('usage', {
  formatter: (data) => data || { cpu: 0, memory: 0, disk: 0 }
});

// Access usage data
const usage = computed(() => usageData.value || { cpu: 0, memory: 0, disk: 0 });

// Camera volts - using websocket composable
const { data: cameraVoltsData } = useWebSocket('camera', {
  formatter: (rawData) => {
    return typeof rawData === "number" 
      ? rawData 
      : (rawData?.voltage || 0);
  }
});

// Router volts - using websocket composable
const { data: routerVoltsData } = useWebSocket('router', {
  formatter: (rawData) => {
    return typeof rawData === "number" 
      ? rawData 
      : (rawData?.voltage || 0);
  }
});

// Access volts data
const camera_volts = computed(() => cameraVoltsData.value || 0);
const router_volts = computed(() => routerVoltsData.value || 0);

// Use computed property to get system name from config data
const displayed_system_name = computed(() => {
  return configData.value?.general?.system_name || "Unknown System";
});

const formattedDateTime = computed(() => {
  const date = currentTime.value;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}`;
});

// Fetch network statuses
async function fetchNetworkStatuses() {
  try {
    const networkResponse = await getAllNetworkStatuses();
    const networkResults = networkResponse.results;
    
    if (networkResults && networkResults.length >= 2) {
      routerResults.value = networkResults[0];
      cameraResults.value = networkResults[1];
    } else if (networkResults && networkResults.length === 1) {
      routerResults.value = networkResults[0];
    }
    
    networkLoading.value = false;
    console.log("Network statuses fetched:", networkResponse);
  } catch (error) {
    console.error("Error fetching network statuses:", error);
    networkLoading.value = false;
  }
}

// Download log files
async function handleDownloadRouterLogs() {
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
}

async function handleDownloadCameraLogs() {
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
}

// Lifecycle hooks
onMounted(() => {
  // Update current time every second
  timer.value = setInterval(() => {
    currentTime.value = new Date();
  }, 1000);
  
  // Fetch network status immediately and then poll every 30 seconds
  fetchNetworkStatuses();
  networkPollInterval.value = setInterval(() => {
    fetchNetworkStatuses();
  }, 30000);
});

onBeforeUnmount(() => {
  // Clean up timers
  clearInterval(timer.value);
  if (networkPollInterval.value) {
    clearInterval(networkPollInterval.value);
  }
});
</script>