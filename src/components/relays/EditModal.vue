<!-- src/components/relays/EditModal.vue -->
<template>
  <transition name="fade">
    <div
      v-if="modelValue"
      class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50"
      @click.self="$emit('update:modelValue', false)"
    >
      <div
        class="bg-white rounded shadow-md w-full max-w-2xl relative border border-gray-500"
        @click.stop
      >
        <!-- HEADER -->
        <div class="border-b border-gray-500 relative py-1.5 px-3">
          <!-- Close Icon -->
          <img
            :src="xIcon"
            alt="Close"
            class="w-6 h-6 cursor-pointer hover:scale-105 transition-transform absolute top-1 right-1"
            @click="$emit('update:modelValue', false)"
          />

          <!-- Page Title -->
          <h2 class="text-center text-ModalHeader italic text-textColor">
            {{ currentPageTitle }}
          </h2>
          <p class="text-ModalInfo text-textColor italic transition-transform absolute top-2 left-3">
            {{ relay.name || 'Relay' }}
          </p>

          <!-- Subheader -->
          <p class="text-center text-ModalSubheader text-textColor italic pt-1">
            {{ currentPageSubheader }}
          </p>
        </div>

        <!-- MAIN CONTENT -->
        <div>
          <!-- Settings Page -->
          <SettingsModal
            v-if="currentPage === 'settings'"
            :relay="relay"
            :relayKey="relayKey"
            @fields-updated="handleRelayFields"
          />
          <!-- Dashboard Page -->
          <DashboardModal
            v-else-if="currentPage === 'dashboard'"
            :dashboard="relay.dashboard"
            :relayName="relay.name"
            :relayState="relay.state" 
            @dashboard-updated="handleDashboardFields"
          />
        </div>

        <!-- FOOTER -->
        <div class="border-t border-gray-500">
          <div class="flex items-center justify-center -space-x-1">
            <img
              :src="chevronLeft"
              alt="Previous Page"
              class="w-5 h-5 cursor-pointer hover:scale-110 transition-transform"
              @click="prevPage"
            />
            <div class="flex items-center space-x-0.5">
              <span
                class="text-2xl cursor-pointer transition-colors leading-none"
                :class="currentPage === 'settings' ? 'text-textColor' : 'text-gray-400 hover:text-gray-600'"
                @click="switchPage('settings')"
              >
                •
              </span>
              <span
                class="text-2xl cursor-pointer transition-colors leading-none"
                :class="currentPage === 'dashboard' ? 'text-textColor' : 'text-gray-400 hover:text-gray-600'"
                @click="switchPage('dashboard')"
              >
                •
              </span>
            </div>
            <img
              :src="chevronRight"
              alt="Next Page"
              class="w-5 h-5 cursor-pointer hover:scale-110 transition-transform "
              @click="nextPage"
            />
          </div>
          <div class="flex justify-center space-x-1 text-ModalButton p-1">
            <button
              class="bg-primaryMed hover:bg-primaryLight text-white rounded-md px-2 py-0.5 w-auto flex items-center justify-center"
              @click="saveChanges"
            >
              <span style="transform: translateY(-1px)">Save & Exit</span>
            </button>
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

// Computed properties for titles
const currentPageTitle = computed(() => {
  return currentPage.value === "settings" ? "Relay Setup" : "Dashboard Setup";
});

const currentPageSubheader = computed(() => {
  return currentPage.value === "settings"
    ? "Modify the behavior of the relay in the system"
    : "Modify the appearance of the relay on the dashboard";
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
  // This is when you finalize everything, sending the updated relay back up
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