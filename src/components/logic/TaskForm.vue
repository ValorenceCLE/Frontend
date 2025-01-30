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
      v-model="task"
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
      task: this.initializeTask(this.initialTask), // Initialize task structure
    };
  },
  computed: {
    availableFields() {
      const source = this.task.source;
      if (!source) return [];
      const isRelay = this.enabledRelays.some((relay) => relay.id === source);
      return isRelay ? ["Volts", "Watts", "Amps"] : this.fieldOptions[source] || [];
    },
  },
  methods: {
    /**
     * Initializes the task object to ensure it matches the expected structure.
     * @param {Object} task - The initial task object.
     * @returns {Object} - The initialized task object.
     */
    initializeTask(task) {
      return {
        id: task.id || null,
        name: task.name || "",
        source: task.source || "",
        field: task.field || "",
        operator: task.operator || "",
        value: task.value !== undefined ? task.value : null,
        actions: task.actions ? JSON.parse(JSON.stringify(task.actions)) : [],
      };
    },
    /**
     * Handles the task form submission and emits the updated task.
     */
    handleSubmit() {
      this.$emit("task-submit", JSON.parse(JSON.stringify(this.task)));
    },
  },
  watch: {
    /**
     * Watches for changes in the initial task and updates the form.
     */
    initialTask(newTask) {
      this.task = this.initializeTask(newTask);
    },
  },
};
</script>

<style scoped>
/* Add any specific styles if necessary */
</style>
