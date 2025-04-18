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

          <!-- Upload/Download Speeds from the Store - UPDATED SECTION -->
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
                {{ (speedTestStore.speedTestResults.upload / 1_000_000).toFixed(2) }} Mbps
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
                {{ (speedTestStore.speedTestResults.download / 1_000_000).toFixed(2) }} Mbps
              </template>
            </span>
          </div>
        </div>
      </div>

      <!-- Middle Column: Main Power Gauge -->
      <div class="flex-[1.5] bg-gray-200 p-1 rounded h-44 border border-gray-500">
        <Gauge
          title="Main Power"
          :min="0"
          :max="24"
          unit="v"
          :value="volts"
          :scale="sharedScale"
          class="w-full h-full"
        />
      </div>

      <!-- Right Column: Temperature Gauge -->
      <div class="flex-[1.5] bg-gray-200 p-1 rounded h-44 border border-gray-500">
        <Gauge
          title="Temperature"
          :min="-32" 
          :max="120"
          unit="°F"
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
import { websocketService } from "@/services/websocketService";
import { monitoringService } from '@/services/monitoringService';

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
  monitoringService.trackEvent('component', 'view', 'Dashboard');
  
  // Mark the performance
  monitoringService.markPerformance('dashboard:mounted');
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
 * 2) Config Store & System Name      *
 ***************************************/
const configStore = useConfigStore();
const system_name = computed(
  () => configStore.configData?.general?.system_name || "Unnamed System"
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

  // Poll relay states immediately and then every 2 seconds
  pollRelayStates();
  const pollInterval = setInterval(pollRelayStates, 2000);
  onBeforeUnmount(() => clearInterval(pollInterval));
});

/*****************************************************
 * 4) Merge polled relay states with config store    *
 *****************************************************/
const enabled_relays = computed(() => {
  if (!configStore.configData?.relays) return [];
  return Object.values(configStore.configData.relays)
    .filter((relay) => relay.enabled)
    .map((relay) => {
      let configState = relay.state;
      if (typeof configState === "string") {
        configState = configState.toLowerCase() === "on" ? 1 : 0;
      }
      const polled = polledRelayStates.value[relay.id];
      const state = polled !== undefined ? polled : configState;
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
 * 5) Demo Gauges (WebSocket Integration)     *
 **********************************************/
const temperature = ref(20);
const volts = ref(0);

let unsubscribeVolts = null;
let unsubscribeEnvironmental = null;

onMounted(() => {
  // Subscribe to Volts WebSocket
  unsubscribeVolts = websocketService.subscribeToMainVolts((event) => {
    try {
      const data = JSON.parse(event.data);
      volts.value = typeof data === "number" 
        ? parseFloat(data.toFixed(2)) 
        : parseFloat(data.voltage.toFixed(2));
    } catch (error) {
      console.error("Error parsing volts websocket data:", error);
    }
  });

  // Subscribe to Temperature WebSocket
  unsubscribeEnvironmental = websocketService.subscribeToEnvironmental((event) => {
    try {
      const data = JSON.parse(event.data);
      temperature.value = typeof data === "number" 
        ? parseFloat(data.toFixed(2)) 
        : parseFloat(data.temperature.toFixed(2));
    } catch (error) {
      console.error("Error parsing temperature websocket data:", error);
    }
  });
});

onBeforeUnmount(() => {
  if (unsubscribeVolts) unsubscribeVolts();
  if (unsubscribeEnvironmental) unsubscribeEnvironmental();
});

/****************************************************
 * 6) Speed Test Store Integration - UPDATED SECTION *
 ****************************************************/
const speedTestStore = useSpeedTestStore();

// Start polling with a 30-second interval instead of the original 10-second interval
// to avoid hitting rate limits (especially since your API has a 5-minute cache)
speedTestStore.startSpeedTestPolling(30000);

// Clean up on component unmount
onBeforeUnmount(() => {
  speedTestStore.stopPolling();
});
</script>