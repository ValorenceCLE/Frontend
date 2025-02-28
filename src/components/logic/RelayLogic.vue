<template>
  <div class="flex flex-col items-center justify-center w-full h-full">
    <!-- Header -->
    <div
      class="w-full max-w-xl py-2 bg-gray-200 border border-gray-500 rounded-md text-center"
    >
      <h1 class="text-Header text-textColor">Relay Logic Management</h1>
      <p class="text-textColor text-ModayBody -mb-1">
        Manage your conditional tasks and relay logic here.
      </p>
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
        :field-options="globalFieldMapping"
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

import { useConfigStore } from "@/store/config";

export default {
  name: "RelayLogic",
  components: {
    ConditionalTasksTable,
    TaskModal,
    TaskForm,
  },

  data() {
    return {
      relays: {},               // local copy of store relays
      conditionalTasks: {},     // local copy of store tasks
      currentTask: null,        // active task for editing
      showModal: false,
      modalTitle: "Add Conditional Task",
      // Provide fieldOptions for TaskForm
      globalFieldMapping: {
        environment: ["Temperature", "Humidity"],
        network: ["Packet Loss (%)", "Latency"],
        cellular: ["SINR", "RSRP", "RSRQ"],
        mainPower: ["Volts", "Watts", "Amps"],
      },
    };
  },

  computed: {
    enabledRelays() {
      return Object.values(this.relays).filter((r) => r.enabled);
    },
  },

  methods: {
    async fetchData() {
      try {
        // If store is not loaded, fetch
        if (!this.configStore.configData) {
          await this.configStore.fetchConfig();
        }
        // Now read from store
        this.relays = this.configStore.configData?.relays || {};
        this.conditionalTasks = this.configStore.configData?.tasks || {};

        console.log("Fetched relays from store:", this.relays);
        console.log("Fetched tasks from store:", this.conditionalTasks);
      } catch (error) {
        console.error("Error fetching config store data:", error);
      }
    },

    openAddTaskModal() {
      this.currentTask = {
        name: "",
        source: "",
        field: "",
        operator: "",
        value: null,
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
        // If editing
        if (this.currentTask && this.currentTask.id !== undefined) {
          this.conditionalTasks[this.currentTask.id] = task;
        } else {
          // create new
          const newId =
            Math.max(0, ...Object.keys(this.conditionalTasks).map(Number)) + 1;
          this.conditionalTasks[newId] = { ...task };
        }

        // push changes to store
        this.configStore.configData.tasks = { ...this.conditionalTasks };
        await this.configStore.updateConfig({ ...this.configStore.configData });

        this.closeModal();
        console.log("Updated Tasks Object:", this.conditionalTasks);
      } catch (error) {
        console.error("Error saving task:", error);
      }
    },

    async deleteTask(taskId) {
      try {
        if (!this.conditionalTasks[taskId]) {
          console.error("Task not found:", taskId);
          return;
        }
        delete this.conditionalTasks[taskId];

        this.configStore.configData.tasks = { ...this.conditionalTasks };
        await this.configStore.updateConfig({ ...this.configStore.configData });

        console.log("Updated Tasks Object after delete:", this.conditionalTasks);
      } catch (error) {
        console.error("Error deleting task:", error);
      }
    },

    editTask(task) {
      // find the key
      const taskId = Object.keys(this.conditionalTasks).find(
        (k) => this.conditionalTasks[k] === task
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

  created() {
    this.configStore = useConfigStore();
  },

  mounted() {
    this.fetchData();
  },
};
</script>
