<!--
----- IMPORTANT -----
- This file is a work in progress and is not yet ready for production use.
----- DETAILS -----
For now I dont think there is a place for anything like this.
I am going to keep the file for now because I like the file and the concept.
given the concept needs alot of work but the initial overview page isnt that badge
once I connect the HistoricalGraph to real data with the backend I can evaluate the page better.
----- END -----
-->

<template>
  <div>
    <!-- Trigger Square -->
    <div
      @click="triggerReady && openModal()"
      class="w-20 h-20 bg-blue-600 rounded cursor-pointer flex flex-col items-center justify-center shadow-md transition-colors duration-200 hover:bg-blue-500"
    >
      <div v-if="!triggerReady">
        <div class="spinner"></div>
      </div>
      <div v-else class="flex flex-col items-center">
        <span class="text-xs text-white mb-1">View Analysis</span>
        <span class="text-4xl text-white">+</span>
      </div>
    </div>

    <!-- Modal Overlay -->
    <transition name="modal">
      <div
        v-if="isModalOpen"
        class="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50"
      >
        <div class="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4">
          <!-- Header -->
          <div class="flex justify-between items-center p-4 border-b">
            <h2 class="text-2xl font-semibold">Analytics Dashboard</h2>
            <button
              @click="closeModal"
              class="text-gray-500 hover:text-gray-700 text-2xl"
            >
              &times;
            </button>
          </div>

          <!-- Tabs Navigation -->
          <div class="border-b">
            <nav class="flex space-x-4 px-4">
              <button
                v-for="tab in tabs"
                :key="tab"
                @click="switchTab(tab)"
                :class="[
                  'py-2 px-4 rounded focus:outline-none transition-colors duration-150',
                  activeTab === tab ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
                ]"
              >
                {{ tab }}
              </button>
            </nav>
          </div>

          <!-- Modal Body -->
          <div class="p-4 overflow-y-auto" style="max-height: 70vh">
            <!-- Overview Tab -->
            <div v-if="activeTab === 'Overview'">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <!-- Card 1: Performance Score with Inline Sparkline -->
                <div class="bg-gray-50 p-4 rounded shadow">
                  <p class="text-sm font-semibold">Performance Score</p>
                  <p class="text-2xl font-bold">{{ overview.performanceScore }}</p>
                  <p class="text-xs text-gray-600 mb-2">
                    (Combines stability, completeness, and error rate)
                  </p>
                  <!-- Sparkline showing overall trend -->
                  <div id="overviewSparkline" class="w-full h-12"></div>
                </div>
                <!-- Card 2: Value Summary -->
                <div class="bg-gray-50 p-4 rounded shadow">
                  <p class="text-sm font-semibold">Value Summary</p>
                  <p class="text-base">Average: {{ overview.avgValue.toFixed(2) }}</p>
                  <p class="text-base">
                    Min: {{ overview.minValue.toFixed(2) }} <br />
                    <span class="text-xs text-gray-600">at {{ formatTimestamp(overview.minTimestamp) }}</span>
                  </p>
                  <p class="text-base">
                    Max: {{ overview.maxValue.toFixed(2) }} <br />
                    <span class="text-xs text-gray-600">at {{ formatTimestamp(overview.maxTimestamp) }}</span>
                  </p>
                </div>
                <!-- Card 3: Alerts Summary -->
                <div class="bg-gray-50 p-4 rounded shadow">
                  <p class="text-sm font-semibold">Total Alerts</p>
                  <p class="text-2xl font-bold">{{ overview.alertCount }}</p>
                  <div id="alertsSparkline" class="w-full h-12 mt-2"></div>
                </div>
              </div>
            </div>

            <!-- Trends Tab -->
            <div v-if="activeTab === 'Trends'">
              <div class="mb-4">
                <p class="text-lg font-semibold mb-2">STL Decomposition Results</p>
                <p class="text-sm text-gray-600 mb-4">
                  The dataset has been decomposed into a Trend Component (long‐term movement)
                  and a Seasonal Component (recurring daily patterns). The Trend Component chart
                  shows the overall baseline, while the Seasonal Component chart displays the cyclic pattern.
                </p>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <!-- Trend Component Chart -->
                  <div class="bg-gray-50 p-4 rounded shadow">
                    <p class="text-sm font-semibold mb-2">Trend Component</p>
                    <div id="trendComponentChart" class="w-full h-48"></div>
                  </div>
                  <!-- Seasonal Component Chart -->
                  <div class="bg-gray-50 p-4 rounded shadow">
                    <p class="text-sm font-semibold mb-2">Seasonal Component</p>
                    <div id="seasonalComponentChart" class="w-full h-48"></div>
                  </div>
                </div>
                <!-- Detected Seasonal Patterns -->
                <div class="mt-4">
                  <p class="text-lg font-semibold mb-2">Detected Seasonal Patterns</p>
                  <div
                    v-for="(pattern, index) in stlResults.detectedSeasonalTrends"
                    :key="index"
                    class="mb-4 bg-gray-50 p-4 rounded shadow"
                  >
                    <div class="flex justify-between items-center mb-2">
                      <div>
                        <p class="text-sm font-semibold">{{ pattern.description }}</p>
                        <p class="text-xs text-gray-600">
                          From {{ formatTimestamp(pattern.startTimestamp) }} to
                          {{ formatTimestamp(pattern.endTimestamp) }}
                        </p>
                      </div>
                      <div>
                        <p class="text-sm font-semibold text-right">Avg. Change: {{ pattern.averageChange }}%</p>
                      </div>
                    </div>
                    <div :id="'seasonSparkline-' + index" class="w-full h-20 border border-dashed border-gray-300"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Alerts Tab -->
            <div v-if="activeTab === 'Alerts'">
              <div class="mb-4">
                <p class="text-lg font-semibold mb-2">Grouped Alerts (Isolation Forest)</p>
                <div class="max-h-72 overflow-y-auto">
                  <div
                    v-for="(group, idx) in groupedAlerts"
                    :key="idx"
                    class="bg-gray-50 p-4 rounded shadow mb-3"
                  >
                    <div class="flex justify-between items-center cursor-pointer" @click="toggleGroup(idx)">
                      <div>
                        <p class="text-sm font-semibold">
                          {{ formatTimestamp(group.startTimestamp) }} - {{ formatTimestamp(group.endTimestamp) }}
                        </p>
                        <p class="text-xs text-gray-600">({{ group.count }} events)</p>
                      </div>
                      <div class="text-right">
                        <p class="text-sm font-semibold">Avg. Dev: {{ group.averageDeviation.toFixed(2) }}%</p>
                        <p class="text-xs text-gray-600">Severity: {{ group.severity.toFixed(2) }}%</p>
                        <span v-if="expandedGroups.includes(idx)" class="text-blue-600 text-xl">–</span>
                        <span v-else class="text-blue-600 text-xl">+</span>
                      </div>
                    </div>
                    <div v-if="expandedGroups.includes(idx)" class="mt-2 border-t pt-2">
                      <table class="min-w-full border border-gray-200 text-xs">
                        <thead>
                          <tr class="bg-gray-100">
                            <th class="px-2 py-1 border">Timestamp</th>
                            <th class="px-2 py-1 border">Measurement</th>
                            <th class="px-2 py-1 border">Value</th>
                            <th class="px-2 py-1 border">Deviation</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="(event, i) in group.details" :key="i" class="border-t">
                            <td class="px-2 py-1 border">{{ formatTimestamp(event.timestamp) }}</td>
                            <td class="px-2 py-1 border">{{ event.measurement }}</td>
                            <td class="px-2 py-1 border">{{ event.value.toFixed(2) }}</td>
                            <td class="px-2 py-1 border">{{ event.deviation.toFixed(2) }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              <!-- Alerts Visualizations -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div id="alertBarChart" class="w-full h-60 bg-gray-50 p-4 rounded shadow"></div>
                <div id="alertPieChart" class="w-full h-60 bg-gray-50 p-4 rounded shadow"></div>
              </div>
            </div>

            <!-- Data Quality Tab -->
            <div v-if="activeTab === 'Data Quality'">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="bg-gray-50 p-4 rounded shadow flex flex-col items-center">
                  <p class="text-sm font-semibold">Completeness</p>
                  <p class="text-2xl font-bold">{{ qualityData.completeness }}%</p>
                </div>
                <div class="bg-gray-50 p-4 rounded shadow flex flex-col items-center">
                  <p class="text-sm font-semibold">Missing Values</p>
                  <p class="text-2xl font-bold">{{ qualityData.missingValues }}%</p>
                </div>
                <div class="bg-gray-50 p-4 rounded shadow flex flex-col items-center">
                  <p class="text-sm font-semibold">Error Rate</p>
                  <p class="text-2xl font-bold">{{ qualityData.errorRate }}%</p>
                </div>
              </div>
              <div class="mt-4 bg-gray-50 p-4 rounded shadow">
                <h4 class="text-sm font-semibold mb-2">Quality Trend</h4>
                <div id="qualityChart" class="w-full h-60"></div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex justify-end p-4 border-t">
            <button @click="closeModal" class="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">
              Close
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, computed } from "vue";
import * as echarts from "echarts";

