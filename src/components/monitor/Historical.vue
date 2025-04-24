<template>
  <div class="flex flex-col items-center justify-center w-full h-full mx-auto max-w-4xl">
    <!-- Header Section - Redesigned for better layout -->
    <div class="w-full max-w-2xl p-3 bg-gray-100 border border-gray-500 rounded-md shadow-md">
      <h1 class="text-Header text-textColor text-center py-1 mb-2">Historical Data</h1>

      <!-- Two-column layout for controls -->
      <div class="grid grid-cols-2 gap-3">
        <!-- Left column: Source and Fields -->
        <div class="space-y-2">
          <!-- Source Selector -->
          <div class="flex items-center">
            <label class="font-bold text-sm w-14">Source:</label>
            <select
              v-model="selectedSource"
              class="border border-gray-500 rounded p-1 text-sm flex-grow"
            >
              <option disabled value="">Select Source</option>
              <option v-for="source in staticSources" :key="source.key" :value="source.key">
                {{ source.label }}
              </option>
              <optgroup label="Relays">
                <option v-for="source in relaySources" :key="source.key" :value="source.key">
                  {{ source.label }}
                </option>
              </optgroup>
            </select>
          </div>

          <!-- Fields Dropdown -->
          <div class="flex items-center">
            <label class="font-bold text-sm w-14">Fields:</label>
            <div ref="fieldsDropdownContainer" class="relative flex-grow">
              <button
                class="inline-flex items-center border border-gray-500 rounded bg-white px-2 py-1 w-full justify-between"
                @click="toggleFieldsDropdown"
                :disabled="!selectedSource"
              >
                <span class="truncate" v-if="selectedFields.length === 0">Select Fields</span>
                <span class="truncate" v-else>{{ fieldsButtonLabel }}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4 text-gray-600 flex-shrink-0 ml-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <!-- Fields dropdown positioned better -->
              <div
                v-if="fieldsDropdownOpen"
                class="absolute mt-1 bg-white border border-gray-500 rounded shadow-md p-1 z-10 w-full"
              >
                <div
                  v-for="field in availableFields"
                  :key="field"
                  class="flex items-center space-x-2 mb-1 py-1 px-2 hover:bg-gray-100 cursor-pointer"
                  @click="toggleField(field)"
                >
                  <input
                    type="checkbox"
                    :value="field"
                    v-model="selectedFields"
                    class="w-4 h-4"
                    @click.stop
                  />
                  <label>{{ field }}</label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right column: Date Range -->
        <div class="space-y-2">
          <!-- Start Date -->
          <div class="flex items-center">
            <label class="font-bold text-sm w-14">Start:</label>
            <input
              type="datetime-local"
              v-model="startDate"
              class="border border-gray-500 rounded p-1 text-sm flex-grow"
            />
          </div>

          <!-- End Date -->
          <div class="flex items-center">
            <label class="font-bold text-sm w-14">End:</label>
            <input
              type="datetime-local"
              v-model="endDate"
              class="border border-gray-500 rounded p-1 text-sm flex-grow"
            />
          </div>
        </div>
      </div>

      <!-- Action Button Row - centered with data points info -->
      <div class="flex flex-col items-center mt-3">
        <div class="flex space-x-3">
          <button
            @click="handleGraph"
            :disabled="!canGraph"
            class="bg-textColor hover:bg-blue-600 text-white py-1 px-4 rounded text-sm font-medium border border-gray-400 w-24"
            :class="{'opacity-50': !canGraph || shouldFetch}"
          >
            <span v-if="shouldFetch" class="mr-1">●</span>
            {{ shouldFetch ? 'Loading...' : 'Graph' }}
          </button>
          <button
            @click="handleReset"
            class="bg-textColor hover:bg-red-700 text-white py-1 px-4 rounded text-sm font-medium border border-gray-400 w-24"
          >
            Reset
          </button>
          <button
            @click="handleExport"
            :disabled="!hasData"
            class="bg-textColor hover:bg-yellow-600 text-white py-1 px-4 rounded text-sm font-medium border border-gray-400 w-24"
            :class="{'opacity-50': !hasData}"
          >
            Export
          </button>
        </div>
        
        <!-- Status information -->
        <div v-if="dataPointCount > 0" class="text-xs text-gray-500 mt-2">
          {{ dataPointCount.toLocaleString() }} data points
        </div>
      </div>
    </div>

    <!-- Chart Container -->
    <div class="w-full h-3/5 mt-4 bg-gray-100 rounded-md shadow-md border border-gray-500">
      <HistoricalChart
        ref="chartRef"
        class="w-full h-full"
        :source="selectedSource"
        :field="selectedField"
        :fields="selectedFields"
        :startDate="startDate"
        :endDate="endDate"
        :shouldFetch="shouldFetch"
        :shouldReset="shouldReset"
        @fetched="handleFetched"
        @resetComplete="handleResetComplete"
        @dataPointCount="updateDataPointCount"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { storeToRefs } from "pinia";
