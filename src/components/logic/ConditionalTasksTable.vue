<template>
  <div
    v-if="Object.keys(tasks).length"
    class="w-full max-w-4xl bg-gray-200 rounded-md shadow border border-gray-500 mt-2"
  >
    <div class="flex justify-between items-center m-2 ">
      <h2 class="text-Subheader text-textColor">Conditional Tasks</h2>
      <button
        @click="$emit('openAddTask')"
        class="bg-primaryMed hover:bg-primaryLight text-white py-2 px-4 rounded shadow flex items-center text-ModalLabel"
        
      >
        <img src="@/assets/icons/add.svg" alt="Add" class="w-5 h-5 -ml-2 mr-2" style="filter: brightness(0); filter: invert(1);"/>
        Add Conditional Task
      </button>
    </div>
    <table class="w-full text-center border-collapse rounded-md">
      <thead>
        <tr class="bg-gray-200 border-b border-gray-500">
          <th class="px-2 text-textColor text-Subheader">Name</th>
          <th class="px-2 text-textColor text-Subheader">Trigger</th>
          <th class="px-2 text-textColor text-Subheader">Actions</th>
          <th class="px-2 text-textColor text-Subheader">Edit</th>
        </tr>
      </thead>
      <tbody class="text-textColor">
        <tr v-for="(task, id) in tasks" :key="id">
          <td class="py-1.5 px-3">{{ task.name }}</td>
          <td class="py-1.5 px-3">
            {{ getFormattedTrigger(task) }}
          </td>
          <td class="py-1.5 px-3">
            <ul class="list-disc list-inside">
              <li v-for="(action, index) in getFormattedActions(task)" :key="index">
                {{ action }}
              </li>
            </ul>
          </td>
          <td class="py-1.5 px-3 flex justify-center space-x-1">
            <button
              @click="$emit('editTask', task)"
              class="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded"
            >
              <img src="@/assets/icons/edit.svg" alt="Edit" class="w-4 h-4" />
            </button>
            <button
              @click="$emit('deleteTask', id)"
              class="bg-red-500 hover:bg-red-600 text-white p-2 rounded"
            >
              <img src="@/assets/icons/trash.svg" alt="Delete" class="w-4 h-4" />
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <p v-else class="text-center text-textColor">No conditional tasks available.</p>
</template>

<script>
import { formatTrigger, formatActions } from "@/utils/formatters";

export default {
  name: "ConditionalTasksTable",
  props: {
    tasks: { type: Object, required: true },
    relays: { type: Object, required: true },
  },
  data() {
    return {
      // Field options mapping for general sources
      fieldOptionsMapping: {
        environment: ["Temperature", "Humidity"],
        network: ["Packet Loss (%)", "Latency"],
        cellular: ["SINR", "RSRP", "RSRQ"],
        mainPower: ["Volts", "Watts", "Amps"],
      },
    };
  },
  methods: {
    /**
     * Formats a trigger using the formatter and field options.
     * @param {Object} task - The task object (contains source, field, operator, value).
     * @returns {string} - Formatted trigger string.
     */
    getFormattedTrigger(task) {
      if (!task || typeof task !== "object") {
        console.warn("Task is undefined or not an object:", task);
        return "Invalid Trigger";
      }

      console.log("Formatting trigger for task:", task);

      return formatTrigger(task, this.relays, this.fieldOptionsMapping);
    },
    getFormattedActions(task) {
      return formatActions(task.actions, this.relays);
    },
  },
};
</script>
