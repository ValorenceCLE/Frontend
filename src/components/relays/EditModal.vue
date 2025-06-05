<!-- src/components/relays/EditModal.vue -->
<template>
  <transition name="fade">
    <div v-if="modelValue" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50"
      @click.self="$emit('update:modelValue', false)">
      <div class="w-full max-w-2xl mx-auto">
        <!-- Browser-style Tab Navigation -->
        <div class="flex w-full max-w-2xl mx-auto border-b border-gray-500 bg-transparent rounded-t space-x-1">
          <button @click="switchPage('settings')" :class="[
            'px-3 py-0.5 font-semibold border border-b-0 focus:outline-none',
            'rounded-t',
            currentPage === 'settings'
              ? 'bg-white text-blue-600 border-gray-500 z-10'
              : 'bg-white text-gray-500 border-gray-500 hover:text-blue-600 z-0'
          ]" style="margin-bottom: -1px;">
            Settings
          </button>
          <button @click="switchPage('dashboard')" :class="[
            'px-3 py-0.5 font-semibold border border-b-0 focus:outline-none',
            'rounded-t',
            currentPage === 'dashboard'
              ? 'bg-white text-blue-600 border-gray-500 z-10'
              : 'bg-gray-100 text-gray-500 border-gray-300 hover:text-blue-600 z-0'
          ]" style="margin-bottom: -1px;">
            Dashboard
          </button>
        </div>
        <!-- Modal -->
        <div class="bg-white rounded-b rounded-tr shadow-md border border-gray-500 border-t-0">
          <!-- HEADER -->
          <div class="border-b border-gray-500 px-3 py-1.5">
            <!-- Top Row: ID/Name | Close -->
            <div class="flex justify-between items-start w-full">
              <!-- Left: Relay ID and Name -->
              <div class="flex flex-col items-start min-w-0">
                <span class="text-center text-MiniModalHeader text-textColor truncate">{{ formattedRelayId }}</span>
                <span class="text-center text-MiniModalSubheader text-textColor italic truncate">{{ relay.name ||
                  'Relay'
                  }}</span>
              </div>
              <div>
                <h2 class="text-center text-ModalHeader italic text-textColor">
                  {{ currentPageTitle }}
                </h2>
                <p class="text-center text-ModalSubheader text-textColor italic pt-1">
                  {{ currentPageSubheader }}
                </p>
              </div>
              <!-- Right: Close Icon -->
              <div class="flex items-start">
                <img :src="xIcon" alt="Close" class="w-6 h-6 cursor-pointer hover:scale-105 transition-transform"
                  @click="$emit('update:modelValue', false)" />
              </div>

            </div>
            <!-- Centered Page Title and Subheader -->

          </div>

          <!-- MAIN CONTENT -->
          <div>
            <!-- Settings Page -->
            <SettingsModal v-if="currentPage === 'settings'" :relay="relay" :relayKey="relayKey"
              @fields-updated="handleRelayFields" />
            <!-- Dashboard Page -->
            <DashboardModal v-else-if="currentPage === 'dashboard'" ref="dashboardRef" :dashboard="relay.dashboard"
              :relayName="relay.name" :relayState="relay.state" @dashboard-updated="handleDashboardFields" />
          </div>

          <!-- FOOTER -->
          <div class="border-t border-gray-500">
            <div class="flex justify-center space-x-1 text-ModalButton p-1">
              <button
                class="bg-primaryMed hover:bg-primaryLight text-white rounded-md px-3 py-1.5 w-auto flex items-center justify-center"
                @click="saveChanges">
                <span style="transform: translateY(-1px)">Save & Exit</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import SettingsModal from "./SettingsModal.vue";
import DashboardModal from "./DashboardModal.vue";
import xIcon from "@/assets/icons/x.svg";
import chevronLeft from "@/assets/icons/chevron-left.svg";
import chevronRight from "@/assets/icons/chevron-right.svg";

// Props for the component
const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  relay: {
    type: Object,
    required: true,
  },
  relayKey: {
    type: [String, Number],
    required: true,
  },
});

// Define emits
const emit = defineEmits(['update:modelValue', 'update-relay', 'updated']);

// Track which page of the modal is active
const currentPage = ref("settings"); // "settings" or "dashboard"

// This local object (editedRelay) is used to hold all changes from the child
const editedRelay = ref({ ...props.relay });

// Add a ref for DashboardModal
const dashboardRef = ref(null);

// Computed properties for titles
const currentPageTitle = computed(() => {
  return currentPage.value === "settings" ? "Relay Setup" : "Dashboard Setup";
});

const currentPageSubheader = computed(() => {
  return currentPage.value === "settings"
    ? "Modify the behavior of the relay in the system"
    : "Modify the appearance of the relay on the dashboard";
});

// Add a computed property for formatted relay id
const formattedRelayId = computed(() => {
  // Example: relay_1 -> Relay 1
  if (!props.relay?.id) return '';
  const match = props.relay.id.match(/^([a-zA-Z]+)_(\d+)$/);
  if (match) {
    // Capitalize first letter and add space before number
    return match[1].charAt(0).toUpperCase() + match[1].slice(1) + ' ' + match[2];
  }
  // Fallback: just capitalize first letter
  return props.relay.id.charAt(0).toUpperCase() + props.relay.id.slice(1);
});

// Watch for changes in relay prop
watch(() => props.relay, (newRelay) => {
  // Create a deep copy to avoid mutation issues
  editedRelay.value = JSON.parse(JSON.stringify(newRelay));
}, { immediate: true });

// Navigation methods
const switchPage = (page) => {
  currentPage.value = page;
};

const prevPage = () => {
  if (currentPage.value === "dashboard") {
    currentPage.value = "settings";
  }
};

const nextPage = () => {
  if (currentPage.value === "settings") {
    currentPage.value = "dashboard";
  }
};

// Called when the child emits 'fields-updated'
const handleRelayFields = (updatedFields) => {
  // If there's a `schedule` key in updatedFields, merge it carefully
  if (updatedFields.schedule) {
    editedRelay.value.schedule = {
      // keep existing schedule fields
      ...editedRelay.value.schedule,
      // override with what's new
      ...updatedFields.schedule
    };
  }

  // Merge all other top-level fields (excluding schedule)
  Object.keys(updatedFields).forEach(key => {
    if (key !== "schedule") {
      editedRelay.value[key] = updatedFields[key];
    }
  });
};

// Called when the DashboardModal emits 'dashboard-updated'
const handleDashboardFields = (updatedObj) => {
  // We expect updatedObj might be { dashboard: {}, state: 'on' }
  if (updatedObj.dashboard) {
    editedRelay.value.dashboard = { ...updatedObj.dashboard };
  }
  if (updatedObj.state) {
    editedRelay.value.state = updatedObj.state;
  }
};

// Save changes and close modal
const saveChanges = () => {
  // If dashboardRef is set, get the latest dashboard data
  if (dashboardRef.value && dashboardRef.value.getDashboardData) {
    editedRelay.value.dashboard = dashboardRef.value.getDashboardData();
  }
  const updatedRelay = { ...editedRelay.value };
  emit("update-relay", { relayKey: props.relayKey, updatedRelay });
  emit("updated");
  emit('update:modelValue', false);
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>