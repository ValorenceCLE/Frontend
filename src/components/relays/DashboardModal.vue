<!-- src/components/relays/DashboardModal.vue -->
<template>
  <div class="px-4 py-2 mx-auto" style="max-width: 40rem;">

    <!-- =============== BUTTON CONFIG EDITOR =============== -->
    <div class="bg-gray-100 border border-gray-500 rounded">
      <div class="border-b border-gray-500 px-4 py-2 flex justify-between items-center">
        <label class="text-ModalInfo text-textColor">Select Button:</label>
        <select v-model="selectedButton" class="w-1/4 border border-gray-500 rounded text-sm">
          <option value="on_button">ON</option>
          <option value="off_button">OFF</option>
          <option value="pulse_button">Pulse</option>
        </select>
      </div>

      <div class="px-3 py-1.5 space-y-1.5">
        <!-- VISIBILITY -->
        <div>
          <div class="grid grid-cols-2 items-center">
            <div class="flex items-center justify-start">
              <label class="text-ModalLabel text-textColor">Visibility:</label>
            </div>
            <div class="flex items-center justify-end">
              <div class="inline-flex rounded overflow-hidden border border-blue-500">
                <button @click="setEnabled(true)" :class="getPillButtonClass(currentSettings?.show, true)"
                  :disabled="!selectedButton">
                  Show
                </button>
                <button @click="setEnabled(false)" :class="getPillButtonClass(currentSettings?.show, false)"
                  :disabled="!selectedButton">
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
              <input type="text" v-model="currentSettings.status_text" :disabled="!selectedButton"
                :placeholder="!selectedButton ? 'Select a button to edit' : ''"
                class="w-full border border-gray-500 rounded p-0.5 text-xs bg-white" @input="emitChanges" />
            </div>
          </div>
        </div>

        <!-- STATUS COLOR -->
        <div>
          <div class="grid grid-cols-2 items-start">
            <div class="flex items-center justify-start pt-3">
              <label class="text-ModalLabel text-textColor">Status Color:</label>
            </div>
            <div class="space-y-3">
              <div v-if="selectedButton">
                <div class="flex items-center space-x-2">
                  <input type="color" v-model="currentSettings.status_color"
                    class="w-10 h-10 border border-gray-300 rounded cursor-pointer" />
                  <input type="text" v-model="currentSettings.status_color"
                    class="border border-gray-300 rounded p-1 text-xs font-mono w-24" placeholder="#FF0000" />
                </div>
              </div>
              <div v-else class="flex items-center space-x-2 p-2 border border-gray-300 rounded bg-gray-50">
                <div class="w-8 h-8 bg-gray-200 border border-gray-300 rounded"></div>
                <span class="text-xs text-gray-400">Select a button to edit</span>
              </div>
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
              <input type="text" v-model="currentSettings.button_label" :disabled="!selectedButton"
                :placeholder="!selectedButton ? 'Select a button to edit' : ''"
                class="w-full border border-gray-500 rounded p-0.5 text-xs bg-white" @input="emitChanges" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- =============== PREVIEW =============== -->
    <div class="bg-gray-100 border border-gray-500 rounded mt-3">
      <div class="border-b border-gray-500 px-3 py-1.5 flex justify-between items-center">
        <label class="text-ModalInfo text-textColor">Preview</label>
        <div class="inline-flex rounded overflow-hidden border border-blue-500">
          <button @click="preview.enabled = true" :class="getPillButtonClass(preview.enabled, true)">
            Enabled
          </button>
          <button @click="preview.enabled = false" :class="getPillButtonClass(preview.enabled, false)">
            Disabled
          </button>
        </div>
      </div>

      <transition name="fade">
        <div v-if="preview.enabled" class="px-3 py-2">
          <PreviewCard :relayName="relayName || 'Relay'" :relayStatus="activeButtonConfig.status_text || 'Idle'"
            :relayColor="activeButtonConfig.status_color || '#d1d5db'" :relayButtons="computedPreviewButtons"
            :pulseText="localDashboard.pulse_button.status_text || 'Pulsing...'"
            @update-status="handlePreviewStateChange" />
        </div>
      </transition>
    </div>

  </div>