// ----- Data Generation -----
// Generate a high-frequency dataset: 200 points at 30-second intervals.
const baseTime = new Date("2024-04-14T01:25:42Z").getTime();
const interval = 30000; // 30 seconds
const dataset = [];
for (let i = 0; i < 200; i++) {
  const timestamp = baseTime + i * interval;
  // Simulate a sine wave with noise around 13
  const value = 13 + 0.5 * Math.sin((2 * Math.PI * i) / 20) + (Math.random() - 0.5) * 0.2;
  dataset.push([timestamp, value]);
}

// ----- Overview Metrics -----
const overview = {
  performanceScore: 90, // Dummy value
  avgValue: dataset.reduce((sum, d) => sum + d[1], 0) / dataset.length,
  minValue: Math.min(...dataset.map(d => d[1])),
  maxValue: Math.max(...dataset.map(d => d[1])),
  minTimestamp: dataset[dataset.findIndex(d => d[1] === Math.min(...dataset.map(d => d[1])))]?.[0],
  maxTimestamp: dataset[dataset.findIndex(d => d[1] === Math.max(...dataset.map(d => d[1])))]?.[0],
  alertCount: 5, // Dummy value
  overallTrendValue: (((dataset[dataset.length - 1][1] - dataset[0][1]) / dataset[0][1]) * 100).toFixed(1),
  overallTrendDirection: (dataset[dataset.length - 1][1] - dataset[0][1]) >= 0 ? "up" : "down",
};

