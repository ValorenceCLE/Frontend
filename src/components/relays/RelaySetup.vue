<template>
  <div class="flex items-center justify-center w-full h-full">
    <!-- Table Container -->
    <div class="w-full mx-auto" style="max-width: 45rem">
      <div
        class="bg-gray-200 p-2 rounded-lg shadow-md border border-gray-500 max-w-md flex justify-center items-center mx-auto"
      >
        <h1 class="text-Header text-textColor">Relay Setup</h1>
      </div>
      <div
        v-if="Object.keys(relays).length > 0"
        class="bg-gray-200 overflow-hidden rounded-md my-3 border-gray-500 border relative"
      >
        <table class="text-left w-full border-collapse rounded-md">
          <thead>
            <tr class="bg-gray-200 border-b border-gray-500">
              <th class="text-left py-3 px-4 text-textColor text-Subheader">Name</th>
              <th class="text-center py-3 px-4 text-textColor text-Subheader">
                Relay Number
              </th>
              <th class="text-center py-3 px-4 text-textColor text-Subheader">Enabled</th>
              <th class="text-center py-3 px-4 text-textColor text-Subheader">
                Settings
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(relay, key) in relays"
              :key="key"
              class="hover:bg-gray-100 border-t border-gray-300"
            >
              <td class="py-2 px-4 text-textColor text-Body">{{ relay.name }}</td>
              <td class="text-center py-2 px-4 text-textColor text-Body">
                {{ relay.relay_number }}
              </td>
              <td class="text-center py-2 px-4 text-textColor text-FormButton capitalize">
                {{ relay.enabled }}
              </td>
              <td class="text-center py-2 px-4 text-Body">
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

    <!-- Modal -->
    <Modal
      :show="showModal"
      :title="`Relay ${currentRelay.relay_number || ''} Settings`"
      @close="closeModal"
    >
      <!-- Modal Content -->
      <div class="text-textColor">
        <label class="flex justify-between items-center mb-4">
          <span class="text-textColor text-Body">Relay Name:</span>
          <input
            type="text"
            v-model="currentRelay.name"
            class="ml-2 w-7/12 text-Form border-gray-300 rounded-md shadow-sm"
          />
        </label>
        <label class="flex justify-between items-center mb-4">
          <span class="text-textColor text-Body">Enabled:</span>
          <select
            v-model="currentRelay.enabled"
            class="ml-2 w-7/12 border-gray-400 text-textColor text-Form rounded-md shadow-sm"
          >
            <option value="true" class="text-textColor">True</option>
            <option value="false" class="text-textColor">False</option>
          </select>
        </label>
        <label class="flex justify-between items-center mb-4">
          <span class="text-textColor text-Body">Power Up State:</span>
          <select
            v-model="currentRelay.boot_state"
            class="ml-2 w-7/12 border-gray-400 rounded-md shadow-sm text-textColor text-Form"
          >
            <option value="on" class="text-textColor">On</option>
            <option value="off" class="text-textColor">Off</option>
            <option value="previous" class="text-textColor">Last State</option>
          </select>
        </label>
        <label class="flex justify-between items-center mb-4">
          <span class="text-textColor text-Body">Pulse Time (Seconds):</span>
          <input
            type="number"
            v-model="currentRelay.pulse_time"
            class="ml-2 w-7/12 border-gray-400 rounded-md shadow-sm text-textColor text-Form"
          />
        </label>
        <label class="flex justify-between items-center mb-4">
          <span class="text-textColor text-Body">On Status Text:</span>
          <input
            type="text"
            v-model="currentRelay.on_status_text"
            class="ml-2 w-7/12 border-gray-400 rounded-md shadow-sm text-textColor text-Form"
          />
        </label>
        <label class="flex justify-between items-center mb-4">
          <span class="text-textColor text-Body">Off Status Text:</span>
          <input
            type="text"
            v-model="currentRelay.off_status_text"
            class="ml-2 w-7/12 border-gray-400 rounded-md shadow-sm text-textColor text-Form"
          />
        </label>
        <div class="flex justify-center mt-6">
          <button
            class="bg-primaryMed hover:bg-primaryLight text-white text-FormButton py-2 px-4 rounded"
            @click="saveChanges"
          >
            Save Changes
          </button>
          <button
            class="bg-grayDark hover:bg-gray-700 text-white text-FormButton py-2 px-4 rounded ml-2"
            @click="closeModal"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>

    <!-- Toast Notification -->
    <ToastNotification v-if="showToast" :visible="showToast" :message="toastMessage" />
  </div>
</template>

<script>
import Modal from "@/components/etc/Modal.vue";
import ToastNotification from "@/components/etc/ToastNotification.vue";
import DummyAPI from "@/api/dummyApi";

export default {
  name: "RelaySetup",
  components: { Modal, ToastNotification },
  data() {
    return {
      relays: {}, // Data fetched from DummyAPI
      showModal: false,
      currentRelay: {},
      currentRelayKey: null,
      showToast: false, // For showing success messages
      toastMessage: "", // Dynamic toast message
    };
  },
  methods: {
    fetchRelays() {
      try {
        const response = DummyAPI.get("/api/relaySetup");
        if (response.success) {
          this.relays = response.data; // Ensure relays data is assigned properly
        } else {
          console.error("Failed to fetch relays:", response.error);
        }
      } catch (error) {
        console.error("Error fetching relays:", error);
      }
    },
    openModal(relayKey) {
      this.currentRelayKey = relayKey;
      this.currentRelay = { ...this.relays[relayKey] }; // Clone relay data
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
      this.currentRelay = {};
    },
    saveChanges() {
      if (this.currentRelayKey) {
        this.relays[this.currentRelayKey] = { ...this.currentRelay };

        DummyAPI.post("/api/relaySetup", this.relays);

        // Show success message
        this.toastMessage = "Changes Applied.";
        this.showToast = true;
        setTimeout(() => {
          this.showToast = false;
        }, 1500); // Hide after 1 seconds
      }
      this.closeModal();
    },
  },
  mounted() {
    this.fetchRelays();
  },
};
</script>
