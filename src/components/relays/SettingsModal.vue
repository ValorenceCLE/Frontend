<template>
  <transition name="fade">
    <div
      v-if="show"
      class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50"
      @click.self="closeModal"
    >
      <div
        class="bg-white rounded-lg shadow-lg w-1/3 relative border-gray-600 border"
        @click.stop
      >
        <!-- Modal Header -->
        <div class="flex items-center justify-between p-4 border-b border-gray-600">
          <h2 class="text-textColor text-center flex-1 text-FormHeader font-bold">
            {{ modalTitle }}
          </h2>
          <button
            class="text-gray-800 font-extrabold text-xl hover:text-gray-900"
            @click="closeModal"
          >
            ✕
          </button>
        </div>
        <!-- Modal Content -->
        <div class="p-6 text-textColor">
          <label class="flex justify-between items-center mb-4">
            <span class="text-textColor text-Body">Relay Name:</span>
            <input
              type="text"
              v-model="editedRelay.name"
              class="ml-2 w-7/12 text-Form border-gray-300 rounded-md shadow-sm"
            />
          </label>
          <label class="flex justify-between items-center mb-4">
            <span class="text-textColor text-Body">Enabled:</span>
            <select
              v-model="editedRelay.enabled"
              class="ml-2 w-7/12 border-gray-400 text-textColor text-Form rounded-md shadow-sm"
            >
              <option :value="true" class="text-textColor">True</option>
              <option :value="false" class="text-textColor">False</option>
            </select>
          </label>
          <label class="flex justify-between items-center mb-4">
            <span class="text-textColor text-Body">Power Up State:</span>
            <select
              v-model="editedRelay.boot_state"
              class="ml-2 w-7/12 border-gray-400 rounded-md shadow-sm text-textColor text-Form"
            >
              <option value="on" class="text-textColor">On</option>
              <option value="off" class="text-textColor">Off</option>
            </select>
          </label>
          <label class="flex justify-between items-center mb-4">
            <span class="text-textColor text-Body">Pulse Time (Seconds):</span>
            <input
              type="number"
              v-model="editedRelay.pulse_time"
              class="ml-2 w-7/12 border-gray-400 rounded-md shadow-sm text-textColor text-Form"
            />
          </label>
          <label class="flex justify-between items-center mb-4">
            <span class="text-textColor text-Body">On Status Text:</span>
            <input
              type="text"
              v-model="editedRelay.on_status_text"
              class="ml-2 w-7/12 border-gray-400 rounded-md shadow-sm text-textColor text-Form"
            />
          </label>
          <label class="flex justify-between items-center mb-4">
            <span class="text-textColor text-Body">Off Status Text:</span>
            <input
              type="text"
              v-model="editedRelay.off_status_text"
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
      </div>
    </div>
  </transition>
</template>

<script>
import DummyAPI from "@/api/dummyApi";

export default {
  name: "SettingsModal",
  props: {
    show: {
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
  },
  data() {
    return {
      // Create a local copy for editing so we don't modify the prop directly.
      editedRelay: {},
    };
  },
  computed: {
    modalTitle() {
      return `Relay ${this.editedRelay.relay_number || ""} Settings`;
    },
  },
  watch: {
    // Whenever the passed-in relay changes, update the local copy.
    relay: {
      immediate: true,
      handler(newRelay) {
        this.editedRelay = { ...newRelay };
      },
    },
  },
  methods: {
    closeModal() {
      this.$emit("close");
    },
    async saveChanges() {
      // Emit the updated relay to the parent so it can update its state.
      this.$emit("update-relay", {
        relayKey: this.relayKey,
        updatedRelay: { ...this.editedRelay },
      });
      // Call the API to persist changes.
      try {
        await DummyAPI.post("/api/relaySetup", {
          relayKey: this.relayKey,
          relay: this.editedRelay,
        });
      } catch (error) {
        console.error("Error saving changes:", error);
      }
      // Notify the parent that saving is complete (e.g. for showing a toast).
      this.$emit("updated");
      this.closeModal();
    },
  },
};
</script>

<style scoped>
/* Modal fade animation */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