// ----- STL Decomposition -----
// Compute Trend Component using a moving average (window=10)
function computeTrend(data, window = 10) {
  const trend = [];
  for (let i = 0; i < data.length; i++) {
    let sum = 0, count = 0;
    for (let j = Math.max(0, i - window + 1); j <= i; j++) {
      sum += data[j][1];
      count++;
    }
    trend.push([data[i][0], Number((sum / count).toFixed(2))]);
  }
  return trend;
}
const stlTrendData = computeTrend(dataset);
// Seasonal Component: actual - trend
const stlSeasonalData = dataset.map((point, i) => [point[0], Number((point[1] - stlTrendData[i][1]).toFixed(2))]);

// Simulated detected seasonal patterns (dummy data)
const detectedSeasonalTrends = [
  {
    description: "Morning Dip",
    startTimestamp: "2024-04-14T07:00:00Z",
    endTimestamp: "2024-04-14T09:00:00Z",
    averageChange: -0.15,
    sparklineData: [
      ["2024-04-14T07:00:00Z", 48.0],
      ["2024-04-14T07:30:00Z", 47.8],
      ["2024-04-14T08:00:00Z", 47.7],
      ["2024-04-14T08:30:00Z", 47.9],
      ["2024-04-14T09:00:00Z", 48.0],
    ],
  },
  {
    description: "Afternoon Spike",
    startTimestamp: "2024-04-14T13:00:00Z",
    endTimestamp: "2024-04-14T15:00:00Z",
    averageChange: 0.25,
    sparklineData: [
      ["2024-04-14T13:00:00Z", 49.0],
      ["2024-04-14T13:30:00Z", 49.3],
      ["2024-04-14T14:00:00Z", 49.5],
      ["2024-04-14T14:30:00Z", 49.4],
      ["2024-04-14T15:00:00Z", 49.2],
    ],
  },
];
const stlResults = {
  trendComponentData: stlTrendData,
  seasonalComponentData: stlSeasonalData,
  detectedSeasonalTrends,
};

// ----- Simulated Alerts -----
// Define an alert as any point where |actual - trend| > 0.3
const alertsRaw = dataset.filter((point, i) => Math.abs(point[1] - stlTrendData[i][1]) > 0.3);
const alerts = alertsRaw.map((point, i) => {
  const deviation = point[1] - stlTrendData[i][1];
  return {
    timestamp: point[0],
    measurement: "Watts",
    value: point[1],
    deviation: deviation,
    severity: Math.min(100, Math.round(Math.abs(deviation) * 100)),
  };
});

