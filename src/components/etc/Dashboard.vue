<template>
  <div class="w-full max-w-4xl mx-auto my-5">
    <!-- Dashboard Header -->
    <div
      class="bg-grayLight p-4 rounded-lg text-center max-w-xl flex justify-center items-center mx-auto"
    >
      <h1 class="text-2xl font-bold">R&D Demo Unit</h1>
    </div>

    <div class="w-full mt-4 mb-5 flex text-center space-x-3">
      <!-- Left Column -->
      <div class="flex-[2] bg-grayLight p-4 rounded-lg">
        <h2 class="text-xl font-semibold">Control Panel</h2>
      </div>
      <!-- Middle Column (Gauge for Temperature) -->
      <div
        class="flex-[1.5] bg-grayLight p-4 rounded-lg h-48 flex flex-col items-center justify-center"
      >
        <h2 class="text-lg font-semibold text-gray-600">Temperature</h2>
        <div class="w-full h-full">
          <Gauge :value="75" :min="-40" :max="120" canvasId="temperatureGauge" />
        </div>
      </div>
      <!-- Right Column (Gauge for Humidity) -->
      <div
        class="flex-[1.5] bg-grayLight p-4 rounded-lg h-48 flex flex-col items-center justify-center"
      >
        <h2 class="text-lg font-semibold text-gray-600">Humidity</h2>
        <div class="w-full h-full">
          <Gauge :value="65" :min="0" :max="100" canvasId="humidityGauge" />
        </div>
      </div>
    </div>

    <!-- Relay Cards Section -->
    <div class="w-full mt-4 space-y-4">
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

<script>
import RelayCard from "@/components/relays/RelayCard.vue";
import RelayApi from "@/api/dummyApi";
import Gauge from "@/components/etc/Gauge.vue";

export default {
  name: "Dashboard",
  components: {
    RelayCard,
    Gauge,
  },
  data() {
    return {
      relays: [], // Array to store relay data
    };
  },
  async mounted() {
    const response = RelayApi.get("/api/relays"); // Fetch relay data from dummy API
    if (response.success) {
      this.relays = response.data;
    } else {
      console.error(response.error); // Handle errors gracefully
    }
  },
};
</script>
