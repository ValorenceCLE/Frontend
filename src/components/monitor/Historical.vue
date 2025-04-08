<template>
  <div class="flex flex-col items-center justify-center w-full h-full mx-auto max-w-4xl">
    <!-- Header Section -->
    <div class="w-full max-w-xl p-2 bg-gray-100 border border-gray-500 rounded-md shadow-md">
      <h1 class="text-Header text-textColor text-center py-1">Historical Graph</h1>

      <!-- Sub-header row -->
      <div class="flex flex-wrap items-center justify-center space-x-2 mt-2 text-textColor text-Form">
        <!-- Source Selector -->
        <div class="relative">
          <label class="font-bold mr-2">Source:</label>
          <select
            v-model="selectedSource"
            class="border border-gray-500 rounded p-1 text-textColor text-Form"
          >
            <option disabled value="">Select Source</option>
            <!-- Static Sources -->
            <option
              v-for="source in staticSources"
              :key="source.key"
              :value="source.key"
            >
              {{ source.label }}
            </option>
            <!-- Dynamic Relay Sources under a divider -->
            <optgroup label="Relays">
              <option
                v-for="source in relaySources"
                :key="source.key"
                :value="source.key"
              >
                {{ source.label }}
              </option>
            </optgroup>
          </select>
        </div>

        <!-- Fields Dropdown -->
        <div ref="fieldsDropdownContainer" class="relative">
          <label class="font-bold mr-2">Fields:</label>
          <button
            class="inline-flex items-center border border-gray-500 rounded bg-white px-2 py-1 relative select-button"
            @click="toggleFieldsDropdown"
            :disabled="!selectedSource"
          >
            <span class="mr-2" v-if="selectedFields.length === 0">Select Fields</span>
            <span class="mr-2" v-else>{{ fieldsButtonLabel }}</span>

            <!-- Down Arrow -->
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <!-- Dropdown list of checkboxes -->
          <div
            v-if="fieldsDropdownOpen"
            class="absolute left-1/4 mt-1 w-3/4 bg-white border border-gray-500 rounded shadow-md p-1 z-10"
          >
            <div
              v-for="field in availableFields"
              :key="field"
              class="flex items-center space-x-2 mb-1"
            >
              <input
                type="checkbox"
                :value="field"
                v-model="selectedFields"
                class="w-4 h-4"
              />
              <label>{{ field }}</label>
            </div>
          </div>
        </div>
      </div>

      <!-- Time Range Controls -->
      <div class="flex items-center justify-center mt-2">
        <div class="flex items-center">
          <label class="font-bold text-sm mr-1">Start:</label>
          <input
            type="datetime-local"
            v-model="startDate"
            class="border border-gray-500 rounded p-0.5 text-sm w-3/4"
          />
        </div>
        <div class="flex items-center">
          <label class="font-bold text-sm mr-1">End:</label>
          <input
            type="datetime-local"
            v-model="endDate"
            class="border border-gray-500 rounded p-0.5 text-sm w-3/4"
          />
        </div>
      </div>

      <!-- New Buttons Row -->
      <div class="flex items-center justify-center space-x-2 mt-2 w-full text-Body">
        <button
          @click="handleGraph"
          :disabled="!canGraph"
          class="bg-textColor hover:bg-blue-600 text-white py-0.5 rounded text-center border border-gray-400 w-24"
        >
          Graph
        </button>
        <button
          @click="handleReset"
          class="bg-textColor hover:bg-red-700 text-white py-0.5 rounded text-center border border-gray-400 w-24"
        >
          Reset
        </button>
        <button
          @click="handleExport"
          :disabled="!hasData"
          class="bg-textColor hover:bg-yellow-600 text-white py-0.5 rounded text-center border border-gray-400 w-24"
        >
          Export
        </button>
      </div>
    </div>

    <!-- Chart Container -->
    <div class="w-full h-3/5 mt-3 bg-gray-100 rounded-md shadow-md border border-gray-500">
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
  startDate.value = '';
  endDate.value = '';
  fieldsDropdownOpen.value = false;
  shouldFetch.value = false;
  shouldReset.value = true;
  hasData.value = false;
}

// Handle data export
function handleExport() {
  if (chartRef.value && hasData.value) {
    chartRef.value.exportData();
  }
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

// Close the fields dropdown if a click occurs outside of it
function onClickOutside(e) {
  if (!fieldsDropdownOpen.value) return;
  if (!fieldsDropdownContainer.value) return;
  if (fieldsDropdownContainer.value.contains(e.target)) return;
  fieldsDropdownOpen.value = false;
}

// Set default date range when component is mounted
onMounted(() => {
  document.addEventListener("click", onClickOutside);
  
  // Set default date range (last 24 hours)
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - 1);
  
  endDate.value = formatDateForInput(end);
  startDate.value = formatDateForInput(start);
});

// Helper to format dates for datetime-local input
function formatDateForInput(date) {
  return date.toISOString().slice(0, 16);
}

onBeforeUnmount(() => {
  document.removeEventListener("click", onClickOutside);
});
</script>

<style scoped>
.select-button {
  min-width: 8rem;
  justify-content: space-between;
}
</style>