<template>
  <div class="w-full max-w-4xl mx-auto">
    <!-- Dashboard Header -->
    <div
      class="bg-gray-200 px-3 py-1.5 rounded-md shadow border border-gray-500 max-w-xl flex justify-center items-center mx-auto"
    >
      <h1 class="text-Header text-textColor">{{ system_name }}</h1>
    </div>

    <!-- Gauge Section -->
    <div
      ref="scalingContainer"
      class="w-full my-2 flex text-center space-x-2 overflow-auto break-words items-stretch"
    >
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
                {{ formatBytesToMbps(speedTestStore.speedTestResults.upload) }} Mbps
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
                {{ formatBytesToMbps(speedTestStore.speedTestResults.download) }} Mbps
              </template>
            </span>
          </div>
        </div>
      </div>

      <!-- Middle Column: Main Power Gauge -->
      <div class="flex-[1.5] bg-gray-200 p-1 rounded h-44 border border-gray-500">
        <Gauge
          title="Main Power"
          :min="configUtils.get('gauges.main.min', 0)"
          :max="configUtils.get('gauges.main.max', 24)"
          :unit="configUtils.get('gauges.main.unit', 'v')"
          :value="volts"
          :scale="sharedScale"
          class="w-full h-full"
        />
      </div>

      <!-- Right Column: Temperature Gauge -->
      <div class="flex-[1.5] bg-gray-200 p-1 rounded h-44 border border-gray-500">
        <Gauge
          title="Temperature"
          :min="configUtils.get('gauges.temperature.min', -32)" 
          :max="configUtils.get('gauges.temperature.max', 120)"
          :unit="configUtils.get('gauges.temperature.unit', '°F')"
          :value="temperature"
          :scale="sharedScale"
          class="w-full h-full"
        />
      </div>
    </div>

    <!-- Relay Cards Section -->
    <div class="w-full mt-2 space-y-1.5">
      <RelayCard
        v-for="relay in enabled_relays"
        :key="relay.id"
        :relay="relay"
        @update-state="updateRelayState"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from "vue";
import Gauge from "@/components/dashboard/Gauge.vue";
import RelayCard from "@/components/dashboard/RelayCard.vue";
import { useConfigStore } from "@/store/config";
import { getEnabledRelayStates } from "@/api/relayService";
import { getAllNetworkStatuses } from "@/api/networkService";
import { useSpeedTestStore } from "@/store/speedTest";
import { useWebSocket } from '@/composables/useWebSocket';
import configUtils from '@/utils/configUtils';

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
  const maxScale = configUtils.get('charts.gauge.maxScale', 2.0);
  const defaultScale = configUtils.get('charts.gauge.defaultScale', 1.0);
  
  let s = dimension / 400;
  s = Math.max(defaultScale, Math.min(s, maxScale));
  
  return s;
});

const leftTitleStyle = computed(() => ({
  fontSize: `${Math.round(22 * sharedScale.value)}px`,
  fontWeight: "bolder",
  color: "#333",
  textAlign: "center",
}));

/***************************************
 * 2) Config Store & System Name      *
 ***************************************/
const configStore = useConfigStore();
const system_name = computed(
  () => configStore.systemName
);

/****************************************************
 * 3) Network Status & Relay State Polling         *
 ****************************************************/
const routerResults = ref({ online: false });
const cameraResults = ref({ online: false });
const networkLoading = ref(true);
const polledRelayStates = ref({});

// 3a) Poll Relay States
async function pollRelayStates() {
  try {
    const states = await getEnabledRelayStates();
    polledRelayStates.value = states;
  } catch (error) {
    console.error("Error polling relay states:", error);
  }
}

// 3b) Fetch Network Statuses
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

onMounted(() => {
  fetchNetworkStatuses().catch((error) =>
    console.error("Network fetch error:", error)
  );

  // Poll relay states immediately and then every X seconds (from config)
  const pollingInterval = configUtils.get('relay.pollingInterval', 2000);
  
  pollRelayStates();
  const pollInterval = setInterval(pollRelayStates, pollingInterval);
  
  onBeforeUnmount(() => clearInterval(pollInterval));
});

/*****************************************************
 * 4) Merge polled relay states with config store    *
 *****************************************************/
const enabled_relays = computed(() => {
  return configStore.enabledRelays.map(relay => {
    // Get state from polled state or use config state as fallback
    const polledState = polledRelayStates.value[relay.id];
    const state = polledState !== undefined ? polledState : relay.state;
    
    return { ...relay, state };
  });
});

// 4b) Update Relay State on immediate UI feedback
function updateRelayState({ id, state }) {
  polledRelayStates.value = {
    ...polledRelayStates.value,
    [id]: state,
  };
}

/**********************************************
 * 5) WebSocket Integration for Gauge Data   *
 **********************************************/
// Use our composable for WebSocket connections
const { data: voltsData } = useWebSocket('main', {
  formatter: (rawData) => {
    return typeof rawData === "number" 
      ? parseFloat(rawData.toFixed(2)) 
      : parseFloat(rawData.voltage?.toFixed(2) || 0);
  }
});

const { data: temperatureData } = useWebSocket('environmental', {
  formatter: (rawData) => {
    return typeof rawData === "number" 
      ? parseFloat(rawData.toFixed(2)) 
      : parseFloat(rawData.temperature?.toFixed(2) || 0);
  }
});

// Computed properties to use the websocket data
const volts = computed(() => voltsData.value || 0);
const temperature = computed(() => temperatureData.value || 0);

/****************************************************
 * 6) Speed Test Store Integration                  *
 ****************************************************/
const speedTestStore = useSpeedTestStore();

// Helper function to format bytes to Mbps with the right precision
function formatBytesToMbps(bytes) {
  if (!bytes) return "0.00";
  const mbps = bytes / 1000000; // Convert bytes to megabits
  return mbps.toFixed(2); // Format to 2 decimal places
}

// Start polling with the interval from config
const speedTestPollingInterval = configUtils.get('network.speedTest.pollingInterval', 30000);
speedTestStore.startSpeedTestPolling(speedTestPollingInterval);

// Clean up on component unmount
onBeforeUnmount(() => {
  speedTestStore.stopPolling();
});
</script>