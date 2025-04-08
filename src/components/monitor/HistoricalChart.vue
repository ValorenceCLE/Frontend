<template>
  <div ref="chartContainer" class="w-full h-full relative">
    <!-- If no active data, show a placeholder -->
    <div
      v-if="!hasActiveData"
      class="flex items-center justify-center w-full h-full text-gray-500"
    >
      <span class="text-sm italic">
        Select a source, fields, and date range, then click "Graph" to view historical data.
      </span>
    </div>
    
    <!-- Loading indicator - centered in the chart area -->
    <div
      v-if="isLoading"
      class="absolute inset-0 flex items-center justify-center z-10"
    >
      <div class="bg-white bg-opacity-80 p-3 rounded-md shadow-md">
        <div class="flex items-center space-x-2">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-textColor"></div>
          <span>Loading...</span>
        </div>
      </div>
    </div>
    
    <!-- Error message -->
    <div
      v-if="error"
      class="absolute inset-0 flex items-center justify-center z-10"
    >
      <div class="bg-red-100 p-3 rounded-md shadow-md text-red-700">
        <div class="flex items-center space-x-2">
          <span>{{ error }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, watch, computed } from "vue";
import * as echarts from "echarts";
import axios from '@/axios';

// Define component props
const props = defineProps({
  source: String,
  field: String,
  fields: {
    type: Array,
    default: () => [],
  },
  startDate: String,
  endDate: String,
  shouldFetch: {
    type: Boolean,
    default: false
  },
  shouldReset: {
    type: Boolean,
    default: false
  }
});

// Emit events
const emit = defineEmits(['fetched', 'resetComplete', 'exportData']);

// Local references
let chartInstance = null;
const chartContainer = ref(null);
const data = ref({});
const isLoading = ref(false);
const error = ref(null);
const hasActiveData = ref(false);

// Nicer title formatting
const formattedSourceName = computed(() => {
  if (!props.source) return "";
  
  if (props.source === "environmental") {
    return "Environmental";
  } else if (props.source === "main") {
    return "Main";
  } else if (props.source.startsWith("camera")) {
    return "Camera";
  } else {
    // Capitalize first letter and replace underscores with spaces
    return props.source.charAt(0).toUpperCase() + 
           props.source.slice(1).replace(/_/g, ' ');
  }
});

// Field to API field mapping
const fieldMapping = {
  "Volts": "voltage",
  "Amps": "current",
  "Watts": "power",
  "Temperature": "temperature",
  "Humidity": "humidity"
};

// Field to color mapping for consistent colors
const colorMapping = {
  "Volts": "#FF0000",  // Red
  "Amps": "#00FF00",   // Green 
  "Watts": "#0000FF",  // Blue
  "Temperature": "#FFA500", // Orange
  "Humidity": "#800080"     // Purple
};

// Calculate appropriate interval based on time range
function calculateInterval(startDate, endDate) {
  if (!startDate || !endDate) return '1m';
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffHours = Math.abs(end - start) / 36e5; // Convert ms to hours
  
  if (diffHours <= 3) return '1m';  // 1 minute for up to 3 hours
  if (diffHours <= 12) return '5m';  // 5 minutes for up to 12 hours
  if (diffHours <= 24) return '10m'; // 10 minutes for up to 24 hours
  if (diffHours <= 72) return '30m'; // 30 minutes for up to 3 days
  if (diffHours <= 168) return '1h'; // 1 hour for up to 7 days
  return '3h';                       // 3 hours for longer periods
}

// Watch for changes to the shouldFetch prop
watch(() => props.shouldFetch, (newValue) => {
  if (newValue === true && props.source && props.fields.length > 0 && props.startDate && props.endDate) {
    fetchData();
  }
});

// Watch for changes to the shouldReset prop
watch(() => props.shouldReset, (newValue) => {
  if (newValue === true) {
    resetChart();
  }
});

// Reset the chart data
function resetChart() {
  data.value = {};
  error.value = null;
  hasActiveData.value = false;
  
  if (chartInstance) {
    chartInstance.dispose();
    chartInstance = null;
  }
  
  emit('resetComplete');
}

// Export chart data
function exportData() {
  if (!hasActiveData.value) return;
  
  try {
    // Format data for CSV export
    let csvContent = "data:text/csv;charset=utf-8,Time";
    const allFields = Object.keys(data.value);
    
    // Add field headers
    allFields.forEach(field => {
      csvContent += `,${field}`;
    });
    csvContent += "\n";
    
    // Create a map of timestamps to values
    const timeMap = {};
    
    // Collect all timestamps
    allFields.forEach(field => {
      (data.value[field] || []).forEach(item => {
        if (!timeMap[item.time]) {
          timeMap[item.time] = {};
        }
        timeMap[item.time][field] = item.value;
      });
    });
    
    // Sort timestamps chronologically
    const sortedTimes = Object.keys(timeMap).sort();
    
    // Add data rows
    sortedTimes.forEach(timestamp => {
      const date = new Date(timestamp);
      csvContent += `"${date.toLocaleString()}"`;
      
      allFields.forEach(field => {
        csvContent += `,${timeMap[timestamp][field] || ""}`;
      });
      
      csvContent += "\n";
    });
    
    // Create and trigger download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${formattedSourceName.value}_Data_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return true;
  } catch (e) {
    console.error("Error exporting data:", e);
    return false;
  }
}

