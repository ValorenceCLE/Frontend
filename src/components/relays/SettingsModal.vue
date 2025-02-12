<template>
  <div class="flex justify-center w-full mb-1">
    <div class="grid grid-cols-2 gap text-textColor w-full mr-10 ml-10 space-y-2 px-6 py-2">
      <!-- Row 1: Relay Name -->
      <div class="flex items-center justify-start">
        <label class="text-ModalLabel text-textColor">Relay Name:</label>
      </div>
      <input
        type="text"
        v-model="localRelay.name"
        class="border border-gray-400 rounded-md p-0.5"
        @input="emitChanges"
      />
      <!-- Row 2: Enabled -->
      <div class="flex items-center justify-start">
        <label class="text-ModalLabel text-textColor">Enabled:</label>
      </div>
      <select
        v-model="localRelay.enabled"
        class="border border-gray-400 rounded-md p-0.5"
        @change="emitChanges"
      >
        <option :value="true">True</option>
        <option :value="false">False</option>
      </select>
      <!-- Row 3: Power Up State -->
      <div class="flex items-center justify-start">
        <label class="text-ModalLabel text-textColor">Power Up State:</label>
      </div>
      <select
        v-model="localRelay.boot_state"
        class="border border-gray-400 rounded-md p-0.5"
        @change="emitChanges"
      >
        <option value="on">On</option>
        <option value="off">Off</option>
      </select>
      <!-- Row 4: Pulse Time -->
      <div class="flex items-center justify-start">
        <label class="text-ModalLabel text-textColor">Pulse Time:</label>
      </div>
      <input
        type="number"
        v-model="localRelay.pulse_time"
        class="border border-gray-400 rounded-md p-0.5"
        @input="emitChanges"
      />
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
    };
  },
  watch: {
    relay: {
      immediate: true,
      handler(newVal) {
        this.localRelay = { ...newVal };
      },
    },
  },
  methods: {
    emitChanges() {
      this.$emit("fields-updated", { ...this.localRelay });
    },
  },
};
</script>

<style scoped>
label {
  transform: translateY(0px);
}
input, select {
  font-size: 0.9rem;
  line-height: 0.9rem;
  font-weight: 500;
  color: #333;
}
option {
  font-size: 0.75rem;
  line-height: 1rem;
  font-weight: 500;
  color: #333;
}
input:focus,
select:focus {
  outline: none;
  border-color: rgba(51, 51, 51, 0.5);
  box-shadow: 0 0 0 0.75px rgba(51, 51, 51, 0.5);
}
</style>
