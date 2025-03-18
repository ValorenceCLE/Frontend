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
            <span>Online</span>
          </div>
          <div class="flex justify-between">
            <strong>Camera:</strong>
            <span>Offline</span>
          </div>
          <div class="flex justify-between">
            <strong>Internet Speed:</strong>
            <span>100 Mbps</span>
          </div>
          <div class="flex justify-between">
            <strong>Cellular Signal:</strong>
            <span>Strong</span>
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
          :min="0"
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

// 1. Gauge scaling logic
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

// 2. Config store and system name
const configStore = useConfigStore();
const system_name = computed(() => {
  return configStore.configData?.general?.system_name || "Unnamed System";
});

// 3. Polling states from the backend
const polledRelayStates = ref({});

async function pollRelayStates() {
  try {
    const states = await getEnabledRelayStates();
    polledRelayStates.value = states;
  } catch (error) {
    console.error("Error polling relay states:", error);
  }
}

onMounted(async () => {
  // Immediate poll so states are available on load
  await pollRelayStates();
  // Poll every 2 seconds
  const pollInterval = setInterval(pollRelayStates, 2000);
  onBeforeUnmount(() => clearInterval(pollInterval));
});

// 4. Merge polled states with the config data for each enabled relay
const enabled_relays = computed(() => {
  if (!configStore.configData?.relays) return [];
  return Object.values(configStore.configData.relays)
    .filter(relay => relay.enabled)
    .map(relay => {
      // Convert config "on"/"off" to numeric 1/0 if needed
      let configState = relay.state;
      if (typeof configState === "string") {
        configState = configState.toLowerCase() === "on" ? 1 : 0;
      }
      // Use polled state if available
      const polled = polledRelayStates.value[relay.id];
      const state = polled !== undefined ? polled : configState;
      return { ...relay, state };
    });
});

// 5. When a RelayCard emits "update-state", update polledRelayStates so the UI refreshes immediately
function updateRelayState({ id, state }) {
  polledRelayStates.value = {
    ...polledRelayStates.value,
    [id]: state,
  };
}

// 6. Demo gauge values
const temperature = ref(20);
const volts = ref(0);
let gaugeInterval = null;
onMounted(() => {
  gaugeInterval = setInterval(() => {
    temperature.value = Math.floor(Math.random() * 121);
    volts.value = Math.floor(Math.random() * 25);
  }, 3000);
});
onBeforeUnmount(() => {
  if (gaugeInterval) clearInterval(gaugeInterval);
});
</script>
