<template>
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
          Dashboard Settings
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
        <!-- On Button Section -->
        <div class="border border-gray-300 rounded-md p-3 mb-4">
          <div
            class="flex items-center justify-between cursor-pointer"
            @click="toggleExpansion('on_button')"
          >
            <span class="text-Body font-bold">On Button</span>
            <div class="flex space-x-1">
              <button
                @click.stop="setEnabled('on_button', true)"
                :class="getToggleButtonClass('on_button', true)"
              >
                Show
              </button>
              <button
                @click.stop="setEnabled('on_button', false)"
                :class="getToggleButtonClass('on_button', false)"
              >
                Hide
              </button>
            </div>
          </div>
          <div
            v-if="activeSection === 'on_button' && editedDashboard.on_button.show"
            class="mt-2"
          >
            <label class="flex justify-between items-center mb-2">
              <span class="text-Body">Status Text:</span>
              <input
                type="text"
                v-model="editedDashboard.on_button.status_text"
                class="ml-2 w-7/12 text-Form border-gray-300 rounded-md shadow-sm"
              />
            </label>
            <label class="flex justify-between items-center mb-2">
              <span class="text-Body">Status Color:</span>
              <input
                type="text"
                v-model="editedDashboard.on_button.status_color"
                class="ml-2 w-7/12 text-Form border-gray-300 rounded-md shadow-sm"
              />
            </label>
            <label class="flex justify-between items-center">
              <span class="text-Body">Button Label:</span>
              <input
                type="text"
                v-model="editedDashboard.on_button.button_label"
                class="ml-2 w-7/12 text-Form border-gray-300 rounded-md shadow-sm"
              />
            </label>
          </div>
        </div>

        <!-- Off Button Section -->
        <div class="border border-gray-300 rounded-md p-3 mb-4">
          <div
            class="flex items-center justify-between cursor-pointer"
            @click="toggleExpansion('off_button')"
          >
            <span class="text-Body font-bold">Off Button</span>
            <div class="flex space-x-1">
              <button
                @click.stop="setEnabled('off_button', true)"
                :class="getToggleButtonClass('off_button', true)"
              >
                Show
              </button>
              <button
                @click.stop="setEnabled('off_button', false)"
                :class="getToggleButtonClass('off_button', false)"
              >
                Hide
              </button>
            </div>
          </div>
          <div
            v-if="activeSection === 'off_button' && editedDashboard.off_button.show"
            class="mt-2"
          >
            <label class="flex justify-between items-center mb-2">
              <span class="text-Body">Status Text:</span>
              <input
                type="text"
                v-model="editedDashboard.off_button.status_text"
                class="ml-2 w-7/12 text-Form border-gray-300 rounded-md shadow-sm"
              />
            </label>
            <label class="flex justify-between items-center mb-2">
              <span class="text-Body">Status Color:</span>
              <input
                type="text"
                v-model="editedDashboard.off_button.status_color"
                class="ml-2 w-7/12 text-Form border-gray-300 rounded-md shadow-sm"
              />
            </label>
            <label class="flex justify-between items-center">
              <span class="text-Body">Button Label:</span>
              <input
                type="text"
                v-model="editedDashboard.off_button.button_label"
                class="ml-2 w-7/12 text-Form border-gray-300 rounded-md shadow-sm"
              />
            </label>
          </div>
        </div>

        <!-- Pulse Button Section -->
        <div class="border border-gray-300 rounded-md p-3 mb-4">
          <div
            class="flex items-center justify-between cursor-pointer"
            @click="toggleExpansion('pulse_button')"
          >
            <span class="text-Body font-bold">Pulse Button</span>
            <div class="flex space-x-1">
              <button
                @click.stop="setEnabled('pulse_button', true)"
                :class="getToggleButtonClass('pulse_button', true)"
              >
                Show
              </button>
              <button
                @click.stop="setEnabled('pulse_button', false)"
                :class="getToggleButtonClass('pulse_button', false)"
              >
                Hide
              </button>
            </div>
          </div>
          <div
            v-if="activeSection === 'pulse_button' && editedDashboard.pulse_button.show"
            class="mt-2"
          >
            <label class="flex justify-between items-center mb-2">
              <span class="text-Body">Status Text:</span>
              <input
                type="text"
                v-model="editedDashboard.pulse_button.status_text"
                class="ml-2 w-7/12 text-Form border-gray-300 rounded-md shadow-sm"
              />
            </label>
            <label class="flex justify-between items-center">
              <span class="text-Body">Button Label:</span>
              <input
                type="text"
                v-model="editedDashboard.pulse_button.button_label"
                class="ml-2 w-7/12 text-Form border-gray-300 rounded-md shadow-sm"
              />
            </label>
          </div>
        </div>

        <!-- Preview Button -->
        <div class="flex justify-center mt-6">
          <button class="bg-primaryMed hover:bg-primaryLight text-white text-FormButton py-2 px-4 rounded">
            Preview
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "DashboardModal",
  props: {
    show: {
      type: Boolean,
      required: true,
    },
    dashboard: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      // Deep copy for local editing (avoid mutating the prop directly)
      editedDashboard: {},
      // Tracks which section is currently expanded (if any)
      activeSection: null,
    };
  },
  watch: {
    dashboard: {
      immediate: true,
      handler(newVal) {
        // Deep clone the dashboard object
        this.editedDashboard = JSON.parse(JSON.stringify(newVal));
      },
    },
  },
  methods: {
    closeModal() {
      this.$emit("close");
    },
    setEnabled(sectionKey, value) {
      this.editedDashboard[sectionKey].show = value;
      // If disabling a section that is currently expanded, collapse it.
      if (!value && this.activeSection === sectionKey) {
        this.activeSection = null;
      }
    },
    toggleExpansion(sectionKey) {
      // Only allow expansion if the section is enabled.
      if (!this.editedDashboard[sectionKey].show) return;
      this.activeSection = this.activeSection === sectionKey ? null : sectionKey;
    },
    getToggleButtonClass(sectionKey, buttonValue) {
      const isActive = this.editedDashboard[sectionKey].show === buttonValue;
      return (
        "flex-1 py-1 px-2 text-sm font-medium rounded " +
        (isActive
          ? "bg-blue-500 text-white"
          : "bg-white text-blue-500 border border-blue-500")
      );
    },
  },
};
</script>

<style scoped>
/* You can adjust additional styles as needed */
</style>
