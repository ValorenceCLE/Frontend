<template>
  <div class="flex items-center justify-center w-full h-full">
    <!-- Table Container -->
    <div class="w-full mx-auto" style="max-width: 45rem">
      <div
        class="w-full max-w-xl p-3 bg-gray-200 border border-gray-500 rounded-md text-center flex flex-col items-center mx-auto"
      >
        <h1 class="text-3xl font-bold text-textColor">Relay Configuration</h1>
        <p class="text-gray-600">Manage your relay configurations here.</p>
        <!-- New Dashboard Settings Button -->
        <button
          class="bg-secondary hover:bg-secondary-light text-white py-1 px-3 rounded mt-2"
          @click="openDashboardModal"
        >
          Dashboard Settings
        </button>
      </div>
      <div
        v-if="Object.keys(relays).length > 0"
        class="bg-gray-200 rounded-md my-3 border-gray-500 border relative"
      >
        <table class="text-left w-full border-collapse rounded-md overflow-hidden">
          <thead>
            <tr class="bg-gray-200 border-b border-gray-500">
              <th class="text-left py-3 px-4 text-textColor text-Subheader">
                Name
              </th>
              <th class="text-center py-3 px-4 text-textColor text-Subheader">
                Relay Number
              </th>
              <th class="text-center py-3 px-4 text-textColor text-Subheader">
                Enabled
                <InfoTooltip text="Enabled relays will be monitored and collect data" />
              </th>
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
              <td class="text-center py-2 px-4 text-textColor">
                <img
                  v-if="relay.enabled"
                  src="@/assets/icons/check-square.svg"
                  alt="Active"
                  class="w-6 h-6 mx-auto"
                />
                <img
                  v-else
                  src="@/assets/icons/x-square.svg"
                  alt="Inactive"
                  class="w-6 h-6 mx-auto"
                />
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

    <!-- Settings Modal for Relay Configuration -->
    <SettingsModal
      :show="showModal"
      :relay="currentRelay"
      :relayKey="currentRelayKey"
      @close="closeModal"
      @update-relay="handleRelayUpdate"
      @updated="handleUpdated"
    />

    <!-- Dashboard Modal for Testing -->
    <DashboardModal
      :show="showDashboardModal"
      :dashboard="dashboardConfig"
      @close="closeDashboardModal"
      @update-dashboard="handleDashboardUpdate"
      @updated="handleDashboardUpdated"
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
import SettingsModal from "@/components/relays/SettingsModal.vue";
import DashboardModal from "@/components/relays/DashboardModal.vue";
import ToastNotification from "@/components/etc/ToastNotification.vue";
import DummyAPI from "@/api/dummyApi";
import InfoTooltip from "@/components/etc/InfoTooltip.vue";

export default {
  name: "RelaySetup",
  components: {
    SettingsModal,
    DashboardModal,
    ToastNotification,
    InfoTooltip,
  },
  data() {
    return {
      relays: {}, // Data fetched from DummyAPI
      showModal: false,
      currentRelay: {},
      currentRelayKey: null,
      // For testing DashboardModal independently.
      showDashboardModal: false,
      dashboardConfig: {
        on_button: {
          show: false,
          status_text: "On",
          status_color: "green",
          button_label: "On",
        },
        off_button: {
          show: false,
          status_text: "Off",
          status_color: "red",
          button_label: "Off",
        },
        pulse_button: {
          show: true,
          status_text: "Restarting...",
          button_label: "Restart",
        },
      },
      showToast: false,
      toastMessage: "",
    };
  },
  methods: {
    fetchRelays() {
      try {
        const response = DummyAPI.get("/api/relaySetup");
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
      // Clone the relay data for editing.
      this.currentRelay = { ...this.relays[relayKey] };
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
      this.currentRelay = {};
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
    // Methods for DashboardModal
    openDashboardModal() {
      this.showDashboardModal = true;
    },
    closeDashboardModal() {
      this.showDashboardModal = false;
    },
    handleDashboardUpdate(updatedDashboard) {
      this.dashboardConfig = { ...updatedDashboard };
    },
    handleDashboardUpdated() {
      console.log("Dashboard settings updated");
    },
  },
  mounted() {
    this.fetchRelays();
  },
};
</script>

<style scoped>
/* Custom styling or Tailwind overrides if needed */
</style>
