<template>
  <div>
    <!-- Section Header -->
    <div class="border-b border-gray-500">
      <h3 class="text-ModalInfo text-textColor px-2 py-1">Trigger</h3>
    </div>

    <!-- Two Columns: Left (Source, Operator), Right (Field, Value) -->
    <div class="grid grid-cols-2 gap-4 px-2 py-1">
      <!-- Left Column -->
      <div class="flex flex-col space-y-1.5">
        <!-- SOURCE -->
        <div class="flex items-center justify-between">
          <label class="text-ModalLabel text-textColor ml-2">
            Source:
          </label>
          <select v-model="trigger.source" @change="updateFieldOptions"
            class="border border-gray-400 rounded px-1 py-0.5 text-sm mr-2" style="width: 60%; text-align: left;"
            required>
            <option disabled value="">Select Source</option>
            <optgroup label="General">
              <option value="environmental">Environmental</option>
              <option value="main">Main Power</option>
            </optgroup>
            <optgroup label="Relay Power">
              <option v-for="relay in enabledRelays" :key="relay.id" :value="relay.id">
                {{ relay.name }}
              </option>
            </optgroup>
          </select>
        </div>

        <!-- OPERATOR -->
        <div class="flex items-center justify-between">
          <label class="text-ModalLabel text-textColor ml-2">
            Operator:
          </label>
          <select v-model="trigger.operator" class="border border-gray-400 rounded px-1 py-0.5 text-sm mr-2"
            style="width: 60%; text-align: left;" :disabled="!trigger.source" required>
            <option disabled value="">Select Operator</option>
            <option value=">">Greater (&gt;)</option>
            <option value="<">Less (&lt;)</option>
            <option value="=">Equal (=)</option>
            <option value="!=">Not Equal (!=)</option>
          </select>
        </div>
      </div>

      <!-- Right Column -->
      <div class="flex flex-col space-y-1.5">
        <!-- FIELD -->
        <div class="flex items-center justify-between">
          <label class="text-ModalLabel text-textColor ml-2">
            Field:
          </label>
          <select v-model="trigger.field" class="border border-gray-400 rounded px-1 py-0.5 text-sm mr-2"
            style="width: 60%; text-align: left;" :disabled="!trigger.source" required>
            <option disabled value="">Select Field</option>
            <option v-for="field in availableFields" :key="field" :value="field">
              {{ formatFieldLabel(field) }}
            </option>
          </select>
        </div>

        <!-- VALUE -->
        <div class="flex items-center justify-between">
          <label class="text-ModalLabel text-textColor ml-2">
            Value:
          </label>
          <input v-model.number="trigger.value" type="number"
            class="border border-gray-400 rounded px-1 py-0.5 text-sm mr-2" style="width: 60%; text-align: left;"
            placeholder="0" :disabled="!trigger.field" required />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "TriggerForm",
  props: {
    modelValue: { type: Object, required: true },
    enabledRelays: { type: Array, required: true },
    fieldOptions: { type: Object, required: true },
  },
  data() {
    return {
      availableFields: [],
    };
  },
  computed: {
    // The main task trigger object
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
      // If user picked a relay or main power, then show Volts/Watts/Amps
      const isRelay = this.enabledRelays.some(
        (relay) => relay.id === this.trigger.source
      );
      const isMainPower = this.trigger.source === "main";

      if (isRelay || isMainPower) {
        this.availableFields = ["volts", "watts", "amps"];
      } else {
        this.availableFields = this.fieldOptions[this.trigger.source] || [];
      }

      // Reset field if it is no longer in the list
      if (!this.availableFields.includes(this.trigger.field)) {
        this.trigger.field = "";
      }
    },
    formatFieldLabel(field) {
      if (!field) return '';
      // Replace underscores/dashes with spaces, capitalize each word
      return field.replace(/[-_]/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase())
        .replace(/\B\w/g, c => c.toLowerCase());
    },
  },
};
</script>

<style scoped>
/* 
  The outer container is .grid.grid-cols-2.gap-4
  Left column -> Source / Operator
  Right column -> Field / Value

  Each row uses a .flex with .justify-between, 
  so label is left, input is right.

  Inline style "width: 70%; text-align: right;" 
  ensures the input is more to the right side.
*/
</style>
