<template>
  <div class="w-full flex items-center bg-white border border-gray-500 rounded-lg shadow-lg">
    <!-- Left section: Name & Status -->
    <div class="flex-[1] flex items-center justify-between px-3 py-1.5">
      <h3 class="text-Subheader text-textColor">{{ relay_state.name }}</h3>
      <span :style="statusStyle" class="text-white font-semibold w-fit px-3 py-1 rounded-md">
        {{ display_status }}
      </span>
    </div>
    <!-- Right section: Buttons -->
    <div class="flex-[2] p-2 border-l border-gray-400 rounded-r-md shadow-md">
      <div class="flex h-full space-x-2 items-center justify-center">
        <button
          v-if="buttons.on"
          @click="turn_on"
          class="flex-1 bg-gray-200 text-Body text-textColor border border-gray-500 hover:bg-gray-300 px-3 py-1.5 rounded-md text-center shadow"
        >
          {{ buttons.on }}
        </button>
        <button
          v-if="buttons.off"
          @click="turn_off"
          class="flex-1 bg-gray-200 text-Body text-textColor border border-gray-500 hover:bg-gray-300 px-3 py-1.5 rounded-md text-center shadow"
        >
          {{ buttons.off }}
        </button>
        <button
          v-if="buttons.pulse"
          @click="pulse_relay"
          class="flex-1 bg-gray-200 text-Body text-textColor border border-gray-500 hover:bg-gray-300 px-3 py-1.5 rounded-md text-center shadow"
        >
          {{ buttons.pulse }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed } from "vue";
import { useConfigStore } from "@/store/config";
import { getRelayState, turnRelayOn, turnRelayOff, pulseRelay } from "@/api/relayService";

const props = defineProps({
  relay: {
    type: Object,
    required: true,
  },
});

// Create a reactive copy of the relay object for local manipulation
const relay_state = reactive({ ...props.relay });

// Compute button labels dynamically based on the relay dashboard configuration
const buttons = computed(() => {
  if (relay_state.dashboard) {
    return {
      on: relay_state.dashboard.on_button.show ? relay_state.dashboard.on_button.button_label : null,
      off: relay_state.dashboard.off_button.show ? relay_state.dashboard.off_button.button_label : null,
      pulse: relay_state.dashboard.pulse_button.show ? relay_state.dashboard.pulse_button.button_label : null,
    };
  }
  return {
    on: "Turn On",
    off: "Turn Off",
    pulse: "Pulse",
  };
});

// Compute inline style for status badge background color based on dashboard status_color values.
const statusStyle = computed(() => {
  let colorKey = "gray";
  const state = relay_state.state.toLowerCase();
  if (relay_state.dashboard) {
    if (state === "on" && relay_state.dashboard.on_button?.status_color) {
      colorKey = relay_state.dashboard.on_button.status_color.toLowerCase();
    } else if (state === "off" && relay_state.dashboard.off_button?.status_color) {
      colorKey = relay_state.dashboard.off_button.status_color.toLowerCase();
    } else if (relay_state.dashboard.pulse_button?.status_color) {
      colorKey = relay_state.dashboard.pulse_button.status_color.toLowerCase();
    }
  }
  // Map color keys to actual CSS color names (or use your CSS classes)
  const mapping = {
    green: "green",
    yellow: "yellow",
    red: "red",
    gray: "gray",
    blue: "blue",
  };
  return { backgroundColor: mapping[colorKey] || mapping.gray };
});

// Compute display text for relay status (capitalized)
const display_status = computed(() => {
  const s = relay_state.state;
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
});

// Updated helper: Update relay in global config using the relay's own id as key.
const update_relay_in_store = () => {
  const configStore = useConfigStore();
  if (!configStore.configData || !configStore.configData.relays) return;
  // Ensure the relays object is keyed by relay ID.
  // For simplicity, rebuild the relays object with relay.id as key.
  const updated_relays = {};
  // Iterate over current relays and re-key by relay.id
  Object.values(configStore.configData.relays).forEach((relay) => {
    updated_relays[relay.id] = relay;
  });
  // Update the specific relay with new state
  updated_relays[relay_state.id] = { ...relay_state };
  configStore.updateConfig({ ...configStore.configData, relays: updated_relays });
};

// Button action methods
const turn_on = async () => {
  try {
    const result = await turnRelayOn(relay_state.id);
    console.log("Turn on result:", result);
    relay_state.state = "on";
    update_relay_in_store();
  } catch (error) {
    console.error("Error turning relay on:", error);
  }
};

const turn_off = async () => {
  try {
    const result = await turnRelayOff(relay_state.id);
    console.log("Turn off result:", result);
    relay_state.state = "off";
    update_relay_in_store();
  } catch (error) {
    console.error("Error turning relay off:", error);
  }
};

const pulse_relay = async () => {
  try {
    const result = await pulseRelay(relay_state.id);
    console.log("Pulse result:", result);
    // Update the relay state based on the backend response
    const current = await getRelayState(relay_state.id);
    relay_state.state = current.state;
    update_relay_in_store();
  } catch (error) {
    console.error("Error pulsing relay:", error);
  }
};
</script>
