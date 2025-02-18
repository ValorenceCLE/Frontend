<template>
  <div class="flex flex-col items-center justify-center w-full h-full">
    <!-- Header -->
    <div
      class="w-full max-w-xl py-2 bg-gray-200 border border-gray-500 rounded-md text-center"
    >
      <h1 class="text-Header text-textColor">Relay Logic Management</h1>
      <p class="text-textColor text-ModayBody -mb-1">Manage your conditional tasks and relay logic here.</p>
    </div>

    <!-- Tasks Table -->
    <ConditionalTasksTable
      :tasks="conditionalTasks"
      :relays="relays"
      @editTask="editTask"
      @deleteTask="deleteTask"
      @openAddTask="openAddTaskModal"
    />

    <!-- Modal -->
    <TaskModal :show="showModal" :title="modalTitle" @close="closeModal">
      <TaskForm
        :initial-task="currentTask"
        :enabled-relays="enabledRelays"
        @task-submit="handleTaskSubmit"
        @cancel="closeModal"
      />
    </TaskModal>
  </div>
</template>

<script>
import ConditionalTasksTable from "./ConditionalTasksTable.vue";
import TaskModal from "./TaskModal.vue";
import TaskForm from "./TaskForm.vue";
import { getTasks, getEnabledRelays } from "@/api/getApi";
import { postTask, putTask } from "@/api/postApi";
import { deleteTask as apiDeleteTask } from "@/api/deleteApi";

export default {
  components: { ConditionalTasksTable, TaskModal, TaskForm },

  data() {
    return {
      relays: {}, // Stores relay data
      conditionalTasks: {}, // Stores tasks with their IDs as keys
      currentTask: null, // Stores task data for editing
      showModal: false, // Controls modal visibility
      modalTitle: "Add Conditional Task",
    };
  },

  computed: {
    enabledRelays() {
      return Object.values(this.relays).filter((relay) => relay.enabled);
    },
  },

  methods: {
    async fetchData() {
      try {
        const [relaysResponse, tasksResponse] = await Promise.all([
          getEnabledRelays(),
          getTasks(),
        ]);

        // Convert array to object where keys are relay IDs
        const relaysArray = relaysResponse.data || [];
        this.relays = Object.fromEntries(relaysArray.map((relay) => [relay.id, relay]));

        this.conditionalTasks = tasksResponse.data || {};

        console.log("Fetched relays:", this.relays); // Debugging
        console.log("Fetched tasks:", this.conditionalTasks);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    },

    openAddTaskModal() {
      this.currentTask = {
        name: "",
        trigger: { source: "", field: "", operator: "", value: "" },
        actions: [],
      };
      this.modalTitle = "Add Conditional Task";
      this.showModal = true;
    },

    closeModal() {
      this.showModal = false;
    },

    async handleTaskSubmit(task) {
      try {
        let response;

        if (this.currentTask && this.currentTask.id !== undefined) {
          // Update existing task
          response = await putTask(this.currentTask.id, task);
          if (response.success) {
            this.conditionalTasks[this.currentTask.id] = task; // Update task in memory
          }
        } else {
          // Create new task
          response = await postTask(task);
          if (response.success) {
            const newTaskId = response.data.id;
            this.conditionalTasks[newTaskId] = response.data;
          }
        }

        if (response.success) {
          this.closeModal(); // Close modal immediately
          console.log("Updated Tasks Object:", this.conditionalTasks);
        } else {
          console.error("Failed to save task:", response.error);
        }
      } catch (error) {
        console.error("Error saving task:", error);
      }
    },

    async deleteTask(taskId) {
      try {
        const response = await apiDeleteTask(taskId);
        if (response.success) {
          delete this.conditionalTasks[taskId]; // Remove task from memory
          console.log("Updated Tasks Object after delete:", this.conditionalTasks);
        } else {
          console.error("Failed to delete task:", response.error);
        }
      } catch (error) {
        console.error("Error deleting task:", error);
      }
    },

    editTask(task) {
      const taskId = Object.keys(this.conditionalTasks).find(
        (key) => this.conditionalTasks[key] === task
      );
      if (!taskId) {
        console.error("Task ID not found for editing.");
        return;
      }
      this.currentTask = { ...task, id: taskId };
      this.modalTitle = "Edit Conditional Task";
      this.showModal = true;
    },
  },

  mounted() {
    this.fetchData();
  },
};
</script>
