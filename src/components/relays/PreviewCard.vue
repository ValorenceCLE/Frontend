<template>
  <div class="w-full flex items-center bg-white border border-gray-500 rounded-lg shadow-lg">
    <!-- Left: Name & Status -->
    <div class="flex-[1.1] flex items-center justify-between p-1.5 rounded-l">
      <h3 class="text-ModalPreviewLabel text-textColor ml-1">
        {{ relayName }}
      </h3>
      <span :class="statusClass" class="px-2 py-0.5 rounded mr-1">
        {{ relayStatus }}
      </span>
    </div>

    <!-- Right: Buttons (on/off/pulse) -->
    <div class="flex-[1.9] p-1.5 border-l border-gray-400 rounded-r-md shadow-md mx-1">
      <div class="flex h-full space-x-2 items-center justify-center">
        <!-- ON button -->
        <button
          v-if="relayButtons.on"
          @click="emitStatus('On')"
          class="flex-1 bg-gray-200 border border-gray-500 hover:bg-gray-300 px-2 py-1 rounded text-center shadow-md"
        >
          {{ relayButtons.on }}
        </button>

        <!-- OFF button -->
        <button
          v-if="relayButtons.off"
          @click="emitStatus('Off')"
          class="flex-1 bg-gray-200 border border-gray-500 hover:bg-gray-300 px-2 py-1 rounded text-center shadow-md"
        >
          {{ relayButtons.off }}
        </button>

        <!-- PULSE button -->
        <button
          v-if="relayButtons.pulse"
          @click="emitStatus(pulseText)"
          class="flex-1 bg-gray-200 border border-gray-500 hover:bg-gray-300 px-2 py-1 rounded text-center shadow-md"
        >
          {{ relayButtons.pulse }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
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
      default: "grey",
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
    // Lowercase color -> mapped to CSS classes
    statusClass() {
      switch (this.relayColor.toLowerCase()) {
        case "red":
          return "bg-relayRed text-white";
        case "green":
          return "bg-relayGreen text-white";
        case "yellow":
          return "bg-relayYellow text-black"; // or text-white, your choice
        case "blue":
          return "bg-relayBlue text-white";
        case "grey":
        default:
          return "bg-gray-300 text-white";
      }
    },
  },
  methods: {
    emitStatus(newStatus) {
      // e.g. "On", "Off", or the pulse text
      this.$emit("update-status", newStatus);
    },
  },
};
</script>

<style scoped>
/* Adjust or rename classes as needed for your color utilities, e.g. .bg-relayRed, etc. */
</style>
