<template>
  <div ref="chartContainer" class="w-full h-full relative">
    <!-- If no active data, show a placeholder -->
    <div v-if="!hasActiveData" class="flex items-center justify-center w-full h-full text-gray-500">
      <span class="text-sm italic">
        Select a source, fields, and date range, then click "Graph" to view historical data.
      </span>
    </div>

    <!-- Loading indicator - centered in the chart area -->
    <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center z-10">
      <div class="bg-white bg-opacity-80 p-3 rounded-md shadow-md">
        <div class="flex items-center space-x-2">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-textColor"></div>
          <span>Loading...</span>
        </div>
      </div>
    </div>

    <!-- Error message -->
    <div v-if="error" class="absolute inset-0 flex items-center justify-center z-10">
      <div class="bg-red-100 p-3 rounded-md shadow-md text-red-700">
        <div class="flex items-center space-x-2">
          <span>{{ error }}</span>
        </div>
      </div>
    </div>

    <!-- Point count warning -->
    <div v-if="pointCountWarning"
      class="absolute top-0 right-0 m-2 bg-yellow-100 p-2 rounded-md shadow-md text-yellow-700 text-sm z-10">
      <div class="flex items-center space-x-2">
        <span>{{ pointCountWarning }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, watch, computed } from "vue";
import * as echarts from "echarts/core";
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
const emit = defineEmits(['fetched', 'resetComplete', 'exportData', 'dataPointCount']);

// Local references
let chartInstance = null;
const chartContainer = ref(null);
const data = ref({});
const isLoading = ref(false);
const error = ref(null);
const hasActiveData = ref(false);
const pointCountWarning = ref(null);
const totalDataPoints = ref(0);

