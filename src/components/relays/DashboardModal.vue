<!-- src/components/relays/DashboardModal.vue -->
<template>
  <!-- Main container -->
  <div class="px-4 py-2 mx-auto" style="max-width: 40rem;">

    <!-- =============== CARD 1: BUTTON CONFIG EDITOR =============== -->
    <div class="bg-gray-100 border border-gray-500 rounded">
      <!-- Header (which button to edit) -->
      <div class="border-b border-gray-500 px-4 py-2 flex justify-between items-center">
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

      <!-- Form fields for the selected button -->
      <div class="px-3 py-1.5 space-y-1.5">
        <!-- VISIBILITY -->
        <div>
          <div class="grid grid-cols-2 items-center">
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

        <!-- STATUS TEXT -->
        <div>
          <div class="grid grid-cols-2 items-center">
            <div class="flex items-center justify-start">
              <label class="text-ModalLabel text-textColor">Status Text:</label>
            </div>
            <div>
              <input
                type="text"
                v-model="currentSettings.status_text"
                :disabled="!selectedButton"
                :placeholder="!selectedButton ? 'Select a button to edit' : ''"
                class="w-full border border-gray-500 rounded p-0.5 text-xs bg-white"
                @input="emitChanges"
              />
            </div>
          </div>
        </div>

        <!-- STATUS COLOR -->
        <div>
          <div class="grid grid-cols-2 items-center">
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
                <!-- All-lowercase options -->
                <option value="red">🔴 red</option>
                <option value="yellow">🟡 yellow</option>
                <option value="green">🟢 green</option>
                <option value="blue">🔵 blue</option>
                <option value="grey">⚪ grey</option>
              </select>
            </div>
          </div>
        </div>

        <!-- BUTTON LABEL -->
        <div>
          <div class="grid grid-cols-2 items-center">
            <div class="flex items-center justify-start">
              <label class="text-ModalLabel text-textColor">Button Label:</label>
            </div>
            <div>
              <input
                type="text"
                v-model="currentSettings.button_label"
                :disabled="!selectedButton"
                :placeholder="!selectedButton ? 'Select a button to edit' : ''"
                class="w-full border border-gray-500 rounded p-0.5 text-xs bg-white"
                @input="emitChanges"
              />
            </div>
          </div>
        </div>
      </div>
      <!-- end form fields -->
    </div>

    <!-- =============== CARD 2: PREVIEW =============== -->
    <div class="bg-gray-100 border border-gray-500 rounded mt-3">
      <!-- Header row with preview toggle -->
      <div class="border-b border-gray-500 px-3 py-1.5 flex justify-between items-center">
        <label class="text-ModalInfo text-textColor">Preview</label>
        <div class="inline-flex rounded overflow-hidden border border-blue-500">
          <button
            @click="preview.enabled = true"
            :class="getPillButtonClass(preview.enabled, true)"
          >
            Enabled
          </button>
          <button
            @click="preview.enabled = false"
            :class="getPillButtonClass(preview.enabled, false)"
          >
            Disabled
          </button>
        </div>
      </div>

      <!-- The actual preview content -->
      <transition name="fade">
        <div v-if="preview.enabled" class="px-3 py-2">
          <PreviewCard
            :relayName="relayName || 'Relay'"
            :relayStatus="activeButtonConfig.status_text || 'Idle'"
            :relayColor="activeButtonConfig.status_color || 'grey'"
            :relayButtons="computedPreviewButtons"
            :pulseText="localDashboard.pulse_button.status_text || 'Pulsing...'"
            @update-status="handlePreviewStateChange"
          />
        </div>
      </transition>
    </div>

  </div>
</template>

<script>
import PreviewCard from "./PreviewCard.vue";

