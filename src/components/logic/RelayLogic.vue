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
    <div v-if="Object.keys(conditionalTasks).length" 
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
      conditionalTasks: {},
      currentTask: null,
      showModal: false,
      modalTitle: "Add Conditional Logic",
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
        if (!this.configStore.configData) {
          await this.configStore.fetchConfig();
        }
        this.relays = this.configStore.configData?.relays || {};
        this.conditionalTasks = this.configStore.configData?.tasks || {};
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
          this.conditionalTasks[this.currentTask.id] = task;
        } else {
          const newId =
            Math.max(0, ...Object.keys(this.conditionalTasks).map(Number)) + 1;
          this.conditionalTasks[newId] = { ...task };
        }
        this.configStore.configData.tasks = { ...this.conditionalTasks };
        await this.configStore.updateConfig({ ...this.configStore.configData });
        this.closeModal();
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
      } catch (error) {
        console.error("Error deleting task:", error);
      }
    },
    editTask(task) {
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

<style scoped>
/* We replicate the margin/padding from reference. 
   The main difference from your prior code is that 
   we rely on the same .bg-gray-200 .border approach. */
</style>
