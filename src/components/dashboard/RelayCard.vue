<template>
  <div class="w-full flex items-center bg-white border border-gray-500 rounded-lg shadow-lg">
    <!-- Left section: Name & Status -->
    <div class="flex-[1] flex items-center justify-between px-3 py-1.5">
      <h3 class="text-Subheader text-textColor">{{ relay.name }}</h3>
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
import { ref, computed, defineEmits, defineProps } from "vue";
import { turnRelayOn, turnRelayOff, pulseRelay } from "@/api/relayService";

// The parent (Dashboard.vue) passes a relay object with { id, name, state, dashboard, etc. }
const props = defineProps({
  relay: {
    type: Object,
    required: true,
  },
});

// We emit an event when the relay state changes so the parent can update its local data.
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
  return currentState.value === 1 ? "On" : "Off";
});

// Style for the status badge (background color)
const statusStyle = computed(() => {
  let color = "gray";
  if (isPulsing.value) {
    color = props.relay.dashboard?.pulse_button?.status_color || "gray";
  } else if (currentState.value === 1) {
    color = props.relay.dashboard?.on_button?.status_color || "green";
  } else {
    color = props.relay.dashboard?.off_button?.status_color || "red";
  }
  return { backgroundColor: color.toLowerCase() };
});

// Button labels from the relay dashboard config
const buttons = computed(() => {
  if (props.relay.dashboard) {
    return {
      on: props.relay.dashboard.on_button.show ? props.relay.dashboard.on_button.button_label : null,
      off: props.relay.dashboard.off_button.show ? props.relay.dashboard.off_button.button_label : null,
      pulse: props.relay.dashboard.pulse_button.show ? props.relay.dashboard.pulse_button.button_label : null,
    };
  }
  return { on: "On", off: "Off", pulse: "Pulse" };
});

// --- Action methods ---

// Turn Relay On
const turn_on = async () => {
  try {
    const result = await turnRelayOn(props.relay.id);
    console.log("Turn on result:", result);
    // Emit the new state so the parent can update immediately
    emit("update-state", { id: props.relay.id, state: result.state });
  } catch (error) {
    console.error("Error turning relay on:", error);
  }
};

// Turn Relay Off
const turn_off = async () => {
  try {
    const result = await turnRelayOff(props.relay.id);
    console.log("Turn off result:", result);
    emit("update-state", { id: props.relay.id, state: result.state });
  } catch (error) {
    console.error("Error turning relay off:", error);
  }
};

// Pulse Relay
const pulse_relay = async () => {
  try {
    isPulsing.value = true;
    const result = await pulseRelay(props.relay.id);
    console.log("Pulse result:", result);
    // The API returns { status: "success", duration, initial_state }
    // We can retrieve the new state from the API or assume the hardware is toggling.
    // Let's do a quick GET to confirm the new state if you want to be certain:
    //   const newState = await getRelayState(props.relay.id);
    //   emit("update-state", { id: props.relay.id, state: newState.state });

    // If the API returned a "state" property, use it:
    if (result.state !== undefined) {
      emit("update-state", { id: props.relay.id, state: result.state });
    }

    // Show "Pulsing" for the specified duration
    const duration = result.duration || 5;
    setTimeout(() => {
      isPulsing.value = false;
    }, duration * 1000);
  } catch (error) {
    console.error("Error pulsing relay:", error);
    isPulsing.value = false;
  }
};
</script>
