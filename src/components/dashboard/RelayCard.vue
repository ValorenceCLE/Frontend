<!-- src/components/dashboard/RelayCard.vue -->
<template>
  <div class="w-full flex items-center bg-white border border-gray-500 rounded-lg shadow-lg">
    <!-- Left section: Name & Status -->
    <div class="flex-[1] flex items-center justify-between px-3 py-1.5">
      <h3 class="text-Subheader text-textColor">{{ relay.name }}</h3>
      <span :style="statusStyle" class="font-semibold w-fit px-3 py-1 rounded-md">
        {{ display_status }}
      </span>
    </div>

    <!-- Right section: Buttons -->
    <div class="flex-[2] p-2 border-l border-gray-400 rounded-r-md shadow-md">
      <div class="flex h-full space-x-2 items-center justify-center">
        <button v-if="buttons.on" @click="turn_on"
          class="flex-1 bg-gray-200 text-Body text-textColor border border-gray-500 hover:bg-gray-300 px-3 py-1.5 rounded-md text-center shadow">
          {{ buttons.on }}
        </button>
        <button v-if="buttons.off" @click="turn_off"
          class="flex-1 bg-gray-200 text-Body text-textColor border border-gray-500 hover:bg-gray-300 px-3 py-1.5 rounded-md text-center shadow">
          {{ buttons.off }}
        </button>
        <button v-if="buttons.pulse" @click="pulse_relay"
          class="flex-1 bg-gray-200 text-Body text-textColor border border-gray-500 hover:bg-gray-300 px-3 py-1.5 rounded-md text-center shadow">
          {{ buttons.pulse }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { turnRelayOn, turnRelayOff, pulseRelay } from "@/api/relayService";
import configUtils from '@/utils/configUtils';
import { getContrastTextColor, normalizeColor, DEFAULT_COLORS } from '@/utils/colorUtils';

const props = defineProps({
  relay: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["update-state"]);

// Local flag to track if the relay is pulsing (temporary UI feedback)
const isPulsing = ref(false);

// Computed property for the numeric state (0 = Off, 1 = On)
const currentState = computed(() => props.relay.state);

// Display text for the relay status
const display_status = computed(() => {
  if (isPulsing.value) {
    return props.relay.dashboard?.pulse_button?.status_text || "Pulsing...";
  }
  return currentState.value === 1 ?
    (props.relay.dashboard?.on_button?.status_text || "On") :
    (props.relay.dashboard?.off_button?.status_text || "Off");
});

// Style for the status badge (background color and text color)
const statusStyle = computed(() => {
  let color;

  if (isPulsing.value) {
    color = props.relay.dashboard?.pulse_button?.status_color || DEFAULT_COLORS.pulse;
  } else if (currentState.value === 1) {
    color = props.relay.dashboard?.on_button?.status_color || DEFAULT_COLORS.on;
  } else {
    color = props.relay.dashboard?.off_button?.status_color || DEFAULT_COLORS.off;
  }

  // Convert legacy color names to hex if needed
  const normalizedColor = normalizeColor(color);
  const textColor = getContrastTextColor(normalizedColor);

  return {
    backgroundColor: normalizedColor,
    color: textColor
  };
});

// Button labels from the relay dashboard config
const buttons = computed(() => {
  if (props.relay.dashboard) {
    return {
      on: props.relay.dashboard.on_button?.show ? props.relay.dashboard.on_button.button_label || "On" : null,
      off: props.relay.dashboard.off_button?.show ? props.relay.dashboard.off_button.button_label || "Off" : null,
      pulse: props.relay.dashboard.pulse_button?.show ? props.relay.dashboard.pulse_button.button_label || "Pulse" : null,
    };
  }
  return { on: "On", off: "Off", pulse: "Pulse" };
});

// --- Action methods ---

// Turn Relay On
const turn_on = async () => {
  try {
    const result = await turnRelayOn(props.relay.id);
    emit("update-state", { id: props.relay.id, state: result.state });
  } catch (error) {
    console.error("Error turning relay on:", error);
  }
};

// Turn Relay Off
const turn_off = async () => {
  try {
    const result = await turnRelayOff(props.relay.id);
    emit("update-state", { id: props.relay.id, state: result.state });
  } catch (error) {
    console.error("Error turning relay off:", error);
  }
};

// Pulse Relay
const pulse_relay = async () => {
  try {
    isPulsing.value = true;

    // Get pulse duration from config if not specified in relay
    const defaultDuration = configUtils.get('relay.defaultPulseTime', 5);
    const duration = props.relay.pulse_time || defaultDuration;

    const result = await pulseRelay(props.relay.id);

    // If the API returned a "state" property, use it:
    if (result.state !== undefined) {
      emit("update-state", { id: props.relay.id, state: result.state });
    }

    // Show "Pulsing" for the specified duration
    const pulseTime = result.duration || duration;
    setTimeout(() => {
      isPulsing.value = false;
    }, pulseTime * 1000);
  } catch (error) {
    console.error("Error pulsing relay:", error);
    isPulsing.value = false;
  }
};
</script>