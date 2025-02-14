<template>
  <!-- OUTER container to match DashboardModal -->
  <div class="px-4 py-2 mx-auto" style="max-width: 40rem;">
    
    <!-- ============ PHYSICAL SETTINGS CARD ============ -->
    <div class="bg-gray-100 border border-gray-500 rounded">
      <div class="border-b border-gray-500 px-4 py-2 flex justify-between items-center">
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
                class="w-full border border-gray-500 rounded p-0.5 text-xs bg-white"
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
                class="w-full border border-gray-500 rounded p-0.5 text-xs bg-white"
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
                class="w-full border border-gray-500 rounded p-0.5 text-xs bg-white"
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
              <label class="text-ModalLabel text-textColor">Pulse Time:</label>
            </div>
            <div>
              <input
                type="number"
                v-model="localRelay.pulse_time"
                class="w-full border border-gray-500 rounded p-0.5 text-xs bg-white"
                @input="emitChanges"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ============ SCHEDULE CARD ============ -->
    <div class="bg-gray-100 border border-gray-500 rounded mt-4">
      <div class="border-b border-gray-500 px-4 py-2 flex justify-between items-center">
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
                  format="HH:mm"
                  v-model="localRelay.schedule.time_on"
                  class="w-full border border-gray-500 rounded p-0.5 text-xs bg-white"
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
                  format="HH:mm"
                  v-model="localRelay.schedule.time_off"
                  class="w-full border border-gray-500 rounded p-0.5 text-xs bg-white"
                  @input="emitChanges"
                />
              </div>
            </div>
          </div>

          <!-- Days of Week -->
          <div>
            <div class="grid grid-cols-2 items-center">
              <div class="flex items-center justify-start">
                <label class="text-ModalLabel text-textColor">Days of Week:</label>
              </div>
              <div>
                <div class="flex flex-wrap gap-2">
                  <label
                    v-for="(day, idx) in daysList"
                    :key="idx"
                    class="flex items-center space-x-1 text-xs"
                  >
                    <input
                      type="checkbox"
                      :value="day"
                      v-model="localRelay.schedule.days"
                      @change="emitChanges"
                    />
                    <span>{{ day }}</span>
                  </label>
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
      daysList: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    };
  },
  watch: {
    // Whenever the parent 'relay' prop changes, copy it into localRelay
    relay: {
      immediate: true,
      handler(newVal) {
        // Make a shallow or deep copy
        this.localRelay = {
          ...newVal,
          schedule: {
            enabled: newVal.schedule?.enabled ?? false,
            time_on: newVal.schedule?.time_on || "",
            time_off: newVal.schedule?.time_off || "",
            days: newVal.schedule?.days || [],
          },
        };
      },
    },
  },
  methods: {
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
    emitChanges() {
      // Send the entire localRelay object back up
      this.$emit("fields-updated", { ...this.localRelay });
    },
  },
};
</script>

<style scoped>
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
