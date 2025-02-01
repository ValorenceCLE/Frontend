<template>
  <div
    class="w-full max-w-4xl mx-auto p-4 bg-gray-200 rounded-md shadow-md border border-gray-500"
  >
    <h1 class="text-2xl font-bold mb-4 text-center">Historical: Chart Demo</h1>

    <!-- Button group for selecting which chart to display -->

    <!-- Dynamically render the chart component using :is -->
    <LargeAreaChart class="w-full h-96 bg-white rounded shadow" />
  </div>
</template>

<script setup>
import LargeAreaChart from "./LargeAreaChart.vue";
</script>

<style scoped>
/* Optional styling */
</style>