export default {
  name: "DashboardModal",
  components: { PreviewCard },
  props: {
    // The parent passes in the entire dashboard object
    dashboard: {
      type: Object,
      required: true,
    },
    // The parent also passes the relay's name
    relayName: {
      type: String,
      default: "",
    },
    // The top-level "virtualState" (on/off/pulse)
    relayState: {
      type: String,
      default: "off",
    },
  },
  data() {
    return {
      // Our local copy of the dashboard config
      localDashboard: {
        on_button: { show: false, status_text: "", status_color: "red", button_label: "" },
        off_button: { show: false, status_text: "", status_color: "red", button_label: "" },
        pulse_button: { show: true, status_text: "", status_color: "yellow", button_label: "" },
      },
      // The user picks which button to edit
      selectedButton: "",
      // The relay's "virtualState" from the parent
      localState: "off",
      // Toggle for showing/hiding the preview
      preview: {
        enabled: false,
      },
    };
  },
  computed: {
    // The button object currently being edited
    currentSettings() {
      if (!this.selectedButton) return {};
      return this.localDashboard[this.selectedButton];
    },

    // The label sets for the preview (only show if .show===true)
    computedPreviewButtons() {
      const btns = {};
      if (this.localDashboard.on_button.show) {
        btns.on = this.localDashboard.on_button.button_label || "On";
      }
      if (this.localDashboard.off_button.show) {
        btns.off = this.localDashboard.off_button.button_label || "Off";
      }
      if (this.localDashboard.pulse_button.show) {
        btns.pulse = this.localDashboard.pulse_button.button_label || "Pulse";
      }
      return btns;
    },

    // We choose which config to display in the preview based on localState
    activeButtonConfig() {
      if (this.localState === "on") {
        return this.localDashboard.on_button;
      } else if (this.localState === "off") {
        return this.localDashboard.off_button;
      } else {
        return this.localDashboard.pulse_button;
      }
    },
  },
  watch: {
    // Copy parent's dashboard on mount/change
    dashboard: {
      immediate: true,
      handler(newVal) {
        this.localDashboard = {
          on_button: {
            show: newVal.on_button?.show ?? false,
            status_text: newVal.on_button?.status_text || "",
            status_color: newVal.on_button?.status_color || "red",
            button_label: newVal.on_button?.button_label || "",
          },
          off_button: {
            show: newVal.off_button?.show ?? false,
            status_text: newVal.off_button?.status_text || "",
            status_color: newVal.off_button?.status_color || "red",
            button_label: newVal.off_button?.button_label || "",
          },
          pulse_button: {
            show: newVal.pulse_button?.show ?? false,
            status_text: newVal.pulse_button?.status_text || "",
            status_color: newVal.pulse_button?.status_color || "yellow",
            button_label: newVal.pulse_button?.button_label || "",
          },
        };
      },
    },
    // Copy parent's relayState
    relayState: {
      immediate: true,
      handler(newVal) {
        this.localState = newVal.toLowerCase();
      },
    },
  },
  methods: {
    setEnabled(value) {
      if (!this.selectedButton) return;
      this.localDashboard[this.selectedButton].show = value;
      this.emitChanges();
    },
    getPillButtonClass(currentValue, buttonValue) {
      const active = currentValue === buttonValue;
      const base = "px-2 py-0.5 text-xs font-medium focus:outline-none";
      const shape = buttonValue ? "rounded-l" : "rounded-r";
      const activeClass = active
        ? "bg-blue-500 text-white"
        : "bg-white text-blue-500 hover:bg-blue-50";
      return `${base} ${shape} ${activeClass}`;
    },
    // Emit the updated dashboard + the updated localState
    emitChanges() {
      this.$emit("dashboard-updated", {
        dashboard: JSON.parse(JSON.stringify(this.localDashboard)),
        state: this.localState,
      });
    },
    // If user clicks "On"/"Off"/"Pulse" in the preview
    handlePreviewStateChange(newStatus) {
      const lowered = newStatus.toLowerCase();
      if (lowered === "on") {
        this.localState = "on";
      } else if (lowered === "off") {
        this.localState = "off";
      } else {
        // Assume it's a pulse
        this.localState = "pulse";
      }
      this.emitChanges();
    },
  },
};
</script>

<style scoped>
label {
  transform: translateY(0px);
}
input,
select {
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

/* Fade transition for preview toggling */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>