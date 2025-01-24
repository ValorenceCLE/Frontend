<template>
  <form @submit.prevent.stop="handleSubmit">
    <!-- Task Name Section -->
    <div class="mb-4">
      <label class="block text-Body text-textColor mb-1">Task Name:</label>
      <input
        v-model="task.name"
        type="text"
        placeholder="Enter task name"
        class="w-full border-gray-300 rounded-md p-2 shadow-sm"
        required
      />
    </div>

    <!-- Trigger Form -->
    <TriggerForm
      v-model="task.trigger"
      :field-options="availableFields"
      :enabled-relays="enabledRelays"
    />

    <!-- Actions Form -->
    <ActionsForm v-model="task.actions" :enabled-relays="enabledRelays" />

    <!-- Save and Cancel Buttons -->
    <div class="flex justify-end space-x-4 mt-6">
      <button
        type="submit"
        class="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
      >
        Save
      </button>
      <button
        type="button"
        @click="$emit('cancel')"
        class="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded"
      >
        Cancel
      </button>
    </div>
  </form>
</template>

<script>
import TriggerForm from "./TriggerForm.vue";
import ActionsForm from "./ActionsForm.vue";

export default {
  name: "TaskForm",
  components: { TriggerForm, ActionsForm },
  props: {
    initialTask: {
      type: Object,
      required: true,
    },
    enabledRelays: {
      type: Array,
      required: true,
    },
    fieldOptions: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      task: JSON.parse(JSON.stringify(this.initialTask)), // Deep copy to avoid mutations
    };
  },
  computed: {
    availableFields() {
      const source = this.task.trigger.source;
      if (!source) return [];
      const isRelay = this.enabledRelays.some((relay) => relay.id === source);
      if (isRelay) {
        return ["Volts", "Watts", "Amps"];
      }
      return this.fieldOptions[source] || [];
    },
  },
  methods: {
    handleSubmit() {
      console.log("Emitting submit with task:", this.task);
      this.$emit("task-submit", this.task);
    },
  },
  watch: {
    initialTask(newTask) {
      this.task = JSON.parse(JSON.stringify(newTask));
    },
  },
};
</script>

<style scoped>
/* Add any specific styles if necessary */
</style>
