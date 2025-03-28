<template>
  <div class="flex flex-col items-center justify-center w-full h-full mx-auto max-w-4xl">
    <!-- Header Section -->
    <div class="w-full max-w-xl p-2 bg-gray-100 border border-gray-500 rounded-md shadow-md">
      <h1 class="text-Header text-textColor text-center py-1">Live Monitoring</h1>

      <!-- Sub-header row -->
      <div class="flex flex-wrap items-center justify-center space-x-2 mt-2 text-textColor text-Form">
        <!-- Source Selector -->
        <div class="relative">
          <label class="font-bold mr-2">Source:</label>
          <select
            v-model="selectedSource"
            class="border border-gray-500 rounded p-1 text-textColor text-Form"
            :disabled="isRunning"
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
            :disabled="!selectedSource || isRunning"
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

        <!-- Run / Pause / Cancel Buttons -->
        <div class="flex items-center space-x-1">
          <!-- If NOT running, show Run button -->
          <button
            v-if="!isRunning"
            class="bg-textColor text-white px-2 py-1 rounded hover:bg-blue-600 flex items-center"
            @click="handleRun"
            :disabled="!canRun"
          >
            <img src="@/assets/icons/play.svg" alt="Play" class="w-6 h-6" />
          </button>

          <!-- If running, show Pause/Resume + Cancel buttons -->
          <template v-else>
            <button
              class="bg-textColor text-white px-2 py-1 rounded hover:bg-yellow-600 flex items-center"
              @click="togglePause"
            >
              <img
                v-if="isPaused"
                src="@/assets/icons/play.svg"
                alt="Resume"
                class="w-6 h-6"
              />
              <img
                v-else
                src="@/assets/icons/pause.svg"
                alt="Pause"
                class="w-6 h-6"
              />
            </button>

            <button
              class="bg-textColor text-white px-2 py-1 rounded hover:bg-red-500 flex items-center"
              @click="handleStop"
            >
              <img src="@/assets/icons/x.svg" alt="Stop" class="w-6 h-6" />
            </button>
          </template>
        </div>
      </div>
    </div>

    <!-- Chart Container -->
    <div class="w-full h-3/5 mt-3 bg-gray-100 rounded-md shadow-md border border-gray-500">
      <RealTimeChart
        :source="selectedSource"
        :fields="selectedFields"
        :isRunning="isRunning"
        :isPaused="isPaused"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import { storeToRefs } from "pinia";
import { useConfigStore } from "@/store/config";
import RealTimeChart from "./RealTimeChart.vue";

// Access the config store and destructure the reactive configData property.
const configStore = useConfigStore();
const { configData } = storeToRefs(configStore);

// Local state for source selection, field selections and control flags.
const selectedSource = ref("");
const selectedFields = ref([]);
const isRunning = ref(false);
const isPaused = ref(false);
const fieldsDropdownOpen = ref(false);
const fieldsDropdownContainer = ref(null);

// Define static sources. Note the key for environmental is now lowercase.
const staticSources = [
  { key: "main", label: "Main", fields: ["Volts", "Watts", "Amps"] },
  { key: "environmental", label: "Environment", fields: ["Temperature", "Humidity"] },
];

// Compute dynamic relay sources from configData.
// Each relay uses its id as key, its name as label and has fixed fields.
const relaySources = computed(() => {
  return (configData.value?.relays || [])
    .filter((relay) => relay.enabled)
    .map((relay) => ({
      key: relay.id,
      label: relay.name,
      fields: ["Volts", "Watts", "Amps"]
    }));
});

// Compute available fields based on the selected source.
// Check both static and relay sources.
const availableFields = computed(() => {
  const staticMatch = staticSources.find(source => source.key === selectedSource.value);
  if (staticMatch) return staticMatch.fields;
  const relayMatch = relaySources.value.find(source => source.key === selectedSource.value);
  return relayMatch ? relayMatch.fields : [];
});

// Determine if the Run button should be enabled.
const canRun = computed(() => {
  return selectedSource.value !== "" && selectedFields.value.length > 0;
});

// Generate the button label for the fields dropdown.
const fieldsButtonLabel = computed(() => {
  const count = selectedFields.value.length;
  if (count === 0) return "Select Fields";
  if (count === 1) return selectedFields.value[0];
  if (count === 2) return selectedFields.value.join(", ");
  return `${selectedFields.value[0]}, ${selectedFields.value[1]}, +${count - 2} more`;
});

// When the selected source changes (and if not running), reset selected fields.
watch(
  () => selectedSource.value,
  () => {
    if (!isRunning.value) {
      selectedFields.value = [];
      fieldsDropdownOpen.value = false;
    }
  }
);

// Toggle the fields dropdown visibility.
function toggleFieldsDropdown() {
  if (!selectedSource.value) return;
  fieldsDropdownOpen.value = !fieldsDropdownOpen.value;
}

// Start monitoring if conditions are met.
function handleRun() {
  if (canRun.value) {
    isRunning.value = true;
    isPaused.value = false;
    fieldsDropdownOpen.value = false;
  }
}

// Toggle pause/resume state.
function togglePause() {
  isPaused.value = !isPaused.value;
}

// Stop monitoring and reset selections.
function handleStop() {
  isRunning.value = false;
  isPaused.value = false;
  selectedSource.value = "";
  selectedFields.value = [];
  fieldsDropdownOpen.value = false;
}

// Close the fields dropdown if a click occurs outside of it.
function onClickOutside(e) {
  if (!fieldsDropdownOpen.value) return;
  if (!fieldsDropdownContainer.value) return;
  if (fieldsDropdownContainer.value.contains(e.target)) return;
  fieldsDropdownOpen.value = false;
}

onMounted(() => {
  document.addEventListener("click", onClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", onClickOutside);
});
</script>

<style scoped>
.select-button {
  min-width: 8rem;
  justify-content: space-between;
}
img {
  filter: brightness(0) invert(1);
}
</style>
