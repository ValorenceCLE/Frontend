<!-- src/components/relays/RelaySetup.vue -->
<template>
  <div class="flex items-center justify-center w-full h-full">
    <div class="w-full mx-auto max-w-3xl">
      <div class="w-full mx-auto py-2 bg-gray-200 border border-gray-500 rounded text-center flex flex-col items-center" style="max-width: 32rem">
        <h1 class="text-ModalHeader text-textColor">Relay Configuration</h1>
        <p class="text-gray-600">Manage your relay configurations here.</p>
      </div>

      <div v-if="isLoading" class="flex items-center justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primaryMed"></div>
        <span class="ml-2 text-gray-600">Loading relays...</span>
      </div>

      <div v-else-if="relays && Object.keys(relays).length > 0" class="bg-gray-200 rounded my-3 border-gray-500 border relative">
        <table class="text-left w-full border-collapse rounded-md overflow-hidden">
          <thead>
            <tr class="bg-gray-200 border-b border-gray-500">
              <th class="text-center py-1.5 px-3 text-textColor text-Subheader">ID</th>
              <th class="text-center py-1.5 px-3 text-textColor text-Subheader">Name</th>
              <th class="text-center py-1.5 px-3 text-textColor text-Subheader">Enabled</th>
              <th class="text-center py-1.5 px-3 text-textColor text-Subheader">Settings</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(relay, key) in relays"
              :key="key"
              class="hover:bg-gray-100 border-t border-gray-300"
            >
              <td class="text-center py-1.5 px-3 text-textColor text-Body">
                {{ (relay.id || key).replace('relay_', '') }}
              </td>
              <td class="py-1.5 px-3 text-textColor text-center text-Body">{{ relay.name }}</td>
              <td class="text-center py-1.5 px-3">
                <div
                  class="w-4 h-4 rounded-full mx-auto"
                  :class="{'bg-green-500': relay.enabled, 'bg-red-500': !relay.enabled}"
                ></div>
              </td>
              <td class="text-center py-1.5 px-3 text-Body">
                <button
                  class="bg-primaryMed hover:bg-primaryLight text-white py-1 px-3 rounded"
                  @click="openEditModal(key)"
                >
                  Edit
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="text-center py-4">No relays available. Please check your configuration.</div>

      <!-- Success/Error Messages -->
      <div v-if="successMessage" class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 my-3">
        {{ successMessage }}
      </div>
      
      <div v-if="error" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 my-3">
        {{ error }}
      </div>
    </div>

    <!-- Edit Modal -->
    <EditModal
      v-model="showEditModal"
      :relay="currentRelay"
      :relayKey="currentRelayKey"
      @update-relay="handleRelayUpdate"
      @updated="handleUpdated"
    />

    <!-- Toast Notification -->
    <ToastNotification
      v-if="showToast"
      :visible="showToast"
      :message="toastMessage"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useConfig } from '@/composables/useConfig';
import EditModal from "@/components/relays/EditModal.vue";
import ToastNotification from "@/components/etc/ToastNotification.vue";

// Use the config composable for the full configuration
const { 
  configData, 
  isLoading, 
  error, 
  successMessage,
  updateConfig 
} = useConfig(null, { autoFetch: true });

// Computed property to get relays from the config data
const relays = computed(() => {
  return configData.value?.relays || {};
});

// Local state for the current relay being edited
const currentRelay = ref({});
const currentRelayKey = ref("");
const showEditModal = ref(false);
const showToast = ref(false);
const toastMessage = ref("");

// Open the edit modal for a relay
const openEditModal = (relayKey) => {
  currentRelayKey.value = relayKey;
  // Make a deep copy to avoid reference issues
  currentRelay.value = JSON.parse(JSON.stringify(relays.value[relayKey]));

  // Ensure dashboard object is present with defaults if missing.
  if (!currentRelay.value.dashboard) {
    currentRelay.value.dashboard = {
      on_button: { show: false, status_text: "", status_color: "green", button_label: "" },
      off_button: { show: false, status_text: "", status_color: "red", button_label: "" },
      pulse_button: { show: false, status_text: "", status_color: "yellow", button_label: "" },
    };
  }
  showEditModal.value = true;
};

// Handle relay updates coming from the EditModal
const handleRelayUpdate = async ({ relayKey, updatedRelay }) => {
  try {
    // Create a copy of the current configuration
    const updatedConfig = { ...configData.value };
    
    // Update the specific relay
    updatedConfig.relays[relayKey] = updatedRelay;
    
    // Update the full configuration
    await updateConfig(updatedConfig);
    
    // Show success toast
    toastMessage.value = "Changes Applied.";
    showToast.value = true;
    setTimeout(() => {
      showToast.value = false;
    }, 1500);
  } catch (error) {
    console.error("Error updating relay:", error);
    toastMessage.value = "Error applying changes.";
    showToast.value = true;
    setTimeout(() => {
      showToast.value = false;
    }, 1500);
  }
};

// Handle modal close
const handleUpdated = () => {
  showEditModal.value = false;
};
</script>