<template>
  <div class="w-full max-w-4xl mx-auto">
    <!-- Dashboard Header -->
    <div
      class="bg-gray-200 px-3 py-1.5 rounded-md shadow border border-gray-500 max-w-xl flex justify-center items-center mx-auto"
    >
      <!-- Dynamic system_name header from the config store -->
      <h1 class="text-Header text-textColor">{{ system_name }}</h1>
    </div>

    <!-- The container we measure for a unified scale -->
    <div
      ref="scalingContainer"
      class="w-full my-2 flex text-center space-x-2 overflow-auto break-words items-stretch"
    >
      <!-- Left Column (Control Panel) -->
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

      <!-- Middle Column: "Main Power" -->
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

      <!-- Right Column: "Temperature" -->
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
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, computed } from "vue";
import Gauge from "@/components/dashboard/Gauge.vue";
import RelayCard from "@/components/dashboard/RelayCard.vue";
import { useConfigStore } from "@/store/config";

// Reference to the scaling container element
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

// Shared scale computed from container dimensions
const sharedScale = computed(() => {
  const w = containerWidth.value;
  const h = containerHeight.value;
  if (!w || !h) return 1;
  const dimension = Math.min(w, h);
  let s = dimension / 400;
  if (s < 1.0) s = 1.0;
  if (s > 2.0) s = 2.0;
  return s;
});

// Dynamically style the left column heading
const leftTitleStyle = computed(() => ({
  fontSize: `${Math.round(22 * sharedScale.value)}px`,
  fontWeight: "bolder",
  color: "#333",
  textAlign: "center",
}));

// Global configuration store
const configStore = useConfigStore();

// System name derived from the global config's general object
const system_name = computed(() => {
  return configStore.configData && configStore.configData.general && configStore.configData.general.name
    ? configStore.configData.general.name
    : "Unnamed System";
});

// Compute enabled relays from the global configuration (relays object using snake_case keys)
const enabled_relays = computed(() => {
  if (!configStore.configData || !configStore.configData.relays) return [];
  return Object.values(configStore.configData.relays).filter(relay => relay.enabled);
});

// Demo gauge values
const temperature = ref(20);
const volts = ref(0);
let intervalId = null;

onMounted(() => {
  intervalId = setInterval(() => {
    temperature.value = Math.floor(Math.random() * 121); // 0–120°F
    volts.value = Math.floor(Math.random() * 25);         // 0–24V
  }, 3000);
});
onBeforeUnmount(() => {
  if (intervalId) clearInterval(intervalId);
});
</script>

<script>
export default {
  name: "Dashboard",
  components: {
    Gauge,
    RelayCard,
  },
};
</script>