// Expose export functionality to parent
defineExpose({ exportData });

// Fetch data from the API for all selected fields
async function fetchData() {
  if (isLoading.value) return;
  
  isLoading.value = true;
  error.value = null;
  
  try {
    const results = {};
    
    // Calculate appropriate interval
    const interval = calculateInterval(props.startDate, props.endDate);
    
    // Fetch data for each field
    for (const displayField of props.fields) {
      const apiField = fieldMapping[displayField];
      if (!apiField) continue;
      
      let measurement = '';
      if (props.source === 'environmental') {
        measurement = 'environmental';
      } else {
        measurement = 'relay_power';
      }
      
      const response = await axios.get(`/timeseries/query`, {
        params: {
          measurement: measurement,
          field: apiField,
          source: props.source !== 'environmental' ? props.source : undefined,
          start_time: props.startDate,
          end_time: props.endDate,
          aggregation: 'mean',
          interval: interval
        }
      });
      
      results[displayField] = response.data.data || [];
    }
    
    data.value = results;
    hasActiveData.value = true;
    initChart();
  } catch (e) {
    console.error("Error fetching historical data:", e);
    error.value = e.response?.data?.detail || "Failed to fetch data. Please try again.";
  } finally {
    isLoading.value = false;
    emit('fetched');
  }
}

// Initialize the chart with the fetched data
function initChart() {
  if (!chartContainer.value) return;
  
  nextTick(() => {
    if (chartInstance) {
      chartInstance.dispose();
    }
    
    // Performance optimization: Use canvas renderer for better performance with large datasets
    chartInstance = echarts.init(chartContainer.value, null, {
      renderer: 'canvas',
      useDirtyRect: true  // Enable incremental rendering for performance
    });
    
    chartInstance.setOption(getChartOption());
  });
}

// Build the chart options
function getChartOption() {
  let globalMax = -Infinity,
    globalMin = Infinity;
  
  // Create series for each field
  const series = Object.keys(data.value).map(field => {
    const fieldData = data.value[field] || [];
    const formattedData = fieldData.map(item => {
      const value = parseFloat(item.value);
      if (value > globalMax) globalMax = value;
      if (value < globalMin) globalMin = value;
      return [new Date(item.time), value];
    });
    
    return {
      name: field.charAt(0).toUpperCase() + field.slice(1),
      type: 'line',
      smooth: false,
      showSymbol: false,
      sampling: 'lttb',  // Largest-Triangle-Three-Buckets downsampling for performance
      data: formattedData,
      lineStyle: {
        width: 2,
        color: colorMapping[field] || '#000000'
      },
      itemStyle: {
        color: colorMapping[field] || '#000000'
      }
    };
  });
  
  // Handle empty data case
  if (globalMax === -Infinity) globalMax = 1;
  if (globalMin === Infinity) globalMin = 0;
  
  // Add some padding to the y-axis
  const padding = (globalMax - globalMin) * 0.1;
  const yMax = Math.ceil(globalMax + padding);
  const yMin = Math.floor(globalMin - padding);
  
  return {
    title: {
      text: `${formattedSourceName.value} Data`,
      left: 'center',
      top: 10
    },
    legend: {
      data: Object.keys(data.value),
      bottom: 40,  // Position directly at bottom
      textStyle: {
        fontSize: 12
      }
    },
    tooltip: {
      trigger: 'axis',
      formatter: function(params) {
        let tooltipText = '';
        if (params.length > 0) {
          const date = new Date(params[0].value[0]);
          tooltipText = `${date.toLocaleString()}<br/>`;
          
          params.forEach(param => {
            tooltipText += `${param.seriesName}: ${param.value[1]}<br/>`;
          });
        }
        return tooltipText;
      },
      confine: true  // Prevent tooltip from going outside chart area
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',  // Leave space for legend and zoom
      top: '15%',
      containLabel: true
    },
    toolbox: {
      feature: {
        saveAsImage: {},
        dataZoom: {
          yAxisIndex: 'none'
        },
        restore: {}
      },
      right: 10,
      top: 10
    },
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 10
      },
      {
        start: 0,
        end: 100,
        bottom: 10  // Position above the legend
      }
    ],
    xAxis: {
      type: 'time',
      splitLine: {
        show: false
      }
    },
    yAxis: {
      type: 'value',
      min: yMin,
      max: yMax,
      splitLine: {
        show: true,
        lineStyle: {
          type: 'dashed'
        }
      }
    },
    series: series,
    // Performance optimizations
    progressive: 500,        // Number of data points rendered in each animation frame
    progressiveThreshold: 3000,  // Enable progressive rendering for datasets larger than this
    animation: false,        // Disable animation for better performance with large datasets
    hoverLayerThreshold: 3000    // Increase threshold for hover layer
  };
}

// Handle window resize
function handleResize() {
  if (chartInstance) {
    chartInstance.resize();
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  if (chartInstance) {
    chartInstance.dispose();
  }
});
</script>