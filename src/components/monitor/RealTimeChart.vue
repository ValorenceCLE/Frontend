<template>
  <div class="w-full h-full">
    <!-- If not running or no fields, show a placeholder -->
    <div
      v-if="!isRunning || !fields || fields.length === 0"
      class="flex items-center justify-center w-full h-full text-gray-500"
    >
      <span class="text-sm italic">
        Select a source and fields, then click "Run" to start the live chart.
      </span>
    </div>

    <!-- Chart Container -->
    <div v-else ref="chartContainer" class="w-full h-full" />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from "vue";
import * as echarts from "echarts";
import {
  subscribeToMainVoltsMetrics,
  subscribeToEnvironmentalMetrics,
  subscribeToIna260Metrics,
  closeWebSocket,
} from "@/api/websocketService";

// Define component props.
const props = defineProps({
  source: String,
  fields: {
    type: Array,
    default: () => [],
  },
  isRunning: { type: Boolean, default: false },
  isPaused: { type: Boolean, default: false },
});

// Local references.
let chartInstance = null;
const chartContainer = ref(null);
let socket = null;

// Mapping display field names to sensor data keys.
const fieldMapping = {
  Volts: "voltage",
  Amps: "current",
  Watts: "power",
  Temperature: "temperature",
  Humidity: "humidity",
};

// Object to store time-series data for each field.
const seriesDataMap = {};

// Initialize series data storage for each selected field.
function initializeSeriesData() {
  for (const field of props.fields) {
    seriesDataMap[field] = [];
  }
}

// Build and return the ECharts option using seriesDataMap.
function getChartOption() {
  let globalMax = -Infinity,
    globalMin = Infinity;
  const series = props.fields.map((field) => {
    const data = seriesDataMap[field] || [];
    data.forEach(([time, value]) => {
      if (value > globalMax) globalMax = value;
      if (value < globalMin) globalMin = value;
    });
    return {
      name: field,
      type: "line",
      data: data,
      smooth: false,
      showSymbol: false,
    };
  });
  if (globalMax === -Infinity) globalMax = 1;
  if (globalMin === Infinity) globalMin = 0;
  const maxY = Math.ceil(globalMax + 2);
  const minY = Math.floor(globalMin - 2);

  return {
    title: {
      text: `${props.source} Monitor`,
      left: "center",
      top: 10,
    },
    legend: {
      bottom: 5,
    },
    tooltip: {
      trigger: "axis",
      axisPointer: { animation: false },
      formatter: (params) => {
        if (!params.length) return "No data";
        const dateStr = new Date(params[0].value[0]).toLocaleString();
        let html = `<b>${dateStr}</b><br/>`;
        for (const p of params) {
          html += `<b>${p.seriesName}:</b> ${p.value[1]}<br/>`;
        }
        return html;
      },
    },
    grid: {
      top: 40,
      bottom: 40,
      left: 20,
      right: 20,
      containLabel: true,
    },
    xAxis: {
      type: "time",
      boundaryGap: false,
      splitLine: { show: false },
    },
    yAxis: {
      type: "value",
      min: minY,
      max: maxY,
    },
    series: series,
  };
}

// Initialize the ECharts instance.
function initChart() {
  nextTick(() => {
    if (!chartContainer.value) return;
    disposeChart();
    chartInstance = echarts.init(chartContainer.value);
    chartInstance.setOption(getChartOption());
  });
}

// Dispose of the chart instance.
function disposeChart() {
  if (chartInstance) {
    chartInstance.dispose();
    chartInstance = null;
  }
}

// Handle incoming websocket messages.
function handleMessage(event) {
  if (props.isPaused) return; // Do nothing if paused.
  let data;
  try {
    data = JSON.parse(event.data);
  } catch (e) {
    console.error("Error parsing websocket data:", e);
    return;
  }
  const timestamp = new Date();
  // For each selected field, add the new data point if available.
  for (const field of props.fields) {
    const sensorKey = fieldMapping[field];
    if (sensorKey && sensorKey in data) {
      if (!seriesDataMap[field]) {
        seriesDataMap[field] = [];
      }
      seriesDataMap[field].push([timestamp, data[sensorKey]]);
      // Keep only the latest 120 points.
      if (seriesDataMap[field].length > 120) {
        seriesDataMap[field].shift();
      }
    }
  }
  // Update the chart.
  if (chartInstance) {
    chartInstance.setOption(getChartOption());
  }
}

// Handle websocket errors.
function handleError(event) {
  console.error("WebSocket error:", event);
}

// Subscribe to the appropriate websocket endpoint based on the source.
function subscribeWebSocket() {
  if (socket) {
    closeWebSocket(socket);
    socket = null;
  }
  if (props.source === "environmental") {
    socket = subscribeToEnvironmentalMetrics({
      onMessage: handleMessage,
      onError: handleError,
    });
  } else if (props.source === "main") {
    socket = subscribeToMainVoltsMetrics({
      onMessage: handleMessage,
      onError: handleError,
    });
  } else {
    // For any relay, use the INA260 endpoint.
    socket = subscribeToIna260Metrics(props.source, {
      onMessage: handleMessage,
      onError: handleError,
    });
  }
}

// Unsubscribe from the websocket.
function unsubscribeWebSocket() {
  if (socket) {
    closeWebSocket(socket);
    socket = null;
  }
}

// Watch for changes in isRunning, source, or fields.
watch(
  () => [props.isRunning, props.source, props.fields],
  ([running, source, fields]) => {
    if (running && source && fields.length > 0) {
      initializeSeriesData();
      initChart();
      subscribeWebSocket();
    } else {
      unsubscribeWebSocket();
      disposeChart();
    }
  },
  { immediate: true }
);

// Resize chart on window resize.
function resizeChart() {
  chartInstance?.resize();
}

onMounted(() => {
  window.addEventListener("resize", resizeChart, { passive: true });
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", resizeChart);
  unsubscribeWebSocket();
  disposeChart();
});
</script>

<style scoped>
/* Basic styling */
</style>
