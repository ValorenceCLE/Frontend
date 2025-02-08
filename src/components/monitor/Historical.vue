<template>
  <div class="flex flex-col items-center justify-center w-full h-full mx-auto max-w-5xl space-y-3">
    <!-- Header Section -->
    <div class="w-full max-w-xl p-2 bg-gray-100 border border-gray-500 rounded-md shadow-md">
      <h1 class="text-Header text-textColor text-center py-1">Historical Graph</h1>
      <!-- Custom Nested Dropdown for Source Selection (Label & Button Inline) -->
      <div class="relative flex items-center justify-center mt-2" ref="dropdownRef">
        <label class="text-Form text-textColor mr-2">Source:</label>
        <button
          @click="toggleDropdown"
          class="bg-gray-200 border border-gray-500 rounded p-0.5 w-4/12"
        >
          {{ selectedSourceField ? selectedSourceField : 'Select Source' }}
        </button>
        <!-- Primary Dropdown: Opens below the input section -->
        <div
          v-if="open"
          class="absolute top-full mt-1 rounded-md shadow-lg bg-white ring-1 ring-textColor ring-opacity-2 z-10"
        >
          <div>
            <div
              v-for="(fields, source) in sourceFieldMap"
              :key="source"
              class="relative"
              @mouseenter="openNested = source"
              @mouseleave="openNested = null"
            >
              <!-- Source Category Button -->
              <button
                class="w-auto text-left m-2 py-0.5 text-md text-textColor flex justify-between items-center overflow-hidden"
              >
                {{ source }}
                <svg
                  class="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
              <!-- Nested Dropdown for Fields: Opens to the right of the main dropdown -->
              <div
                v-if="openNested === source"
                class="absolute top-0 left-full ml-1 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20 border border-gray-500 overflow-hidden"
              >
                <div>
                  <button
                    v-for="field in fields"
                    :key="field"
                    class="w-auto text-left px-2 py-1 text-md text-textColor hover:bg-gray-100 whitespace-nowrap"
                    @click="selectSource(source, field)"
                  >
                    {{ field }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- New Time Frame Row -->
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
          class="bg-textColor hover:bg-yellow-600 text-white py-0.5 rounded text-center border border-gray-400 w-24"
        >
          Export
        </button>
      </div>
    </div>

    <!-- Chart Container -->
    <div class="w-full h-3/5 mt-2 bg-gray-100 border border-gray-500 rounded-md shadow-md">
      <HistoricalChart
        class="w-full h-full"
        :source="selectedSource"
        :field="selectedField"
        :startDate="startDate"
        :endDate="endDate"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import HistoricalChart from './HistoricalChart.vue';

// Map of source categories to their fields.
const sourceFieldMap = {
  Environmental: ['Temperature', 'Humidity'],
  Network: ['Packet Loss', 'Latency'],
  Cellular: ['RSRP', 'RSRQ', 'SINR'],
  'Main Power': ['Volts', 'Watts', 'Amps'],
};

// Combined selection for source and field.
const selectedSourceField = ref('');
// Control for the primary dropdown and nested menus.
const open = ref(false);
const openNested = ref(null);
const dropdownRef = ref(null);

// Toggle the primary dropdown.
function toggleDropdown() {
  open.value = !open.value;
}

// When a field is selected, store the combined value and close the menus.
function selectSource(source, field) {
  selectedSourceField.value = `${source} - ${field}`;
  open.value = false;
  openNested.value = null;
}

// Close dropdown if clicking outside.
function handleClickOutside(event) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    open.value = false;
    openNested.value = null;
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});

// Computed properties to split the combined selection.
const selectedSource = computed(() => {
  if (!selectedSourceField.value) return '';
  return selectedSourceField.value.split(' - ')[0] || '';
});
const selectedField = computed(() => {
  if (!selectedSourceField.value) return '';
  return selectedSourceField.value.split(' - ')[1] || '';
});

// Time frame state.
const startDate = ref('');
const endDate = ref('');
const canGraph = computed(() => selectedSourceField.value && startDate.value && endDate.value);

// Graph functions.
function handleGraph() {
  console.log('Graphing Custom Range:', selectedSource.value, selectedField.value, startDate.value, endDate.value);
  // Add your logic here to update or retrieve data.
}

function handleReset() {
  selectedSourceField.value = '';
  startDate.value = '';
  endDate.value = '';
  // Optionally, close any open dropdowns.
  open.value = false;
  openNested.value = null;
  console.log('Reset');
}

function handleExport() {
  console.log('Exporting data for:', selectedSource.value, selectedField.value, startDate.value, endDate.value);
}

function handleGraphLast24() {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  function formatDatetime(date) {
    const pad = (n) => (n < 10 ? '0' + n : n);
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }
  startDate.value = formatDatetime(yesterday);
  endDate.value = formatDatetime(now);
  console.log('Graphing Last 24 Hours:', selectedSource.value, selectedField.value, startDate.value, endDate.value);
  // Optionally, call handleGraph() after setting the dates.
}
</script>

<style scoped>
/* Additional styling can be added here if needed */
</style>
