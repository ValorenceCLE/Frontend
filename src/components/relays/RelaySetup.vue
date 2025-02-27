<template>
  <div class="flex items-center justify-center w-full h-full">
    <div class="w-full mx-auto max-w-3xl">
      <div class="w-full mx-auto py-2 bg-gray-200 border border-gray-500 rounded text-center flex flex-col items-center" style="max-width: 32rem">
        <h1 class="text-ModalHeader text-textColor">Relay Configuration</h1>
        <p class="text-gray-600">Manage your relay configurations here.</p>
      </div>

      <div v-if="Object.keys(relays).length > 0" class="bg-gray-200 rounded my-3 border-gray-500 border relative">
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
                  @click="openModal(key)"
                >
                  Edit
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="text-center py-4">Loading relays...</div>
    </div>

    <!-- Edit Modal -->
    <EditModal
      :show="showEditModal"
      :relay="currentRelay"
      :relayKey="currentRelayKey"
      @close="closeModal"
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
import { ref, computed } from "vue";
import { useConfigStore } from "@/store/config";
import EditModal from "@/components/relays/EditModal.vue";
import ToastNotification from "@/components/etc/ToastNotification.vue";

// Global configuration store
const configStore = useConfigStore();

// Instead of manually fetching via an API, we rely on configStore.configData.relays.
const relays = computed(() => {
  return configStore.configData && configStore.configData.relays
    ? configStore.configData.relays
    : {};
});

// Local state for controlling the edit modal and toast notifications.
const showEditModal = ref(false);
const currentRelay = ref({});
const currentRelayKey = ref("");
const showToast = ref(false);
const toastMessage = ref("");

// Open the edit modal for a specific relay key.
const openModal = (relayKey) => {
  currentRelayKey.value = relayKey;
  // Make a shallow copy; if deep copy is needed, use JSON.parse(JSON.stringify(...))
  currentRelay.value = { ...relays.value[relayKey] };

  // Ensure dashboard object is present with defaults if missing.
  if (!currentRelay.value.dashboard) {
    currentRelay.value.dashboard = {
      on_button: { show: false, status_text: "", status_color: "green", button_label: "" },
      off_button: { show: false, status_text: "", status_color: "red", button_label: "" },
      pulse_button: { show: false, status_text: "", status_color: "yellow", button_label: "" },
    };
  }
  // Ensure state has a default
  if (!currentRelay.value.state) {
    currentRelay.value.state = "off";
  }
  showEditModal.value = true;
};

// Close the edit modal.
const closeModal = () => {
  showEditModal.value = false;
  currentRelay.value = {};
  currentRelayKey.value = "";
};

// Handle relay updates coming from the EditModal.
// The EditModal emits an event with { relayKey, updatedRelay }.
const handleRelayUpdate = ({ relayKey, updatedRelay }) => {
  // Merge the updated relay into the local relays object.
  // In a full application you might update the store directly.
  // Here we emit the update event so that the parent (or store) can handle it.
  // For demonstration, we'll update configStore.configData.relays locally:
  if (configStore.configData && configStore.configData.relays) {
    configStore.configData.relays[relayKey] = { ...updatedRelay };
  }
};

// Show a toast notification when update is successful.
const handleUpdated = () => {
  toastMessage.value = "Changes Applied.";
  showToast.value = true;
  setTimeout(() => {
    showToast.value = false;
  }, 1500);
};

// Optionally, if your config store doesn't fetch relays automatically,
// you can call configStore.fetchConfig() here.
// onMounted(() => {
//   if (!configStore.configData) {
//     configStore.fetchConfig();
//   }
// });
</script>

<script>
export default {
  name: "RelaySetup",
  components: {
    EditModal,
    ToastNotification,
  },
};
</script>

<style scoped>
/* No changes to styling; preserve current layout and UI/UX */
</style>
