<template>
  <div class="mb-4">
    <h3 class="text-Subheader text-textColor border-b border-gray-500 pb-2">Trigger</h3>
    <div class="flex flex-col md:flex-row md:space-x-4 mt-4 space-y-4 md:space-y-0">
      <!-- Source Dropdown -->
      <div class="flex-1">
        <label class="block text-Body text-textColor mb-1">Source:</label>
        <select
          v-model="trigger.source"
          @change="updateFieldOptions"
          class="w-full border-gray-300 rounded-md p-2 shadow-sm"
          required
        >
          <option disabled value="">Select a source</option>
          <optgroup label="General">
            <option value="environment">Environment</option>
            <option value="network">Network</option>
            <option value="cellular">Cellular</option>
            <option value="mainPower">Main Power</option>
          </optgroup>
          <optgroup label="Relay Power">
            <option v-for="relay in enabledRelays" :key="relay.id" :value="relay.id">
              {{ relay.name }}
            </option>
          </optgroup>
        </select>
      </div>

      <!-- Field Dropdown -->
      <div class="flex-1">
        <label class="block text-Body text-textColor mb-1">Field:</label>
        <select
          v-model="trigger.field"
          class="w-full border-gray-300 rounded-md p-2 shadow-sm"
          :disabled="!trigger.source"
          required
        >
          <option disabled value="">Select a field</option>
          <option v-for="field in availableFields" :key="field" :value="field">
            {{ field }}
          </option>
        </select>
      </div>

      <!-- Operator Dropdown -->
      <div class="flex-1">
        <label class="block text-Body text-textColor mb-1">Operator:</label>
        <select
          v-model="trigger.operator"
          class="w-full border-gray-500 rounded-md p-2 shadow-sm"
          :disabled="!trigger.field"
          required
        >
          <option disabled value="">Select operator</option>
          <option value=">">Greater Than (&gt;)</option>
          <option value="<">Less Than (&lt;)</option>
          <option value="=">=</option>
          <option value="!=">!=</option>
        </select>
      </div>

      <!-- Value Input -->
      <div class="flex-1">
        <label class="block text-Body text-textColor mb-1">Value:</label>
        <input
          v-model.number="trigger.value"
          type="number"
          placeholder="Enter value"
          class="w-full border-gray-300 rounded-md p-2 shadow-sm"
          :disabled="!trigger.operator"
          required
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "TriggerForm",
  props: {
    modelValue: {
      type: Object,
      required: true,
    },
    enabledRelays: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      availableFields: [],
      // Move field mapping directly into this component
      fieldOptionsMapping: {
        environment: ["Temperature", "Humidity"],
        network: ["Packet Loss (%)", "Latency"],
        cellular: ["SINR", "RSRP", "RSRQ"],
        mainPower: ["Volts", "Watts", "Amps"],
      },
    };
  },
  computed: {
    trigger: {
      get() {
        return this.modelValue;
      },
      set(val) {
        this.$emit("update:modelValue", val);
      },
    },
  },
  watch: {
    // Ensure fields are updated when a new task loads
    modelValue: {
      immediate: true,
      handler() {
        this.updateFieldOptions();
      },
    },
    "trigger.source": {
      immediate: true,
      handler() {
        this.updateFieldOptions();
      },
    },
  },
  methods: {
    updateFieldOptions() {
      if (!this.trigger.source) {
        this.availableFields = [];
        return;
      }

      const isRelay = this.enabledRelays.some(
        (relay) => relay.id === this.trigger.source
      );

      this.availableFields = isRelay
        ? ["Volts", "Watts", "Amps"]
        : this.fieldOptionsMapping[this.trigger.source] || [];

      // Reset field if it's not in the new available fields
      if (!this.availableFields.includes(this.trigger.field)) {
        this.trigger.field = "";
      }
    },
  },
};
</script>

<style scoped>
/* Add any specific styles if necessary */
</style>
