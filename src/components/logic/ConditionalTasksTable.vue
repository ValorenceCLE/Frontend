<template>
  <div
    class="w-full max-w-4xl bg-gray-200 rounded-lg shadow-md border border-gray-500 p-6 my-4"
  >
    <!-- Header Section within the Table -->
    <div class="flex justify-between items-center mb-4 px-4">
      <h2 class="text-Subheader text-textColor">Conditional Tasks</h2>
      <button
        @click="$emit('openAddTask')"
        class="bg-primaryMed hover:bg-primaryLight text-white py-2 px-4 rounded shadow flex items-center"
      >
        <img src="@/assets/icons/add.svg" alt="Add" class="w-4 h-4 mr-2" />
        Add Conditional Task
      </button>
    </div>
    <!-- Tasks Table -->
    <table class="w-full text-center border-collapse rounded-md">
      <thead>
        <tr class="bg-gray-200 border-b border-gray-300">
          <th class="py-3 px-4 text-textColor text-Subheader">Name</th>
          <th class="py-3 px-4 text-textColor text-Subheader">Trigger</th>
          <th class="py-3 px-4 text-textColor text-Subheader">Actions</th>
          <th class="py-3 px-4 text-textColor text-Subheader">Edit</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="task in tasks"
          :key="task.id"
          class="hover:bg-gray-100 border-t border-gray-300"
        >
          <!-- Task Name -->
          <td class="py-2 px-4 text-textColor">{{ task.name }}</td>
          <!-- Task Trigger -->
          <td class="py-2 px-4 text-textColor">{{ formatTrigger(task.trigger) }}</td>
          <!-- Task Actions displayed as a list -->
          <td class="py-2 px-4 text-textColor">
            <ul class="list-disc list-inside">
              <li v-for="action in task.actions" :key="action.id">
                {{ displayAction(action) }}
              </li>
            </ul>
          </td>
          <!-- Edit and Delete Buttons -->
          <td class="py-2 px-4 text-center flex justify-center space-x-2">
            <button
              @click="$emit('editTask', task)"
              class="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded"
            >
              <img src="@/assets/icons/edit.svg" alt="Edit" class="w-4 h-4" />
            </button>
            <button
              @click="$emit('deleteTask', task.id)"
              class="bg-red-500 hover:bg-red-600 text-white p-2 rounded"
            >
              <img src="@/assets/icons/trash.svg" alt="Delete" class="w-4 h-4" />
            </button>
          </td>
        </tr>
        <!-- Display message when there are no tasks -->
        <tr v-if="tasks.length === 0">
          <td colspan="4" class="py-4 text-center text-gray-600">
            No conditional tasks added yet.
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: "ConditionalTasksTable",
  props: {
    tasks: {
      type: Array,
      required: true,
    },
    formatTrigger: {
      type: Function,
      required: true,
    },
    displayAction: {
      type: Function,
      required: true,
    },
  },
};
</script>

<style scoped>
/* Add any specific styles if necessary */
</style>
