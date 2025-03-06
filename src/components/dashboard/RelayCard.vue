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
import { getRelayState, updateRelayState, pulseRelay } from "@/api/relayService";

const props = defineProps({
  relay: {
    type: Object,
    required: true,
  },
  pulse_text: {
    type: String,
    default: "Restarting...",
  },
});

// Access the global configuration store
const configStore = useConfigStore();

// Create a reactive copy of the relay object for local manipulation
const relay_state = reactive({ ...props.relay });

// Compute button labels dynamically based on the dashboard's "show" property.
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
    pulse: "Pulse 5s",
  };
});

// Compute inline style for status badge background color based on the dashboard's status_color value.
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
  const mapping = {
    green: "relayStatusgreen",
    yellow: "relayStatusyellow",
    red: "relayStatusred",
    gray: "relayStatusgray",
    blue: "relayStatusblue",
  };
  return { backgroundColor: mapping[colorKey] || mapping.gray };
});

// Computed display text for relay status (capitalized)
const display_status = computed(() => {
  const s = relay_state.state;
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
});

// Helper to update this relay in the global configuration store
const update_relay_in_store = () => {
  if (!configStore.configData || !configStore.configData.relays) return;
  const relayKeys = Object.keys(configStore.configData.relays);
  let keyToUpdate = null;
  for (const key of relayKeys) {
    if (configStore.configData.relays[key].id === relay_state.id) {
      keyToUpdate = key;
      break;
    }
  }
  if (!keyToUpdate) keyToUpdate = relay_state.id;
  const updated_relays = { ...configStore.configData.relays };
  updated_relays[keyToUpdate] = { ...relay_state };
  const updated_config = { ...configStore.configData, relays: updated_relays };
  configStore.updateConfig(updated_config);
};

// Button action methods
const turn_on = async () => {
  try {
    const result = await updateRelayState(relay_state.id, "on");
    console.log(result.message);
    relay_state.state = "on";
    update_relay_in_store();
  } catch (error) {
    console.error("Error turning relay on:", error);
  }
};

const turn_off = async () => {
  try {
    const result = await updateRelayState(relay_state.id, "off");
    console.log(result.message);
    relay_state.state = "off";
    update_relay_in_store();
  } catch (error) {
    console.error("Error turning relay off:", error);
  }
};

const pulse_relay = async () => {
  try {
    const result = await pulseRelay(relay_state.id);
    console.log(result.message);
    // Optionally update the relay state based on pulse result.
  } catch (error) {
    console.error("Error pulsing relay:", error);
  }
};
</script>
