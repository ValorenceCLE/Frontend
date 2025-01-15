<template>
  <!-- 
      Main wrapper:
        - w-full fills the parent's width
        - flex + items-center ensures vertical centering across the entire bar
        - bg-white, border, shadow-md, and rounded-md for styling
    -->
  <div
    class="w-full flex items-center bg-white border border-gray-400 rounded-lg shadow-lg"
  >
    <!-- Left section: Name & Status -->
    <div
      class="flex-[1] flex items-center justify-between p-3 border-r border-gray-300 rounded-l-md"
    >
      <!-- Name (left) -->
      <h3 class="text-Subheader text-textColor">{{ relayName }}</h3>

      <!-- Status (right) -->
      <span :class="statusClass" class="text-Status font-semibold px-6 py-1 rounded-md">
        {{ displayStatus }}
      </span>
    </div>

    <!-- Right section: Buttons -->
    <!-- 
        - flex-[2] for a wider right portion
        - p-3 for spacing
        - .flex h-full space-x-2 items-center justify-center 
          so buttons line up horizontally, share space, and are centered vertically
      -->
    <div class="flex-[2] p-2 border-l border-gray-300 rounded-r-md shadow-md">
      <div class="flex h-full space-x-2 items-center justify-center">
        <!-- ON button -->
        <button
          v-if="buttons.on"
          @click="turnOn"
          class="flex-1 bg-gray-200 text-Body text-textColor border border-gray-400 hover:bg-gray-300 px-3 py-2 rounded-md text-center shadow-md"
        >
          {{ buttons.on }}
        </button>

        <!-- OFF button -->
        <button
          v-if="buttons.off"
          @click="turnOff"
          class="flex-1 bg-gray-200 text-Body text-textColor border border-gray-400 hover:bg-gray-300 px-3 py-2 rounded-md text-center shadow-md"
        >
          {{ buttons.off }}
        </button>

        <!-- PULSE button -->
        <button
          v-if="buttons.pulse"
          @click="pulse"
          class="flex-1 bg-gray-200 text-Body text-textColor border border-gray-400 hover:bg-gray-300 px-3 py-2 rounded-md text-center shadow-md"
        >
          {{ buttons.pulse }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, computed } from "vue";

export default {
  name: "RelayCard",
  props: {
    initialName: {
      type: String,
      default: "Router",
    },
    initialStatus: {
      type: String,
      default: "Off",
    },
    initialButtons: {
      type: Object,
      default: () => ({
        on: "Turn On",
        off: "Turn Off",
        pulse: "Pulse 5s",
      }),
    },
    pulseText: {
      type: String,
      default: "Pulsing...",
    },
  },
  setup(props) {
    // Reactive state for name, status, and button labels
    const relayState = reactive({
      relayName: props.initialName,
      relayStatus: props.initialStatus,
      buttons: props.initialButtons,
    });

    // Computed class for status badge background color
    const statusClass = computed(() => {
      if (relayState.relayStatus === "On") {
        return "bg-relayGreen text-white";
      } else if (relayState.relayStatus === "Off") {
        return "bg-relayRed text-white";
      } else {
        // For "pulse" or any other custom state
        return "bg-relayYellow text-white";
      }
    });

    // Display text for current relay status
    const displayStatus = computed(() => relayState.relayStatus);

    // Button actions
    const turnOn = () => {
      relayState.relayStatus = "On";
    };
    const turnOff = () => {
      relayState.relayStatus = "Off";
    };
    const pulse = () => {
      relayState.relayStatus = props.pulseText;
      setTimeout(() => {
        relayState.relayStatus = "Off"; // Reset after 5s
      }, 5000);
    };

    return {
      ...relayState,
      statusClass,
      displayStatus,
      turnOn,
      turnOff,
      pulse,
    };
  },
};
</script>
