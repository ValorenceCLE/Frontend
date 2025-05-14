<!-- src/components/logic/TaskForm.vue -->
<template>
  <form @submit.prevent="handleSaveAndExit" class="space-y-2">
    <!-- TASK NAME -->
    <div class="bg-gray-100 border border-gray-500 rounded">
      <div class="border-b border-gray-500">
        <h3 class="text-ModalInfo text-textColor px-2 py-1">Information</h3>
      </div>
      <div class="grid grid-cols-2 items-center px-2 py-1">
        <label class="text-ModalLabel text-textColor text-left ml-2">Name:</label>
        <input
          v-model="task.name"
          type="text"
          class="w-full border border-gray-500 rounded p-0.5 text-sm bg-white pl-1"
          required
        />
      </div>
    </div>

    <!-- TRIGGER FORM -->
    <div class="bg-gray-100 border border-gray-500 rounded">
      <TriggerForm
        v-model="task"
        :field-options="fieldOptions"
        :enabled-relays="enabledRelays"
      />
    </div>

    <!-- ACTIONS FORM -->
    <div class="bg-gray-100 border border-gray-500 rounded">
      <ActionsForm
        v-model="task.actions"
        :enabled-relays="enabledRelays"
      />
    </div>

    <!-- SINGLE BUTTON: "Save & Exit" -->
    <div>
      <div class="flex justify-center text-ModalButton">
        <button
          type="submit"
          class="bg-primaryMed hover:bg-primaryLight text-white 
                 rounded-md px-2 py-0.5 w-auto flex items-center justify-center"
        >
          <span style="transform: translateY(-1px)">Save & Exit</span>
        </button>
      </div>
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
    initialTask: { type: Object, required: true },
    enabledRelays: { type: Array, required: true },
    fieldOptions: { type: Object, required: true },
  },
  data() {
    return {
      task: this.initializeTask(this.initialTask),
    };
  },
  methods: {
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
    // Merges "save" and "cancel" logic: after saving, we also emit "cancel" to exit.
    handleSaveAndExit() {
      // 1) Emit the updated task
      this.$emit("task-submit", JSON.parse(JSON.stringify(this.task)));
      // 2) Then close this form (like "Exit")
      this.$emit("cancel");
    },
  },
  watch: {
    initialTask(newVal) {
      this.task = this.initializeTask(newVal);
    },
  },
};
</script>