</template>

<script>
import PreviewCard from "./PreviewCard.vue";
import { createDefaultDashboard, DEFAULT_COLORS, normalizeColor, hexToHsl, hslToHex } from '@/utils/colorUtils';

export default {
  name: "DashboardModal",
  components: {
    PreviewCard,
  },
  props: {
    dashboard: { type: Object, required: true },
    relayName: { type: String, default: "" },
    relayState: { type: String, default: "off" },
  },
  data() {
    return {
      localDashboard: createDefaultDashboard(),
      selectedButton: "on_button",
      localState: "off",
      preview: { enabled: false },
    };
  },
  computed: {
    currentSettings() {
      if (!this.selectedButton) return {};
      return this.localDashboard[this.selectedButton];
    },
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
    activeButtonConfig() {
      if (this.localState === "on") return this.localDashboard.on_button;
      if (this.localState === "off") return this.localDashboard.off_button;
      return this.localDashboard.pulse_button;
    },
  },
  watch: {
    dashboard: {
      immediate: true,
      handler(newVal) {
        this.localDashboard = {
          on_button: {
            show: newVal.on_button?.show ?? false,
            status_text: newVal.on_button?.status_text || "",
            status_color: normalizeColor(newVal.on_button?.status_color) || DEFAULT_COLORS.on,
            button_label: newVal.on_button?.button_label || "",
          },
          off_button: {
            show: newVal.off_button?.show ?? false,
            status_text: newVal.off_button?.status_text || "",
            status_color: normalizeColor(newVal.off_button?.status_color) || DEFAULT_COLORS.off,
            button_label: newVal.off_button?.button_label || "",
          },
          pulse_button: {
            show: newVal.pulse_button?.show ?? false,
            status_text: newVal.pulse_button?.status_text || "",
            status_color: normalizeColor(newVal.pulse_button?.status_color) || DEFAULT_COLORS.pulse,
            button_label: newVal.pulse_button?.button_label || "",
          },
        };
      },
    },
    relayState: {
      immediate: true,
      handler(newVal) {
        this.localState = newVal.toLowerCase();
      },
    },
    selectedButton() {
      this.updateHueFromCurrentColor();
    }
  },
  mounted() {
    console.log('DashboardModal mounted, ColorPicker available:', !!this.ColorPicker);
  },
  methods: {
    updateHueFromCurrentColor() {
      if (this.selectedButton && this.currentSettings.status_color) {
        const hsl = hexToHsl(this.currentSettings.status_color);
        this.currentHue = hsl.hue;
      }
    },

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

    updateColor(hue) {
      if (!this.selectedButton) return;
      this.currentHue = hue;
      const hex = hslToHex(hue, 80, 50);
      this.localDashboard[this.selectedButton].status_color = hex;
      this.emitChanges();
    },

    emitChanges() {
      this.$emit("dashboard-updated", {
        dashboard: JSON.parse(JSON.stringify(this.localDashboard)),
        state: this.localState,
      });
    },

    handlePreviewStateChange(newStatus) {
      const lowered = newStatus.toLowerCase();
      if (lowered === "on") this.localState = "on";
      else if (lowered === "off") this.localState = "off";
      else this.localState = "pulse";
      this.emitChanges();
    },

    getDashboardData() {
      return JSON.parse(JSON.stringify(this.localDashboard));
    },
  },
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

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

input:focus,
select:focus {
  outline: none;
  border-color: rgba(51, 51, 51, 0.5);
  box-shadow: 0 0 0 0.75px rgba(51, 51, 51, 0.5);
}

.radial-picker-wrapper {
  width: 200px;
  height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px dashed #ccc;
  border-radius: 8px;
  padding: 20px;
}
</style>