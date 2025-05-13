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
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from "vue";
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
const wsConnection = ref(null);

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

// Create a reactive wsEndpoint that updates when the source changes
const wsEndpoint = computed(() => props.source || '');

// WebSocket handler function (will be used to create connections)
const handleWebSocketMessage = (rawData) => {
  if (!props.isRunning || props.isPaused) return;
  
  console.log('WebSocket data received:', rawData);
  const timestamp = new Date();
  
  // For each selected field, add the new data point if available
  for (const field of props.fields) {
    const sensorKey = fieldMapping[field];
    
    // Make sure the sensorKey exists and has a value in the data
    if (sensorKey && rawData[sensorKey] !== undefined) {
      // Initialize array if it doesn't exist
      if (!seriesDataMap.value[field]) {
        seriesDataMap.value[field] = [];
      }
      
      // Parse the value as a number
      const value = parseFloat(rawData[sensorKey]);
      
      if (!isNaN(value)) {
        seriesDataMap.value[field].push([timestamp, value]);
        // Keep only the latest 120 points
        if (seriesDataMap.value[field].length > 120) {
          seriesDataMap.value[field].shift();
        }
        
        console.log(`Added data point for ${field}: [${timestamp.toISOString()}, ${value}]`);
      }
    }
  }
  
  // Update the chart
  if (chartInstance) {
    chartInstance.setOption(getChartOption());
  }
};

// Function to connect to WebSocket
function connectWebSocket() {
  // Don't try to connect if we don't have a source
  if (!props.source) {
    console.warn('Cannot connect WebSocket - no source provided');
    return;
  }
  
  // Disconnect existing connection if any
  disconnectWebSocket();
  
  // Create a new connection
  console.log(`Connecting to WebSocket for source: ${props.source}`);
  
  const { data, isConnected, connect, disconnect } = useWebSocket(props.source, {
    immediate: true, // Connect immediately
    formatter: (data) => data,
    errorHandler: (error) => console.error('WebSocket error:', error)
  });
  
  // Store the disconnect function for later cleanup
  wsConnection.value = { disconnect };
  
  // Watch for data changes
  watch(data, (newData) => {
    if (newData && props.isRunning && !props.isPaused) {
      handleWebSocketMessage(newData);
    }
  });
}

// Function to disconnect WebSocket
function disconnectWebSocket() {
  if (wsConnection.value && wsConnection.value.disconnect) {
    console.log('Disconnecting WebSocket');
    wsConnection.value.disconnect();
    wsConnection.value = null;
  }
}

// Initialize series data storage for each selected field.
function initializeSeriesData() {
  console.log('Initializing series data for fields:', props.fields);
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
    
    // Find min/max values for the y-axis
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
  
  // Set default values if no data yet
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
    
    console.log('Initializing chart');
    chartInstance = echarts.init(chartContainer.value);
    chartInstance.setOption(getChartOption());
  });
}

// Dispose of the chart instance.
function disposeChart() {
  if (chartInstance) {
    console.log('Disposing chart');
    chartInstance.dispose();
    chartInstance = null;
  }
}

// Watch for changes in isRunning, source, or fields.
watch(
  [() => props.isRunning, () => props.source, () => props.fields],
  ([running, source, fields], [oldRunning, oldSource]) => {
    console.log('Watch triggered:', {running, source, fields});
    
    if (running && source && fields.length > 0) {
      console.log('Starting chart with source:', source);
      
      // Initialize series data and chart
      initializeSeriesData();
      initChart();
      
      // Connect WebSocket
      connectWebSocket();
    } else if (!running && oldRunning) {
      console.log('Stopping chart');
      disconnectWebSocket();
      disposeChart();
    }
  },
  { immediate: true, deep: true }
);

// Watch for source changes when running
watch(() => props.source, (newSource, oldSource) => {
  if (props.isRunning && newSource && newSource !== oldSource) {
    console.log(`Source changed from ${oldSource} to ${newSource}, reconnecting`);
    
    // Reset data and reconnect
    initializeSeriesData();
    connectWebSocket();
  }
});

// Resize chart on window resize.
function resizeChart() {
  if (chartInstance) {
    chartInstance.resize();
  }
}

onMounted(() => {
  window.addEventListener("resize", resizeChart, { passive: true });
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", resizeChart);
  disconnectWebSocket(); // Make sure we disconnect
  disposeChart();
});
</script>