// Group alerts by hour for display in the Alerts tab
const groupedAlerts = computed(() => {
  const groups = {};
  alerts.forEach(alert => {
    const hour = new Date(alert.timestamp).getHours();
    if (!groups[hour]) {
      groups[hour] = [];
    }
    groups[hour].push(alert);
  });
  return Object.entries(groups)
    .map(([hour, group]) => {
      group.sort((a, b) => a.timestamp - b.timestamp);
      const startTimestamp = group[0].timestamp;
      const endTimestamp = group[group.length - 1].timestamp;
      const count = group.length;
      const averageDeviation = group.reduce((sum, a) => sum + a.deviation, 0) / count;
      const severity = group.reduce((sum, a) => sum + a.severity, 0) / count;
      return { startTimestamp, endTimestamp, count, averageDeviation, severity, details: group };
    })
    .sort((a, b) => a.startTimestamp - b.startTimestamp);
});

// ----- Simulated Data Quality Metrics -----
const qualityData = ref({
  completeness: 98,
  missingValues: 4,
  errorRate: 1,
  qualityData: [
    { time: "2024-04-14", completeness: 98 },
    { time: "2024-04-15", completeness: 97 },
    { time: "2024-04-16", completeness: 99 },
  ],
});

// ----- Modal and Tab States -----
const isModalOpen = ref(false);
const loading = ref(false);
const triggerReady = ref(false);
const tabs = ["Overview", "Trends", "Alerts", "Data Quality"];
const activeTab = ref("Overview");
const expandedGroups = ref([]);

// ----- Helper Functions -----
function formatTimestamp(ts) {
  return new Date(ts).toLocaleString();
}

function openModal() {
  isModalOpen.value = true;
  fetchAnalysis();
}

function closeModal() {
  isModalOpen.value = false;
}

// Simulate an analysis fetch delay
async function fetchAnalysis() {
  loading.value = true;
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  } catch (err) {
    console.error("Error fetching analysis:", err);
  } finally {
    loading.value = false;
    nextTick(() => {
      initAllCharts();
    });
  }
}

// Switch tabs and reinitialize charts
function switchTab(tab) {
  activeTab.value = tab;
  nextTick(() => {
    initAllCharts();
  });
}

// Toggle alert group expansion
function toggleGroup(idx) {
  const index = expandedGroups.value.indexOf(idx);
  if (index > -1) {
    expandedGroups.value.splice(index, 1);
  } else {
    expandedGroups.value.push(idx);
  }
}

// ----- Chart Initialization Functions -----
function initOverviewSparkline() {
  const el = document.getElementById("overviewSparkline");
  if (el) {
    const chart = echarts.init(el);
    const sparkData = stlTrendData.slice(0, 50);
    const option = {
      tooltip: { trigger: "axis", formatter: "{b}: {c}" },
      xAxis: { type: "time", show: false },
      yAxis: { type: "value", show: false },
      grid: { left: 0, right: 0, top: 0, bottom: 0 },
      series: [{
        type: "line",
        data: sparkData,
        smooth: true,
        symbol: "none",
        lineStyle: { color: "#2196F3", width: 1 },
      }],
    };
    chart.setOption(option);
  }
}

function initAlertsSparkline() {
  const el = document.getElementById("alertsSparkline");
  if (el) {
    const chart = echarts.init(el);
    const sparkData = alerts.map(a => [a.timestamp, a.severity]);
    const option = {
      tooltip: { trigger: "axis", formatter: "{b}: {c}%" },
      xAxis: { type: "time", show: false },
      yAxis: { type: "value", show: false },
      grid: { left: 0, right: 0, top: 0, bottom: 0 },
      series: [{
        type: "line",
        data: sparkData,
        smooth: true,
        symbol: "none",
        lineStyle: { color: "#E91E63", width: 1 },
      }],
    };
    chart.setOption(option);
  }
}

function initTrendComponentChart() {
  const el = document.getElementById("trendComponentChart");
  if (el) {
    const chart = echarts.init(el);
    const option = {
      tooltip: { trigger: "axis", formatter: "{b}: {c}" },
      xAxis: { type: "time", name: "Time" },
      yAxis: { type: "value", name: "Watts" },
      series: [{
        type: "line",
        data: stlTrendData,
        smooth: true,
        lineStyle: { color: "#673AB7", width: 2 },
      }],
    };
    chart.setOption(option);
  }
}

