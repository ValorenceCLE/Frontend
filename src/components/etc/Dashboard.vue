<template>
  <div class="w-full max-w-4xl mx-auto">
    <!-- Dashboard Header -->
    <div
      class="bg-gray-200 p-2 rounded-lg shadow-md border border-gray-400 max-w-xl flex justify-center items-center mx-auto"
    >
      <h1 class="text-Header text-textColor">R&D Demo Unit</h1>
    </div>

    <!-- The container we measure for a unified scale -->
    <div
      ref="scalingContainer"
      class="w-full mt-3 mb-3 flex text-center space-x-3 overflow-auto break-words"
    >
      <!-- Left Column (Control Panel) -->
      <div class="flex-[2] bg-gray-200 p-1 rounded-lg border border-gray-400 shadow-lg">
        <!-- If you want a dynamic heading style here, use leftTitleStyle. 
               Or just do a static style. 
               Let's do a dynamic approach for demonstration. -->
        <h1 :style="leftTitleStyle" class="text-center">Status</h1>
        <div class="border-solid border border-gray-700 ml-2 mr-2"></div>
        <div class="mt-3 space-y-2 text-Body text-textColor text-left px-3">
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
      <div class="flex-[1.5] bg-gray-200 p-1 rounded-lg h-48 border border-gray-400">
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
      <div
        class="flex-[1.5] bg-gray-200 p-1 rounded-lg h-48 border border-gray-400 shadow-lg"
      >
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
    <div class="w-full mt-3 space-y-2">
      <RelayCard
        v-for="(relay, index) in relays"
        :key="index"
        :initialName="relay.name"
        :initialStatus="relay.status"
        :initialButtons="relay.buttons"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, computed } from "vue";
import Gauge from "@/components/etc/Gauge.vue";
import RelayCard from "@/components/relays/RelayCard.vue";
import RelayApi from "@/api/dummyApi";

// We measure scalingContainer to compute a shared scale factor
// Reference to the scaling container element
const scalingContainer = ref(null);

// Reactive variables to store the container's width and height
const containerWidth = ref(0);
const containerHeight = ref(0);

onMounted(() => {
  // Measure the scaling container dimensions when the component is mounted
  measureScalingContainer();
  // Add a resize event listener to re-measure the container on window resize
  window.addEventListener("resize", measureScalingContainer, { passive: true });
});

onBeforeUnmount(() => {
  // Remove the resize event listener when the component is about to be unmounted
  window.removeEventListener("resize", measureScalingContainer);
});

function measureScalingContainer() {
  // Measure the container dimensions after the DOM has been updated
  nextTick(() => {
    if (scalingContainer.value) {
      containerWidth.value = scalingContainer.value.clientWidth;
      containerHeight.value = scalingContainer.value.clientHeight;
    }
  });
}

// Computed property to calculate a dynamic scale based on container dimensions
const sharedScale = computed(() => {
  const w = containerWidth.value;
  const h = containerHeight.value;
  if (!w || !h) return 1;

  // Use the smaller dimension to determine the scale
  const dimension = Math.min(w, h);
  let s = dimension / 400;
  if (s < 1.0) s = 1.0; // Minimum scale
  if (s > 2.0) s = 2.0; // Maximum scale
  return s;
});

// Computed property to dynamically style the left column heading
const leftTitleStyle = computed(() => ({
  fontSize: `${Math.round(22 * sharedScale.value)}px`,
  fontWeight: "bolder",
  color: "#333",
  textAlign: "center",
}));

/** Relay & Demo data */
const relays = ref([]);
const temperature = ref(20);
const volts = ref(0);
let intervalId = null;

onMounted(() => {
  // Example: random updates
  intervalId = setInterval(() => {
    // 0–120
    temperature.value = Math.floor(Math.random() * 121);
    // 0–24
    volts.value = Math.floor(Math.random() * 25);
  }, 3000);

  // Dummy fetch
  const response = RelayApi.get("/api/relays");
  if (response.success) {
    relays.value = response.data;
  }
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
