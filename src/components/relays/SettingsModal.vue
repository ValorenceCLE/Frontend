<!-- src/components/relays/SettingsModal.vue -->
<template>
  <!-- OUTER container to match DashboardModal -->
  <div class="px-4 py-2 mx-auto" style="max-width: 40rem;">
    
    <!-- ============ PHYSICAL SETTINGS CARD ============ -->
    <div class="bg-gray-100 border border-gray-500 rounded">
      <div class="border-b border-gray-500 px-3 py-1.5 flex justify-between items-center">
        <label class="text-ModalInfo text-textColor">Physical Settings</label>
      </div>

      <div class="px-3 py-1.5 space-y-1.5">
        <!-- Enabled -->
        <div>
          <div class="grid grid-cols-2 items-center">
            <div class="flex items-center justify-start">
              <label class="text-ModalLabel text-textColor">Enabled:</label>
            </div>
            <div>
              <select
                v-model="localRelay.enabled"
                class="w-full border border-gray-500 rounded py-0.5 text-xs bg-white"
                @change="emitChanges"
              >
                <option :value="true">True</option>
                <option :value="false">False</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Relay Name -->
        <div>
          <div class="grid grid-cols-2 items-center">
            <div class="flex items-center justify-start">
              <label class="text-ModalLabel text-textColor">Relay Name:</label>
            </div>
            <div>
              <input
                type="text"
                v-model="localRelay.name"
                class="w-full border border-gray-500 rounded p-0.5 text-xs bg-white pl-1"
                @input="emitChanges"
              />
            </div>
          </div>
        </div>

        <!-- Pulse Time -->
        <div>
          <div class="grid grid-cols-2 items-center">
            <div class="flex items-center justify-start">
              <label class="text-ModalLabel text-textColor">Pulse Time (Seconds):</label>
            </div>
            <div>
              <input
                type="number"
                v-model="localRelay.pulse_time"
                class="w-full border border-gray-500 rounded py-0.5 pl-1 text-xs bg-white"
                @input="emitChanges"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ============ SCHEDULE CARD ============ -->
    <div class="bg-gray-100 border border-gray-500 rounded mt-3">
      <div class="border-b border-gray-500 px-3 py-1.5 flex justify-between items-center">
        <label class="text-ModalInfo text-textColor">Schedule</label>
        
        <!-- Toggle for Enabled/Disabled (unchanged) -->
        <div class="inline-flex rounded overflow-hidden border border-blue-500">
          <button
            @click="setScheduleEnabled(true)"
            :class="getPillButtonClass(localRelay.schedule.enabled, true)"
          >
            Enabled
          </button>
          <button
            @click="setScheduleEnabled(false)"
            :class="getPillButtonClass(localRelay.schedule.enabled, false)"
          >
            Disabled
          </button>
        </div>
      </div>

      <transition name="fade">
        <div v-if="localRelay.schedule.enabled" class="px-3 py-1.5 space-y-1.5">
          <!-- Time On -->
          <div>
            <div class="grid grid-cols-2 items-center">
              <div class="flex items-center justify-start">
                <label class="text-ModalLabel text-textColor">Turn On:</label>
              </div>
              <div>
                <input
                  type="time"
                  placeholder="HH:mm"
                  format="HH:mm"
                  v-model="localRelay.schedule.time_on"
                  class="w-full border border-gray-500 rounded p-0.5 px-1 text-xs bg-white"
                  @change="emitChanges"
                />
              </div>
            </div>
          </div>

          <!-- Time Off -->
          <div>
            <div class="grid grid-cols-2 items-center">
              <div class="flex items-center justify-start">
                <label class="text-ModalLabel text-textColor">Turn Off:</label>
              </div>
              <div>
                <input
                  type="time"
                  placeholder="HH:mm"
                  format="HH:mm"
                  v-model="localRelay.schedule.time_off"
                  class="w-full border border-gray-500 rounded p-0.5 px-1 text-xs bg-white"
                  @change="emitChanges"
                />
              </div>
            </div>
          </div>

          <!-- Days of Week (Bitwise Buttons) -->
          <div>
            <div class="grid grid-cols-2 items-center">
              <div class="flex items-center justify-start">
                <label class="text-ModalLabel text-textColor">Days:</label>
              </div>
              <!-- We'll display the days in a single row, using the same style approach -->
              <div class="inline-flex rounded overflow-hidden justify-center">
                <button
                  v-for="(day, idx) in daysList"
                  :key="day"
                  type="button"
                  @click="toggleDay(day)"
                  :class="getDayButtonClass(day, idx)"
                >
                  {{ day }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>

  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';

export default {
  name: "SettingsModal",
  props: {
    relay: {
      type: Object,
      required: true,
    },
    relayKey: {
      type: [String, Number],
      required: true,
    },
  },
  data() {
    return {
      localRelay: {},
      daysList: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      dayValues: {
        Sun: 2,
        Mon: 4,
        Tue: 8,
        Wed: 16,
        Thu: 32,
        Fri: 64,
        Sat: 128
      }
    };
  },
  created() {
    this.initializeLocalRelay();
  },
  watch: {
    // Whenever the parent 'relay' prop changes, re-initialize localRelay.
    relay: {
      handler() {
        this.initializeLocalRelay();
      },
      immediate: true,
    },
  },
  methods: {
    // New method to properly initialize the localRelay
    initializeLocalRelay() {
      const relay = this.relay;
      
      // Create a deep copy of the relay to avoid reference issues
      this.localRelay = JSON.parse(JSON.stringify({
        ...relay,
        schedule: {
          enabled: relay.schedule?.enabled ?? false,
          // Fix for the time_on and time_off fields
          time_on: relay.schedule?.time_on || relay.schedule?.on_time || "",
          time_off: relay.schedule?.time_off || relay.schedule?.off_time || "",
          days_mask: relay.schedule?.days_mask ?? 0
        },
      }));
      
      // Initialize any missing properties
      if (!this.localRelay.pulse_time) {
        this.localRelay.pulse_time = 5; // Default pulse time
      }
    },

    /* ========== SCHEDULE ENABLE / DISABLE ========== */
    setScheduleEnabled(value) {
      this.localRelay.schedule.enabled = value;
      this.emitChanges();
    },

    /**
     * Re-use the same style as the "Enabled/Disabled" toggle:
     * bg-blue-500 text-white if active, else bg-white text-blue-500 hover:bg-blue-50.
     */
    getPillButtonClass(currentValue, buttonValue) {
      const active = currentValue === buttonValue;
      const base = "px-2 py-0.5 text-xs font-medium focus:outline-none";
      const shape = buttonValue ? "rounded-l" : "rounded-r";
      const activeClass = active
        ? "bg-blue-500 text-white"
        : "bg-white text-blue-500 hover:bg-blue-100";
      return `${base} ${shape} ${activeClass}`;
    },

    /* ========== DAYS-OF-WEEK TOGGLE CLASS ========== */
    getDayButtonClass(day, idx) {
      // This function mimics getPillButtonClass but checks if the day is selected or not
      const base = "px-2 text-sm font-medium focus:outline-blue-700 border border-blue-500";
      // shape: only first button gets 'rounded-l', only last gets 'rounded-r'
      let shape = "";
      if (idx === 0) shape = "rounded-l";
      else if (idx === this.daysList.length - 1) shape = "rounded-r";

      // Determine if the day bit is set
      const bit = this.dayValues[day];
      const currentMask = this.localRelay.schedule.days_mask;
      const isSet = (currentMask & bit) === bit;

      // If set => "bg-blue-500 text-white"
      // Else => "bg-white text-blue-500 hover:bg-blue-50"
      if (isSet) {
        return `${base} ${shape} bg-blue-500 text-white`;
      }
      return `${base} ${shape} bg-white text-blue-500 hover:bg-blue-50`;
    },

    /* ========== BITWISE DAY TOGGLING ========== */
    toggleDay(day) {
      const bit = this.dayValues[day];
      const currentMask = this.localRelay.schedule.days_mask;
      const isSet = (currentMask & bit) === bit;
      if (isSet) {
        // Turn it OFF
        this.localRelay.schedule.days_mask = currentMask - bit;
      } else {
        // Turn it ON
        this.localRelay.schedule.days_mask = currentMask + bit;
      }
      this.emitChanges();
    },

    /* ========== EMIT CHANGES TO PARENT ========== */
    emitChanges() {
      // Ensure time fields have consistent names
      const updatedRelay = { ...this.localRelay };
      
      // Make sure schedule times are properly formatted
      if (updatedRelay.schedule) {
        // Create both field versions for backward compatibility
        updatedRelay.schedule.on_time = updatedRelay.schedule.time_on;
        updatedRelay.schedule.off_time = updatedRelay.schedule.time_off;
      }
      
      this.$emit("fields-updated", updatedRelay);
    },
  },
};
</script>

<style scoped>
/* Keep your existing style rules (plus the text-color from your example) */
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

/* Transition for schedule content toggling */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>