function initSeasonalComponentChart() {
  const el = document.getElementById("seasonalComponentChart");
  if (el) {
    const chart = echarts.init(el);
    const categories = stlSeasonalData.map(d => new Date(d[0]).toLocaleTimeString());
    const values = stlSeasonalData.map(d => d[1]);
    const option = {
      tooltip: { trigger: "axis", formatter: "{b}: {c}" },
      xAxis: { type: "category", data: categories, name: "Time" },
      yAxis: { type: "value", name: "Seasonal" },
      series: [{
        type: "bar",
        data: values,
        itemStyle: { color: "#03A9F4" },
      }],
    };
    chart.setOption(option);
  }
}

function initSeasonSparklineCharts() {
  stlResults.detectedSeasonalTrends.forEach((pattern, idx) => {
    const el = document.getElementById("seasonSparkline-" + idx);
    if (el) {
      const chart = echarts.init(el);
      const data = pattern.sparklineData.map(item => [new Date(item[0]), item[1]]);
      const option = {
        tooltip: {
          trigger: "axis",
          formatter: params => {
            const d = params[0];
            return new Date(d.value[0]).toLocaleTimeString() + ": " + d.value[1];
          }
        },
        xAxis: { type: "time", show: false },
        yAxis: { type: "value", show: false },
        grid: { left: 0, right: 0, top: 0, bottom: 0 },
        series: [{
          type: "line",
          data: data,
          smooth: true,
          symbol: "none",
          lineStyle: { color: "#03A9F4", width: 2 },
          areaStyle: { opacity: 0.2, color: "#03A9F4" }
        }]
      };
      chart.setOption(option);
    }
  });
}

function initAlertBarChart() {
  const el = document.getElementById("alertBarChart");
  if (el) {
    const chart = echarts.init(el);
    const groups = {};
    alerts.forEach(alert => {
      const hour = new Date(alert.timestamp).getHours();
      groups[hour] = (groups[hour] || 0) + 1;
    });
    const hours = Object.keys(groups).sort((a, b) => a - b);
    const counts = hours.map(h => groups[h]);
    const option = {
      tooltip: { trigger: "axis" },
      xAxis: { type: "category", data: hours, name: "Hour" },
      yAxis: { type: "value", name: "Alert Count" },
      series: [{
        type: "bar",
        data: counts,
        itemStyle: { color: "#4CAF50" },
        label: { show: true, position: "top" },
      }],
    };
    chart.setOption(option);
  }
}

function initAlertPieChart() {
  const el = document.getElementById("alertPieChart");
  if (el) {
    const chart = echarts.init(el);
    const totalDataPoints = dataset.length;
    const totalAnomalies = alerts.length;
    const normalCount = totalDataPoints - totalAnomalies;
    const option = {
      tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
      legend: { orient: "vertical", left: "left" },
      series: [{
        name: "Data Points",
        type: "pie",
        radius: "50%",
        data: [
          { value: normalCount, name: "Normal" },
          { value: totalAnomalies, name: "Anomaly" }
        ],
        emphasis: {
          itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: "rgba(0,0,0,0.5)" }
        }
      }]
    };
    chart.setOption(option);
  }
}

function initQualityChart() {
  const el = document.getElementById("qualityChart");
  if (el) {
    const chart = echarts.init(el);
    const times = qualityData.value.qualityData.map(d => d.time);
    const completeness = qualityData.value.qualityData.map(d => d.completeness);
    const option = {
      tooltip: { trigger: "axis" },
      xAxis: { type: "category", data: times },
      yAxis: { type: "value", max: 100 },
      series: [{
        name: "Completeness",
        type: "bar",
        data: completeness,
        itemStyle: { color: "#FF9800" },
        label: { show: true, position: "top" }
      }]
    };
    chart.setOption(option);
  }
}

function initAllCharts() {
  if (activeTab.value === "Overview") {
    initOverviewSparkline();
    initAlertsSparkline();
  }
  if (activeTab.value === "Trends") {
    initTrendComponentChart();
    initSeasonalComponentChart();
    initSeasonSparklineCharts();
  }
  if (activeTab.value === "Alerts") {
    initAlertBarChart();
    initAlertPieChart();
  }
  if (activeTab.value === "Data Quality") {
    initQualityChart();
  }
}

onMounted(() => {
  setTimeout(() => {
    triggerReady.value = true;
  }, 2000);
  if (isModalOpen.value) {
    initAllCharts();
  }
});
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

/* Spinner styling for the trigger square */
.spinner {
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  width: 2rem;
  height: 2rem;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
