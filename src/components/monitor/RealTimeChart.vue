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

    <!-- Actual chart container -->
    <div v-else ref="chartContainer" class="w-full h-full" />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from "vue";
import * as echarts from "echarts";

/** PROPS **/
const props = defineProps({
  source: String,
  fields: {
    type: Array,
    default: () => [],
  },
  isRunning: { type: Boolean, default: false },
  isPaused: { type: Boolean, default: false },
});

/** ECharts instance & interval reference **/
let chartInstance = null;
const chartContainer = ref(null);
let intervalId = null;

/**
 * For each field, we have a time-series array:
 * seriesDataMap[field] = [[time, value], ...].
 */
const seriesDataMap = {};

/** We'll track "current time" for generating data. */
let now = new Date(2025, 0, 31, 19, 0, 0);
const oneMinute = 60 * 1000;

/**
 * Baseline/delta config for each possible field.
 */
const fieldConfig = {
  Temperature: { baseline: 80, stepRange: [-1, 1] },
  Humidity: { baseline: 20, stepRange: [-1, 1] },
  "Packet Loss": { baseline: 0, stepRange: [-0.5, 1] },
  Latency: { baseline: 50, stepRange: [-10, 10] },
  RSRP: { baseline: -90, stepRange: [-5, 5] },
  RSRQ: { baseline: -10, stepRange: [-5, 5] },
  SINR: { baseline: 5, stepRange: [-10, 10] },
  Volts: { baseline: 12, stepRange: [-0.2, 0.2] },
  Watts: { baseline: 3, stepRange: [-0.3, 0.3] },
  Amps: { baseline: 0.5, stepRange: [-0.1, 0.1] },
};

/**
 * initializeSeriesData - create new arrays for each field
 * and fill them with some initial data (e.g. 50 points).
 */
function initializeSeriesData() {
  // Reset the time
  now = new Date(2025, 0, 31, 19, 0, 0);

  // Clear the old data
  for (const key in seriesDataMap) {
    delete seriesDataMap[key];
  }

  // Prepare arrays for each field
  for (const f of props.fields) {
    seriesDataMap[f] = [];
  }

  // Generate initial points
  for (let i = 0; i < 120; i++) {
    createNextDataPoint();
  }
}

/**
 * createNextDataPoint - increments time by one minute
 * and for each field, appends a new random value.
 */
function createNextDataPoint() {
  now = new Date(+now + oneMinute);

  for (const field of props.fields) {
    const cfg = fieldConfig[field];
    if (!cfg) continue;

    let lastVal = cfg.baseline;
    const arr = seriesDataMap[field];

    if (arr.length > 0) {
      lastVal = arr[arr.length - 1][1];
    }

    const [minD, maxD] = cfg.stepRange;
    const delta = Math.random() * (maxD - minD) + minD;
    const newVal = parseFloat((lastVal + delta).toFixed(2));

    arr.push([now, newVal]);
  }
}

/**
 * pushNewData - shift oldest data, add a new data point,
 * update chart series, but only if not paused.
 */
function pushNewData() {
  // If paused, do nothing.
  if (props.isPaused) return;

  // Shift out the oldest sample
  for (const f of props.fields) {
    seriesDataMap[f].shift();
  }
  // Generate one new sample
  createNextDataPoint();

  // Update chart data
  chartInstance?.setOption({
    series: props.fields.map((f) => ({
      name: f,
      data: seriesDataMap[f],
    })),
  });
}

/**
 * getChartOption - builds ECharts config from seriesDataMap.
 */
function getChartOption() {
  let globalMax = -999999,
    globalMin = 999999;

  for (const f of props.fields) {
    for (const [, val] of seriesDataMap[f]) {
      if (val > globalMax) globalMax = val;
      if (val < globalMin) globalMin = val;
    }
  }

  if (globalMax < -9000) globalMax = 1;
  if (globalMin > 9000) globalMin = 0;
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
    series: props.fields.map((f) => ({
      name: f,
      type: "line",
      data: seriesDataMap[f],
      smooth: true,
      showSymbol: false,
    })),
  };
}

/** startInterval - create a new 1s timer to generate updates */
function startInterval() {
  stopInterval();
  intervalId = setInterval(() => {
    pushNewData();
    // Also update the axis scaling if new data changed range
    if (!props.isPaused) {
      chartInstance?.setOption(getChartOption());
    }
  }, 1000);
}

/** stopInterval - clear the timer if it exists */
function stopInterval() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

/** initChart - create ECharts instance and set initial option */
function initChart() {
  nextTick(() => {
    if (!chartContainer.value) return;
    disposeChart();
    chartInstance = echarts.init(chartContainer.value);
    chartInstance.setOption(getChartOption());
  });
}

/** disposeChart - properly dispose ECharts instance */
function disposeChart() {
  if (chartInstance) {
    chartInstance.dispose();
    chartInstance = null;
  }
}

/**
 * Watch for changes in isRunning, fields, and source.
 * But do NOT re-init if user just toggled isPaused.
 */
watch(
  () => [props.isRunning, props.fields],
  ([running, fields]) => {
    if (running && fields.length) {
      // If we just started or changed fields/source, re-init data
      initializeSeriesData();
      initChart();
      startInterval();
    } else {
      // If not running, stop
      stopInterval();
      disposeChart();
    }
  },
  { immediate: true }
);

/**
 * We also watch isPaused, but we do NOT re-init data or re-dispose
 * the chart. We just allow pushNewData to skip if paused.
 */
watch(
  () => props.isPaused,
  (paused) => {
    // If user unpauses, data generation simply continues from the next pushNewData call.
    // No re-initialization means no "reload" animation.
    // So we don't do anything here except avoid re-initialization.
  }
);

onMounted(() => {
  window.addEventListener("resize", resizeChart, { passive: true });
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", resizeChart);
  stopInterval();
  disposeChart();
});

function resizeChart() {
  chartInstance?.resize();
}
</script>

<style scoped>
/* Basic styling */
</style>