import { useConfigStore } from "@/store/config";
import HistoricalChart from './HistoricalChart.vue';

// Access the config store
const configStore = useConfigStore();
const { configData } = storeToRefs(configStore);

// Local state
const selectedSource = ref('');
const selectedFields = ref([]);
const startDate = ref('');
const endDate = ref('');
const fieldsDropdownOpen = ref(false);
const fieldsDropdownContainer = ref(null);
const shouldFetch = ref(false);
const shouldReset = ref(false);
const hasData = ref(false);
const chartRef = ref(null);
const dataPointCount = ref(0);
const dataInterval = ref('');

// Define static sources
const staticSources = [
  { key: "main", label: "Main", fields: ["Volts", "Watts", "Amps"] },
  { key: "environmental", label: "Environment", fields: ["Temperature", "Humidity"] },
];

// Compute dynamic relay sources from configData
const relaySources = computed(() => {
  return (configData.value?.relays || [])
    .filter((relay) => relay.enabled)
    .map((relay) => ({
      key: relay.id,
      label: relay.name,
      fields: ["Volts", "Watts", "Amps"]
    }));
});

// Compute available fields based on the selected source
const availableFields = computed(() => {
  const staticMatch = staticSources.find(source => source.key === selectedSource.value);
  if (staticMatch) return staticMatch.fields;
  const relayMatch = relaySources.value.find(source => source.key === selectedSource.value);
  return relayMatch ? relayMatch.fields : [];
});

// Format for the fields button label
const fieldsButtonLabel = computed(() => {
  const count = selectedFields.value.length;
  if (count === 0) return "Select Fields";
  if (count === 1) return selectedFields.value[0];
  if (count === 2) return selectedFields.value.join(", ");
  return `${selectedFields.value[0]}, ${selectedFields.value[1]}, +${count - 2} more`;
});

// Determine if the Graph button should be enabled
const canGraph = computed(() => {
  return selectedSource.value !== "" && selectedFields.value.length > 0 && startDate.value && endDate.value;
});

// For backward compatibility - selected field is the first one in the array
const selectedField = computed(() => {
  return selectedFields.value.length > 0 ? selectedFields.value[0] : '';
});

// When the selected source changes, reset selected fields
watch(
  () => selectedSource.value,
  () => {
    selectedFields.value = [];
    fieldsDropdownOpen.value = false;
  }
);

// Toggle the fields dropdown
function toggleFieldsDropdown() {
  if (!selectedSource.value) return;
  fieldsDropdownOpen.value = !fieldsDropdownOpen.value;
}

// Toggle a specific field selection
function toggleField(field) {
  const index = selectedFields.value.indexOf(field);
  if (index === -1) {
    selectedFields.value.push(field);
  } else {
    selectedFields.value.splice(index, 1);
  }
}

// Handle graph button click - this will trigger data fetching in the child component
function handleGraph() {
  if (canGraph.value) {
    shouldReset.value = false;
    shouldFetch.value = true;
  }
}

// Reset all selections and clear the graph
function handleReset() {
  selectedSource.value = '';
  selectedFields.value = [];
  
  // Set default date range (last 24 hours)
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - 1);
  
  endDate.value = formatDateForInput(end);
  startDate.value = formatDateForInput(start);
  
  fieldsDropdownOpen.value = false;
  shouldFetch.value = false;
  shouldReset.value = true;
  hasData.value = false;
  dataPointCount.value = 0;
  dataInterval.value = '';
}

// Handle data export
function handleExport() {
  if (chartRef.value && hasData.value) {
    chartRef.value.exportData();
  }
}

// Update data information from child component
function updateDataPointCount(data) {
  dataPointCount.value = data.pointCount;
  dataInterval.value = data.interval;
}

// Called after data is fetched in the child component
function handleFetched() {
  shouldFetch.value = false;
  hasData.value = true;
}

// Called after chart is reset
function handleResetComplete() {
  shouldReset.value = false;
}

// Format interval for display - shorter version
function formatIntervalShort(interval) {
  if (!interval) return '';
  return interval;
}

// Close the fields dropdown if a click occurs outside of it
function onClickOutside(e) {
  if (!fieldsDropdownOpen.value) return;
  if (!fieldsDropdownContainer.value) return;
  if (fieldsDropdownContainer.value.contains(e.target)) return;
  fieldsDropdownOpen.value = false;
}

// Helper to format dates for datetime-local input
function formatDateForInput(date) {
  return date.toISOString().slice(0, 16);
}

// Set up event listeners and default date range
onMounted(() => {
  document.addEventListener("click", onClickOutside);
  
  // Set default date range (last 24 hours)
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - 1);
  
  endDate.value = formatDateForInput(end);
  startDate.value = formatDateForInput(start);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", onClickOutside);
});
</script>

<style scoped>
@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}

button:focus, select:focus, input:focus {
  outline: none;
}

button span {
  animation: pulse 1.5s infinite;
}
</style>