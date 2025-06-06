<template>
  <div class="w-full flex items-center bg-white border border-gray-500 rounded-lg shadow-lg">
    <!-- Left: Name & Status -->
    <div class="flex-[1.1] flex items-center justify-between p-1.5 rounded-l">
      <h3 class="text-ModalPreviewLabel text-textColor ml-1">
        {{ relayName }}
      </h3>
      <span :style="statusStyle" class="px-2 py-0.5 rounded mr-1">
        {{ relayStatus }}
      </span>
    </div>

    <!-- Right: Buttons (on/off/pulse) -->
    <div class="flex-[1.9] p-1.5 border-l border-gray-400 rounded-r-md shadow-md mx-1">
      <div class="flex h-full space-x-2 items-center justify-center">
        <!-- ON button -->
        <button v-if="relayButtons.on" @click="emitStatus('On')"
          class="flex-1 bg-gray-200 border border-gray-500 hover:bg-gray-300 px-2 py-1 rounded text-center shadow-md">
          {{ relayButtons.on }}
        </button>

        <!-- OFF button -->
        <button v-if="relayButtons.off" @click="emitStatus('Off')"
          class="flex-1 bg-gray-200 border border-gray-500 hover:bg-gray-300 px-2 py-1 rounded text-center shadow-md">
          {{ relayButtons.off }}
        </button>

        <!-- PULSE button -->
        <button v-if="relayButtons.pulse" @click="emitStatus(pulseText)"
          class="flex-1 bg-gray-200 border border-gray-500 hover:bg-gray-300 px-2 py-1 rounded text-center shadow-md">
          {{ relayButtons.pulse }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { getContrastTextColor, ensureValidHex } from '@/utils/colorUtils';

export default {
  name: "PreviewCard",
  props: {
    relayName: {
      type: String,
      default: "Relay",
    },
    relayStatus: {
      type: String,
      default: "idle",
    },
    relayColor: {
      type: String,
      default: '#d1d5db',
    },
    relayButtons: {
      type: Object,
      default: () => ({}),
    },
    pulseText: {
      type: String,
      default: "pulsing...",
    },
  },
  computed: {
    // Dynamic style object for the status badge
    statusStyle() {
      const validColor = ensureValidHex(this.relayColor);
      const textColor = getContrastTextColor(validColor);

      return {
        backgroundColor: validColor,
        color: textColor
      };
    },
  },
  methods: {
    emitStatus(newStatus) {
      this.$emit("update-status", newStatus);
    },
  },
};
</script>

<style scoped>
/* Custom styles can be added here if needed */
</style>