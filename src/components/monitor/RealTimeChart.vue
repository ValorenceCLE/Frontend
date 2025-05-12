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
import { useWebSocket } from '@/composables/useWebSocket';

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

// Mapping display field names to sensor data keys.
const fieldMapping = {
  Volts: "voltage",
  Amps: "current",
  Watts: "power",
  Temperature: "temperature",
  Humidity: "humidity",
};

// Object to store time-series data for each field.
const seriesDataMap = ref({});

// WebSocket connection using our composable
const { data, connect, disconnect } = useWebSocket(props.source, {
  immediate: false, // Don't connect immediately
  formatter: (data) => data
});

// Watch for changes in data
watch(data, (newData) => {
  if (props.isPaused || !newData) return;
  
  const timestamp = new Date();
  
  // For each selected field, add the new data point if available
  for (const field of props.fields) {
    const sensorKey = fieldMapping[field];
    if (sensorKey && sensorKey in newData) {
      if (!seriesDataMap.value[field]) {
        seriesDataMap.value[field] = [];
      }
      seriesDataMap.value[field].push([timestamp, newData[sensorKey]]);
      // Keep only the latest 120 points
      if (seriesDataMap.value[field].length > 120) {
        seriesDataMap.value[field].shift();
      }
    }
  }
  
  // Update the chart
  if (chartInstance) {
    chartInstance.setOption(getChartOption());
  }
});

// Initialize series data storage for each selected field.
function initializeSeriesData() {
  seriesDataMap.value = {};
  for (const field of props.fields) {
    seriesDataMap.value[field] = [];
  }
}

// Build and return the ECharts option using seriesDataMap.
function getChartOption() {
  let globalMax = -Infinity,
    globalMin = Infinity;
  const series = props.fields.map((field) => {
    const data = seriesDataMap.value[field] || [];
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

// Watch for changes in isRunning, source, or fields.
watch(
  () => [props.isRunning, props.source, props.fields],
  ([running, source, fields]) => {
    if (running && source && fields.length > 0) {
      initializeSeriesData();
      initChart();
      connect(); // Connect using our composable
    } else {
      disconnect(); // Disconnect using our composable
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
  disconnect(); // Make sure we disconnect
  disposeChart();
});
</script>