<!-- src/components/dashboard/Dashboard.vue -->
<template>
  <div class="w-full max-w-4xl mx-auto">
    <!-- Dashboard Header -->
    <div
      class="bg-gray-200 px-3 py-1.5 rounded-md shadow border border-gray-500 max-w-xl flex justify-center items-center mx-auto">
      <h1 class="text-Header text-textColor">{{ system_name }}</h1>
    </div>

    <!-- Gauge Section -->
    <div ref="scalingContainer" class="w-full my-2 flex text-center space-x-2 overflow-auto break-words items-stretch">
      <!-- Left Column (Status Panel) -->
      <div class="flex-[2] bg-gray-200 rounded border border-gray-500">
        <h1 :style="leftTitleStyle" class="text-center">Status</h1>
        <div class="border-solid border border-gray-700"></div>
        <div class="mt-1 space-y-1.5 text-Body text-textColor text-left px-3 py-1.5">
          <div class="flex justify-between">
            <strong>Router:</strong>
            <span>
              {{ networkLoading ? "Loading..." : (routerResults.online ? "Online" : "Offline") }}
            </span>
          </div>
          <div class="flex justify-between">
            <strong>Camera:</strong>
            <span>
              {{ networkLoading ? "Loading..." : (cameraResults.online ? "Online" : "Offline") }}
            </span>
          </div>

          <!-- Upload/Download Speeds from the Store -->
          <div class="flex justify-between">
            <strong>Upload Speed:</strong>
            <span>
              <template v-if="speedTestStore.speedTestLoading">
                Loading...
              </template>
              <template v-else-if="!speedTestStore.speedTestResults">
                Pending...
              </template>
              <template v-else>
                {{ (speedTestStore.speedTestResults.upload / 1000000).toFixed(2) }} Mbps
              </template>
            </span>
          </div>
          <div class="flex justify-between">
            <strong>Download Speed:</strong>
            <span>
              <template v-if="speedTestStore.speedTestLoading">
                Loading...
              </template>
              <template v-else-if="!speedTestStore.speedTestResults">
                Pending...
              </template>
              <template v-else>
                {{ (speedTestStore.speedTestResults.download / 1000000).toFixed(2) }} Mbps
              </template>
            </span>
          </div>
        </div>
      </div>

      <!-- Middle Column: Main Power Gauge -->
      <div class="flex-[1.5] bg-gray-200 p-1 rounded h-44 border border-gray-500">
        <Gauge title="Main Power" :min="0" :max="24" unit="v" :value="volts" :scale="sharedScale"
          class="w-full h-full" />
      </div>

      <!-- Right Column: Temperature Gauge -->
      <div class="flex-[1.5] bg-gray-200 p-1 rounded h-44 border border-gray-500">
        <Gauge title="Temperature" :min="-32" :max="120" unit="°F" :value="temperature" :scale="sharedScale"
          class="w-full h-full" />
      </div>
    </div>

    <!-- Loading indicator for relays -->
    <div v-if="isLoading" class="flex items-center justify-center py-4">
      <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primaryMed"></div>
      <span class="ml-2 text-sm text-gray-600">Loading relays...</span>
    </div>

    <!-- Relay Cards Section -->
    <div v-else class="w-full mt-2 space-y-1.5">
      <RelayCard v-for="relay in enabledRelays" :key="relay.id" :relay="relay" @update-state="updateRelayState" />
    </div>

    <!-- Error messages -->
    <div v-if="error" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 my-3">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from "vue";
import Gauge from "@/components/dashboard/Gauge.vue";
import RelayCard from "@/components/dashboard/RelayCard.vue";
import { useConfig } from '@/composables/useConfig';
import { getAllNetworkStatuses } from "@/api/networkService";
import { useSpeedTestStore } from "@/store/speedTest";
import { useWebSocket } from '@/composables/useWebSocket';

// Use the config composable for accessing configuration
const {
  configData,
  isLoading,
  error
} = useConfig(null, { autoFetch: true });

