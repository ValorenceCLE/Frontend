<template>
  <div class="w-full">
    <!-- Table Header (similar to RelaySetup.vue) -->
    

    <!-- Actual Table -->
    <table class="w-full text-center border-collapse rounded overflow-hidden">
      <thead>
        <tr class="bg-gray-200 border-b border-gray-400">
          <th class="px-2 py-1 text-textColor text-Subheader">Name</th>
          <th class="px-2 py-1 text-textColor text-Subheader">Trigger</th>
          <th class="px-2 py-1 text-textColor text-Subheader">Actions</th>
          <th class="px-2 py-1 text-textColor text-Subheader">Edit</th>
        </tr>
      </thead>
      <tbody class="text-textColor">
        <tr v-for="(task, id) in tasks" :key="id" class="hover:bg-gray-100 border-t border-gray-300">
          <td class="py-0.5 text-Body">{{ task.name }}</td>
          <td class="py-0.5 text-Body">{{ getFormattedTrigger(task) }}</td>
          <td class="py-0.5 text-Body">
            <ul class="list-disc list-inside">
              <li v-for="(action, idx) in getFormattedActions(task)" :key="idx">
          {{ action }}
              </li>
            </ul>
          </td>
            <td class=" flex justify-center items-center space-x-1 m-1">
            <button
              @click="$emit('editTask', task)"
              class="bg-primaryMed hover:bg-primaryLight text-white p-2 rounded flex items-center justify-center"
            >
              <img src="@/assets/icons/edit.svg" alt="Edit" class="w-4 h-4 invert" />
            </button>
            <button
              @click="$emit('deleteTask', id)"
              class="bg-relayStatusred hover:bg-red-700 text-white p-2 rounded flex items-center justify-center"
            >
              <img src="@/assets/icons/trash.svg" alt="Delete" class="w-4 h-4 invert" />
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="flex justify-center items-center border-t border-gray-500 py-1.5">
      <button
        class="bg-primaryMed hover:bg-primaryLight text-white py-1.5 px-3 w-fit rounded flex items-center text-AddTask"
        @click="$emit('openAddTask')"
      >
        <img src="@/assets/icons/add.svg" alt="Add" class="w-5 h-5 mr-2 -ml-1 invert"/>
        Add Task
      </button>
    </div>
  </div>
</template>

<script>
import { formatTrigger, formatActions } from "@/utils/formatters";

export default {
  name: "ConditionalTasksTable",
  props: {
    tasks: { type: Object, required: true },
    relays: { type: Object, required: true },
  },
  methods: {
    getFormattedTrigger(task) {
      return formatTrigger(task, this.relays);
    },
    getFormattedActions(task) {
      return formatActions(task.actions || [], this.relays);
    },
  },
};
</script>

<style scoped>

</style>
