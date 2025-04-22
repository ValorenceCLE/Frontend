<template>
  <div class="flex flex-col items-center justify-center w-full h-full">
    <!-- Header bar: replicate style from RelaySetup.vue -->
    <div class="w-full py-2 bg-gray-200 border border-gray-500 rounded-md text-center" style="max-width:32rem;">
      <h1 class="text-ModalHeader text-textColor">Custom Logic Management</h1>
      <p class="text-gray-600 text-ModayBody -mb-1">
        Manage your custom conditional logic logic here.
      </p>
    </div>

    <!-- Tasks Table Card -->
    <div v-if="conditionalTasks.length" 
         class="bg-gray-200 rounded my-3 border-gray-500 border relative w-full max-w-3xl">
      <ConditionalTasksTable
        :tasks="conditionalTasks"
        :relays="relays"
        @editTask="editTask"
        @deleteTask="deleteTask"
        @openAddTask="openAddTaskModal"
      />
    </div>
    <p v-else class="text-center text-textColor">No conditional logic available.</p>

    <!-- Modal -->
    <TaskModal
      :show="showModal"
      :title="modalTitle"
      @close="closeModal"
    >
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
import { useConfigStore } from "@/store/config";
import ConditionalTasksTable from "./ConditionalTasksTable.vue";
import TaskModal from "./TaskModal.vue";
import TaskForm from "./TaskForm.vue";

export default {
  name: "RelayLogic",
  components: {
    ConditionalTasksTable,
    TaskModal,
    TaskForm,
  },
  data() {
    return {
      relays: {},
      conditionalTasks: [],
      currentTask: null,
      showModal: false,
      modalTitle: "Add Conditional Logic",
      globalFieldMapping: {
        environment: ["temperature", "humidity"],
        mainPower: ["volts", "watts", "amps"],
      },
    };
  },
  computed: {
    enabledRelays() {
      return Object.values(this.relays).filter((r) => r.enabled);
    },
  },
  methods: {
    // Simple UUID generator function
    generateUUID() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    },
    
    async fetchData() {
      try {
        if (!this.configStore.configData) {
          await this.configStore.fetchConfig();
        }
        this.relays = this.configStore.configData?.relays || {};
        this.conditionalTasks = this.configStore.configData?.tasks || [];
        
        // Ensure all tasks have an ID
        this.conditionalTasks = this.conditionalTasks.map(task => {
          if (!task.id) {
            return { ...task, id: this.generateUUID() };
          }
          return task;
        });
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
        if (this.currentTask && this.currentTask.id !== undefined) {
          // Update existing task - find index and replace
          const index = this.conditionalTasks.findIndex(t => t.id === this.currentTask.id);
          if (index !== -1) {
            // Create new array with updated task
            const updatedTasks = [...this.conditionalTasks];
            updatedTasks[index] = { ...task, id: this.currentTask.id };
            this.conditionalTasks = updatedTasks;
          }
        } else {
          // New task - generate a UUID
          const taskWithId = { ...task, id: this.generateUUID() };
          this.conditionalTasks = [...this.conditionalTasks, taskWithId];
        }
        this.configStore.configData.tasks = [...this.conditionalTasks];
        await this.configStore.updateConfig({ ...this.configStore.configData });
        this.closeModal();
      } catch (error) {
        console.error("Error saving task:", error);
      }
    },
    
    async deleteTask(taskId) {
      try {
        // Filter out the task with the given ID
        this.conditionalTasks = this.conditionalTasks.filter(task => task.id !== taskId);
        this.configStore.configData.tasks = [...this.conditionalTasks];
        await this.configStore.updateConfig({ ...this.configStore.configData });
      } catch (error) {
        console.error("Error deleting task:", error);
      }
    },
    
    editTask(task) {
      if (!task.id) {
        console.error("Task ID not found for editing.");
        return;
      }
      this.currentTask = { ...task };
      this.modalTitle = "Edit Custom Logic";
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