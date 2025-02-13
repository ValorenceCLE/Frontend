<template>
  <!-- Main container for the whole content (allows future additions) -->
  <div class="px-3 py-1">
    <!-- Card container for the dashboard settings -->
    <div class="bg-gray-100 border border-gray-500 rounded">
      
      <!-- Header: Button Selector Row (separate from the main options container) -->
      <div class="border-b border-gray-500 p-1 px-2 flex justify-between items-center">
        <label class="text-ModalInfo text-textColor">Select Button:</label>
        <select
          v-model="selectedButton"
          class="w-1/4 border border-gray-500 rounded text-sm"
        >
          <option value="" disabled>Select Button</option>
          <option value="on_button">ON</option>
          <option value="off_button">OFF</option>
          <option value="pulse_button">Pulse</option>
        </select>
      </div>

      <!-- Main Options Container (encapsulates all option rows) -->
      <div class="p-1">
        <!-- Row 1: Visibility (Show/Hide) -->
        <div class="mb-1">
          <div class="grid grid-cols-2 gap-2 items-center">
            <div class="flex items-center justify-start">
              <label class="text-ModalLabel text-textColor">Visibility:</label>
            </div>
            <div class="flex items-center justify-end">
              <div class="inline-flex rounded overflow-hidden border border-blue-500">
                <button
                  @click="setEnabled(true)"
                  :class="getPillButtonClass(currentSettings?.show, true)"
                  :disabled="!selectedButton"
                >
                  Show
                </button>
                <button
                  @click="setEnabled(false)"
                  :class="getPillButtonClass(currentSettings?.show, false)"
                  :disabled="!selectedButton"
                >
                  Hide
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Row 2: Status Text -->
        <div class="mb-1 ">
          <div class="grid grid-cols-2 gap-2 items-center">
            <div class="flex items-center justify-start">
              <label class="text-ModalLabel text-textColor">Status Text:</label>
            </div>
            <div>
              <input
                type="text"
                v-model="currentSettings.status_text"
                :disabled="!selectedButton"
                class="w-full border border-gray-500 rounded p-0.5 text-xs bg-white"
                @input="emitChanges"
              />
            </div>
          </div>
        </div>

        <!-- Row 3: Status Color -->
        <div class="mb-1">
          <div class="grid grid-cols-2 gap-2 items-center">
            <div class="flex items-center justify-start">
              <label class="text-ModalLabel text-textColor">Status Color:</label>
            </div>
            <div>
              <select
                v-model="currentSettings.status_color"
                :disabled="!selectedButton"
                class="w-full border border-gray-500 rounded p-0.5 text-xs bg-white"
                @change="emitChanges"
              >
                <option value="Red">🔴 Red</option>
                <option value="Yellow">🟡 Yellow</option>
                <option value="Green">🟢 Green</option>
                <option value="Blue">🔵 Blue</option>
                <option value="Grey">⚪ Grey</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Row 4: Button Label -->
        <div>
          <div class="grid grid-cols-2 gap-2 items-center">
            <div class="flex items-center justify-start">
              <label class="text-ModalLabel text-textColor">Button Label:</label>
            </div>
            <div>
              <input
                type="text"
                v-model="currentSettings.button_label"
                :disabled="!selectedButton"
                class="w-full border border-gray-500 rounded p-0.5 text-xs bg-white"
                @input="emitChanges"
              />
            </div>
          </div>
        </div>
      </div>
      <!-- End of Main Options Container -->

    </div>
  </div>
</template>

<script>
export default {
  name: "DashboardModal",
  props: {
    dashboard: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      // Complete dashboard configuration for all buttons.
      localDashboard: {
        on_button: { show: false, status_text: "", status_color: "Red", button_label: "" },
        off_button: { show: false, status_text: "", status_color: "Red", button_label: "" },
        pulse_button: { show: false, status_text: "", status_color: "Red", button_label: "" },
      },
      // Currently selected button key ("on_button", "off_button", or "pulse_button")
      selectedButton: "",
    };
  },
  computed: {
    // Returns the settings for the currently selected button.
    currentSettings() {
      return this.selectedButton ? this.localDashboard[this.selectedButton] : {};
    },
  },
  watch: {
    // Merge incoming dashboard values into localDashboard.
    dashboard: {
      immediate: true,
      handler(newVal) {
        this.localDashboard = {
          on_button: {
            show: newVal.on_button?.show ?? false,
            status_text: newVal.on_button?.status_text || "",
            status_color: newVal.on_button?.status_color || "Red",
            button_label: newVal.on_button?.button_label || "",
          },
          off_button: {
            show: newVal.off_button?.show ?? false,
            status_text: newVal.off_button?.status_text || "",
            status_color: newVal.off_button?.status_color || "Red",
            button_label: newVal.off_button?.button_label || "",
          },
          pulse_button: {
            show: newVal.pulse_button?.show ?? false,
            status_text: newVal.pulse_button?.status_text || "",
            status_color: newVal.pulse_button?.status_color || "Red",
            button_label: newVal.pulse_button?.button_label || "",
          },
        };
      },
    },
  },
  methods: {
    // Update the "show" property for the selected button.
    setEnabled(value) {
      if (!this.selectedButton) return;
      this.localDashboard[this.selectedButton].show = value;
      this.emitChanges();
    },
    // Return CSS classes for the pill buttons with a rectangular (less rounded) style.
    getPillButtonClass(currentValue, buttonValue) {
      const active = currentValue === buttonValue;
      const base = "px-2 py-0.5 text-xs font-medium focus:outline-none";
      const shape = buttonValue ? "rounded-l" : "rounded-r";
      const activeClass = active
        ? "bg-blue-500 text-white"
        : "bg-white text-blue-500 hover:bg-blue-50";
      return `${base} ${shape} ${activeClass}`;
    },
    // Emit the updated dashboard configuration to the parent.
    emitChanges() {
      this.$emit("dashboard-updated", JSON.parse(JSON.stringify(this.localDashboard)));
    },
  },
};
</script>

<style scoped>
label {
  transform: translateY(0px);
}
input, select {
  font-size: 0.8rem;
  line-height: 0.8rem;
  font-weight: 500;
  color: #333;
}
option {
  font-size: 0.8rem;
  line-height: 0.8rem;
  font-weight: 500;
  color: #333;
}
input:focus,
select:focus {
  outline: none;
  border-color: rgba(51, 51, 51, 0.5);
  box-shadow: 0 0 0 0.75px rgba(51, 51, 51, 0.5);
}
</style>
