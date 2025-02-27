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

        <!-- Power Up State -->
        <div>
          <div class="grid grid-cols-2 items-center">
            <div class="flex items-center justify-start">
              <label class="text-ModalLabel text-textColor">Power Up State:</label>
            </div>
            <div>
              <select
                v-model="localRelay.boot_state"
                class="w-full border border-gray-500 rounded py-0.5 text-xs bg-white"
                @change="emitChanges"
              >
                <option value="on">On</option>
                <option value="off">Off</option>
              </select>
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
        
        <!-- Toggle for Enabled/Disabled -->
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
                <label class="text-ModalLabel text-textColor">Time On (24h):</label>
              </div>
              <div>
                <input
                  type="time"
                  placeholder="HH:mm"
                  format="HH:mm"
                  v-model="localRelay.schedule.time_on"
                  class="w-full border border-gray-500 rounded p-0.5 px-1 text-xs bg-white"
                  @input="emitChanges"
                />
              </div>
            </div>
          </div>

          <!-- Time Off -->
          <div>
            <div class="grid grid-cols-2 items-center">
              <div class="flex items-center justify-start">
                <label class="text-ModalLabel text-textColor">Time Off (24h):</label>
              </div>
              <div>
                <input
                  type="time"
                  placeholder="HH:mm"
                  format="HH:mm"
                  v-model="localRelay.schedule.time_off"
                  class="w-full border border-gray-500 rounded p-0.5 px-1 text-xs bg-white"
                  @input="emitChanges"
                />
              </div>
            </div>
          </div>

          <!-- Days of Week (Bitwise Buttons) -->
          <div>
            <div class="grid grid-cols-2 items-center">
              <div class="flex items-center justify-start">
                <label class="text-ModalLabel text-textColor">Days of Week:</label>
              </div>
              <div>
                <!-- We'll display the days in a single row, rounding only the first/last button -->
                <div class="inline-flex">
                  <button
                    v-for="(day, idx) in daysList"
                    :key="day"
                    type="button"
                    @click="toggleDay(day)"
                    :class="[
                      'px-2 py-1 border border-gray-300 text-sm font-semibold hover:bg-blue-50 focus:outline-none',
                      dayButtonClass(day),
                      idx === 0 ? 'rounded-l' : '',
                      idx === daysList.length - 1 ? 'rounded-r' : ''
                    ]"
                  >
                    {{ day }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>

  </div>
</template>

<script>
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
      // We'll use the same day order you had before:
      daysList: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      // For convenience, we store each day’s bit value in a lookup
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
  watch: {
    // Whenever the parent 'relay' prop changes, copy it into localRelay.
    relay: {
      immediate: true,
      handler(newVal) {
        // If the parent is updated with the newly typed times, we won't lose them.
        // If parent never updates, we re-initialize to empty each time the prop changes.
        this.localRelay = {
          ...newVal,
          schedule: {
            enabled: newVal.schedule?.enabled ?? false,
            time_on: newVal.schedule?.on_time || "",
            time_off: newVal.schedule?.off_time || "",
            // If days_mask is undefined, default to 0
            days_mask: newVal.schedule?.days_mask ?? 0
          },
        };
      },
    },
  },
  methods: {
    /* ========== SCHEDULE ENABLE / DISABLE ========== */
    setScheduleEnabled(value) {
      this.localRelay.schedule.enabled = value;
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

    /* ========== BITWISE DAY TOGGLING ========== */
    toggleDay(day) {
      const bit = this.dayValues[day];
      const currentMask = this.localRelay.schedule.days_mask;
      // Check if it's already set
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
    dayButtonClass(day) {
      const bit = this.dayValues[day];
      const currentMask = this.localRelay.schedule.days_mask;
      // If the bit is set, add a highlight class
      if ((currentMask & bit) === bit) {
        return "btn-sel bg-green-400 text-white border-green-400";
      }
      return "";
    },

    /* ========== EMIT CHANGES TO PARENT ========== */
    emitChanges() {
      // This sends the entire localRelay object (including schedule.days_mask, time_on, time_off)
      this.$emit("fields-updated", { ...this.localRelay });
    },
  },
};
</script>

<style scoped>
/* Keep your existing style rules: */
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

/* This class is toggled on selected day buttons: */
.btn-sel {
  background-color: #4ade80; /* or your green preference */
  color: white;
  border-color: #4ade80;
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
