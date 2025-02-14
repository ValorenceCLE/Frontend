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
                {{ (relay.id || key).replace('relay', '') }}
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

<script>
import { getRelays } from "@/api/getApi.js";
import InfoTooltip from "@/components/etc/InfoTooltip.vue";
import ToastNotification from "@/components/etc/ToastNotification.vue";
import EditModal from "@/components/relays/EditModal.vue";

export default {
  name: "RelaySetup",
  components: {
    InfoTooltip,
    ToastNotification,
    EditModal,
  },
  data() {
    return {
      relays: {},
      showEditModal: false,
      currentRelay: {},
      currentRelayKey: "",
      showToast: false,
      toastMessage: "",
    };
  },
  methods: {
    async fetchRelays() {
      try {
        const response = await getRelays();
        if (response.success) {
          this.relays = response.data;
        } else {
          console.error("Failed to fetch relays:", response.error);
        }
      } catch (error) {
        console.error("Error fetching relays:", error);
      }
    },
    openModal(relayKey) {
      this.currentRelayKey = relayKey;
      // Make a copy of the chosen relay
      this.currentRelay = { ...this.relays[relayKey] };

      // If no dashboard object, set defaults
      if (!this.currentRelay.dashboard) {
        this.currentRelay.dashboard = {
          on_button: { show: false, status_text: "", status_color: "green", button_label: "" },
          off_button: { show: false, status_text: "", status_color: "red", button_label: "" },
          pulse_button: { show: false, status_text: "", status_color: "yellow", button_label: "" },
        };
      }
      // If no state, default to "off" or "on"
      if (!this.currentRelay.state) {
        this.currentRelay.state = "off";
      }

      this.showEditModal = true;
    },
    closeModal() {
      this.showEditModal = false;
      this.currentRelay = {};
      this.currentRelayKey = "";
    },
    handleRelayUpdate({ relayKey, updatedRelay }) {
      this.$set(this.relays, relayKey, { ...updatedRelay });
    },
    handleUpdated() {
      this.toastMessage = "Changes Applied.";
      this.showToast = true;
      setTimeout(() => {
        this.showToast = false;
      }, 1500);
    },
  },
  mounted() {
    this.fetchRelays();
  },
};
</script>

<style scoped></style>