/*********************
 * 1) Gauge Scaling  *
 *********************/
const scalingContainer = ref(null);
const containerWidth = ref(0);
const containerHeight = ref(0);

function measureScalingContainer() {
  nextTick(() => {
    if (scalingContainer.value) {
      containerWidth.value = scalingContainer.value.clientWidth;
      containerHeight.value = scalingContainer.value.clientHeight;
    }
  });
}

onMounted(() => {
  measureScalingContainer();
  window.addEventListener("resize", measureScalingContainer, { passive: true });
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", measureScalingContainer);
});

const sharedScale = computed(() => {
  const w = containerWidth.value;
  const h = containerHeight.value;
  if (!w || !h) return 1;
  const dimension = Math.min(w, h);
  let s = dimension / 400;
  s = Math.max(1.0, Math.min(s, 2.0));
  return s;
});

const leftTitleStyle = computed(() => ({
  fontSize: `${Math.round(22 * sharedScale.value)}px`,
  fontWeight: "bolder",
  color: "#333",
  textAlign: "center",
}));

/***************************************
 * 2) System Name from Config          *
 ***************************************/
const system_name = computed(() => {
  return configData.value?.general?.system_name || "Unnamed System";
});

/****************************************************
 * 3) Dashboard WebSocket for Combined Data Stream  *
 ****************************************************/
const { data: dashboardData, isConnected: dashboardConnected } = useWebSocket('dashboard', {
  formatter: (rawData) => {
    return rawData || {
      relay_states: {},
      sensors: {
        main: {},
        environmental: {}
      }
    };
  }
});

// Extract relay states from the combined WebSocket data
const relayStates = computed(() => dashboardData.value?.relay_states || {});

// Extract sensor data from the combined WebSocket data
const voltsData = computed(() => {
  return dashboardData.value?.sensors?.main || {};
});

const environmentalData = computed(() => {
  return dashboardData.value?.sensors?.environmental || {};
});

// Network status stays the same
const routerResults = ref({ online: false });
const cameraResults = ref({ online: false });
const networkLoading = ref(true);

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
  } catch (error) {
    console.error("Error fetching network statuses:", error);
    networkLoading.value = false;
  }
}

onMounted(() => {
  fetchNetworkStatuses();
});

/*****************************************************
 * 4) Get enabled relays from config store           *
 *****************************************************/
const enabledRelays = computed(() => {
  if (!configData.value?.relays) return [];

  // Get only enabled relays
  const enabledRelayList = Object.values(configData.value.relays)
    .filter(relay => relay.enabled);

  // Merge with WebSocket states from the combined stream
  return enabledRelayList.map(relay => {
    const state = relayStates.value[relay.id] !== undefined ?
      relayStates.value[relay.id] :
      (relay.state === 'on' ? 1 : 0);
    return { ...relay, state };
  });
});

// Update Relay State for immediate UI feedback
function updateRelayState({ id, state }) {
  // Update the relay state within the dashboard data
  if (dashboardData.value) {
    dashboardData.value = {
      ...dashboardData.value,
      relay_states: {
        ...(dashboardData.value.relay_states || {}),
        [id]: state,
      }
    };
  }
}

// Computed properties to use the consolidated WebSocket data
const volts = computed(() => {
  return voltsData.value?.voltage ? parseFloat(voltsData.value.voltage.toFixed(2)) : 0;
});

const temperature = computed(() => {
  return environmentalData.value?.temperature ?
    parseFloat(environmentalData.value.temperature.toFixed(2)) : 0;
});

/****************************************************
 * 6) Speed Test Store Integration                  *
 ****************************************************/
const speedTestStore = useSpeedTestStore();

// Start polling with a 30-second interval
onMounted(() => {
  speedTestStore.startSpeedTestPolling(30000);
});

// Clean up on component unmount
onBeforeUnmount(() => {
  speedTestStore.stopPolling();
});
</script>