// Nicer title formatting
const formattedSourceName = computed(() => {
  if (!props.source) return "";

  if (props.source === "environmental") {
    return "Environmental";
  } else if (props.source === "main") {
    return "Main Power";
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
// with smarter logic to maintain detail while limiting point count
function calculateInterval(startDate, endDate) {
  if (!startDate || !endDate) return '1m';

  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffHours = Math.abs(end - start) / 36e5; // Convert ms to hours

  // Target max points - balance between detail and performance
  // This is for each field - total points will be this * number of fields
  const TARGET_POINTS_PER_FIELD = 2000;

  // Calculate points we'd get with 10s intervals (finest granularity)
  const pointsWith10s = diffHours * 60 * 6; // 6 points per minute

  if (pointsWith10s <= TARGET_POINTS_PER_FIELD) {
    // If we can use 10s intervals without exceeding target, use it
    return '10s';
  }

  // Calculate the ideal interval to get close to TARGET_POINTS_PER_FIELD
  const idealIntervalSeconds = Math.ceil(pointsWith10s / TARGET_POINTS_PER_FIELD) * 10;

  // Map to standard intervals
  if (idealIntervalSeconds <= 10) return '10s';
  if (idealIntervalSeconds <= 30) return '30s';
  if (idealIntervalSeconds <= 60) return '1m';
  if (idealIntervalSeconds <= 120) return '2m';
  if (idealIntervalSeconds <= 300) return '5m';
  if (idealIntervalSeconds <= 600) return '10m';
  if (idealIntervalSeconds <= 900) return '15m';
  if (idealIntervalSeconds <= 1800) return '30m';
  if (idealIntervalSeconds <= 3600) return '1h';
  if (idealIntervalSeconds <= 10800) return '3h';
  return '6h';
}

// Calculate expected point count to warn users about potential performance issues
function calculateExpectedPoints(startDate, endDate, interval) {
  if (!startDate || !endDate || !interval) return 0;

  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffMs = Math.abs(end - start);

  // Convert interval string to milliseconds
  let intervalMs = 60000; // Default to 1 minute
  if (interval.endsWith('s')) {
    intervalMs = parseInt(interval) * 1000;
  } else if (interval.endsWith('m')) {
    intervalMs = parseInt(interval) * 60 * 1000;
  } else if (interval.endsWith('h')) {
    intervalMs = parseInt(interval) * 60 * 60 * 1000;
  }

  // Calculate points per field
  const pointsPerField = Math.ceil(diffMs / intervalMs);

  // Multiply by number of fields
  return pointsPerField * props.fields.length;
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
  pointCountWarning.value = null;
  totalDataPoints.value = 0;

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
  pointCountWarning.value = null;
  totalDataPoints.value = 0;

  try {
    const results = {};

    // Calculate appropriate interval or fetch it from the server
    let interval;

    try {
      // Try to get the best interval from the server
      const autoIntervalResponse = await axios.get(`/timeseries/auto-interval`, {
        params: {
          start_time: props.startDate,
          end_time: props.endDate,
          max_points: 2500 // Target per field (balance between detail and performance)
        }
      });

      // Use the recommended interval
      interval = autoIntervalResponse.data.recommended_interval;
      console.log(`Server recommended interval: ${interval} (est. ${autoIntervalResponse.data.estimated_points} points per field)`);

      // Show warning if still a lot of points
      if (autoIntervalResponse.data.estimated_points * props.fields.length > 50000) {
        pointCountWarning.value = `High data volume (est. ${(autoIntervalResponse.data.estimated_points * props.fields.length).toLocaleString()} points). Chart may be slow.`;
      }
    } catch (e) {
      // Fallback to local calculation if server endpoint fails
      console.warn("Failed to get auto interval from server, using local calculation", e);
      interval = calculateInterval(props.startDate, props.endDate);
    }

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
      totalDataPoints.value += results[displayField].length;
    }

    data.value = results;
    hasActiveData.value = true;

    // Emit the data information to parent
    emit('dataPointCount', {
      pointCount: totalDataPoints.value,
      interval: interval
    });

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

    // Choose sampling strategy based on data size
    // LTTB (Largest-Triangle-Three-Buckets) preserves visual characteristics while downsampling
    const samplingStrategy = totalDataPoints.value > 5000 ? 'lttb' : false;

    // For very large datasets, use a stepped line to better show discrete readings
    const isStepLine = formattedData.length > 1000;

    return {
      name: field.charAt(0).toUpperCase() + field.slice(1),
      type: 'line',
      smooth: formattedData.length < 500, // Use smooth lines only for smaller datasets
      step: isStepLine ? 'middle' : false, // Use stepped lines for large datasets to better show sensor readings
      showSymbol: formattedData.length < 1000, // Only show symbols for smaller datasets
      symbolSize: formattedData.length < 200 ? 5 : 3, // Larger symbols for smaller datasets
      sampling: samplingStrategy,
      data: formattedData,
      lineStyle: {
        width: formattedData.length < 1000 ? 2 : 1.5, // Thinner lines for large datasets
        color: colorMapping[field] || '#000000'
      },
      itemStyle: {
        color: colorMapping[field] || '#000000'
      },
      emphasis: {
        // Highlight on hover
        itemStyle: {
          borderWidth: 2
        },
        lineStyle: {
          width: 3
        }
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
      top: 10,
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    legend: {
      data: Object.keys(data.value),
      bottom: 40,  // Position directly at bottom
      textStyle: {
        fontSize: 12
      },
      selectedMode: true,  // Allow toggling series visibility
      type: 'scroll',      // Allow scrolling for many fields
      pageButtonPosition: 'end',
      padding: [5, 10]
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',        // Show crosshair
        animation: false,     // Disable animation for better performance
        lineStyle: {
          color: '#555',
          width: 1,
          type: 'dashed'
        }
      },
      formatter: function (params) {
        let tooltipText = '';
        if (params.length > 0) {
          const date = new Date(params[0].value[0]);
          tooltipText = `<div style="font-weight:bold;margin-bottom:3px">${date.toLocaleString()}</div>`;

          params.forEach(param => {
            const value = parseFloat(param.value[1]).toFixed(2);
            const color = param.color;
            tooltipText += `<div style="display:flex;align-items:center;margin:3px 0">
              <span style="display:inline-block;width:10px;height:10px;background:${color};margin-right:5px;border-radius:50%"></span>
              <span style="margin-right:5px">${param.seriesName}:</span>
              <span style="font-weight:bold">${value}</span>
            </div>`;
          });
        }
        return tooltipText;
      },
      confine: true,  // Prevent tooltip from going outside chart area
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderColor: '#ccc',
      borderWidth: 1,
      textStyle: {
        fontSize: 12
      }
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
        saveAsImage: {
          title: 'Save as Image',
          pixelRatio: 2  // High quality export
        },
        dataZoom: {
          title: {
            zoom: 'Area Zoom',
            back: 'Zoom Reset'
          },
          yAxisIndex: 'none'
        },
        restore: {
          title: 'Restore'
        },
      },
      right: 15,
      top: 15
    },
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100,  // Show full range initially
        minValueSpan: 10 * 60 * 1000  // Minimum zoom interval (10 minutes)
      },
      {
        start: 0,
        end: 100,
        bottom: 10,  // Position above the legend
        height: 20,   // Make it easier to grab
        borderColor: '#ccc',
        handleStyle: {
          color: '#777',
          borderColor: '#555'
        }
      }
    ],
    xAxis: {
      type: 'time',
      splitLine: {
        show: false
      },
      axisLabel: {
        formatter: function (value) {
          const date = new Date(value);
          // For intervals less than a day, show time only
          if (date.getHours() === 0 && date.getMinutes() === 0) {
            return date.toLocaleDateString();
          }
          return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        },
        showMaxLabel: true,
        showMinLabel: true
      },
      axisPointer: {
        snap: true
      }
    },
    yAxis: {
      type: 'value',
      min: yMin,
      max: yMax,
      splitLine: {
        show: true,
        lineStyle: {
          type: 'dashed',
          opacity: 0.7
        }
      },
      axisLabel: {
        formatter: function (value) {
          // Format numbers for readability
          if (Math.abs(value) >= 1000) {
            return value.toLocaleString();
          }
          // Use decimal places only if needed
          return Math.abs(value) < 10 ? value.toFixed(2) : value.toFixed(1);
        }
      }
    },
    series: series,
    // Performance optimizations
    progressive: 750,        // Number of data points rendered in each animation frame
    progressiveThreshold: 2000,  // Enable progressive rendering for datasets larger than this
    animation: totalDataPoints.value < 8000,  // Disable animation for very large datasets
    hoverLayerThreshold: 3000,   // Increase threshold for hover layer
    // Make the chart more responsive
    useUTC: false,           // Use local time
    renderer: 'canvas',      // Canvas renderer is faster for large datasets
    emphasis: {              // Global emphasis settings
      focus: 'series',
      blurScope: 'coordinateSystem'
    }
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