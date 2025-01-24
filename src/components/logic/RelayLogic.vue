<template>
  <div class="flex flex-col items-center justify-center w-full h-full">
    <!-- Separate Page Header -->
    <div
      class="w-full max-w-xl p-3 bg-gray-200 border border-gray-500 rounded-md text-center"
    >
      <h1 class="text-3xl font-bold text-textColor">Relay Logic Management</h1>
      <p class="text-gray-600">Manage your conditional tasks and relay logic here.</p>
    </div>

    <!-- Conditional Tasks Table -->
    <ConditionalTasksTable
      :tasks="Object.values(conditionalTasks)"
      :formatTrigger="formattedTrigger"
      :displayAction="formattedAction"
      @editTask="editTask"
      @deleteTask="deleteTask"
      @openAddTask="openAddTaskModal"
    />

    <!-- Add/Edit Task Modal -->
    <TaskModal :show="showModal" :title="modalTitle" @close="closeModal">
      <TaskForm
        :initial-task="currentTask"
        :enabled-relays="enabledRelays"
        :field-options="fieldOptionsMapping"
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
import DummyAPI from "@/api/dummyApi";
import { formatTrigger, displayAction } from "./helper.js";

export default {
  name: "RelayLogic",
  components: {
    ConditionalTasksTable,
    TaskModal,
    TaskForm,
  },
  data() {
    return {
      relays: {}, // Relay data fetched from API
      conditionalTasks: {}, // Changed from [] to {}
      currentTask: {
        id: null, // Unique identifier for tasks
        name: "",
        trigger: { source: "", field: "", operator: "", value: "" }, // Updated trigger structure
        actions: [
          {
            id: 1, // Action IDs are 1, 2, or 3
            type: "",
            state: "",
            message: "",
            target: "",
          },
        ],
      },
      showModal: false, // Controls the visibility of the modal
      modalTitle: "Add Conditional Task", // Dynamic title for the modal
      // Define mapping for fields based on source
      fieldOptionsMapping: {
        environment: ["Temperature", "Humidity"],
        network: ["Packet Loss (%)", "Latency"],
        cellular: ["SINR", "RSRP", "RSRQ"],
        mainPower: ["Volts", "Watts", "Amps"],
        // Any other source (relay IDs) will default to ["Volts", "Watts", "Amps"]
      },
    };
  },
  computed: {
    /**
     * Returns only the enabled relays.
     * If 'enabled' property is missing, treats relay as enabled.
     * @returns {Array} - List of enabled relay objects with their IDs.
     */
    enabledRelays() {
      return Object.entries(this.relays)
        .filter(([key, relay]) => relay.enabled !== false) // Treat undefined as enabled
        .map(([key, relay]) => ({ id: key, ...relay }));
    },
    /**
     * Computes available fields for triggers based on the selected source.
     */
    availableFields() {
      const source = this.currentTask.trigger.source;
      if (!source) return [];
      const isRelay = this.enabledRelays.some((relay) => relay.id === source);
      if (isRelay) {
        return ["Volts", "Watts", "Amps"];
      }
      return this.fieldOptionsMapping[source] || [];
    },
    /**
     * Helper to format triggers using external helper function.
     */
    formattedTrigger() {
      return (trigger) => formatTrigger(trigger, this.relays, this.isRelayAction);
    },
    /**
     * Helper to format actions using external helper function.
     */
    formattedAction() {
      return (action) => displayAction(action, this.relays, this.isRelayAction);
    },
    /**
     * Determines if the current task is being edited.
     * @returns {Boolean} - True if editing, else false.
     */
    isEditing() {
      return this.currentTask.id !== null;
    },
  },
  methods: {
    /**
     * Handles the task submit event by delegating to saveTask.
     * @param {Object} task - The task object to save.
     */
    handleTaskSubmit(task) {
      this.saveTask(task);
    },

    /**
     * Fetches relay data from the API.
     */
    async fetchRelays() {
      try {
        const response = DummyAPI.get("/api/relaySetup");
        if (response.success) {
          this.relays = response.data || {};
        } else {
          console.error("Failed to fetch relays:", response.error);
        }
      } catch (error) {
        console.error("Error fetching relays:", error);
      }
    },

    /**
     * Fetches conditional tasks from the API.
     * Migrates tasks from 'triggers' array to 'trigger' object if necessary.
     */
    async fetchConditionalTasks() {
      try {
        const response = await DummyAPI.get("/api/conditionalTasks");
        if (response.success) {
          // Assuming response.data is { "tasks": { "1": {...}, "2": {...} } }
          this.conditionalTasks = response.data.tasks || {};
          // Save to localStorage if needed
          localStorage.setItem("conditionalTasks", JSON.stringify(this.conditionalTasks));
        } else {
          console.error("Failed to fetch conditional tasks:", response.error);
        }
      } catch (error) {
        console.error("Error fetching conditional tasks:", error);
      }
    },
    /**
     * Opens the modal to add a new task.
     */
    openAddTaskModal() {
      this.currentTask = {
        id: null, // Will be assigned by DummyAPI
        name: "",
        trigger: { source: "", field: "", operator: "", value: "" },
        actions: [
          {
            id: 1, // Initialize with ID=1
            type: "",
            state: "",
            message: "",
            target: "",
          },
        ],
      };
      this.modalTitle = "Add Conditional Task";
      this.showModal = true;
    },

    /**
     * Closes the modal.
     */
    closeModal() {
      this.showModal = false;
    },

    /**
     * Saves the task, either by adding a new one or updating an existing one.
     * Logs the JSON response excluding empty fields.
     */
    async saveTask(task) {
      console.log("Received Task:", task);

      // Minimal validation (since dropdowns control inputs)
      const isValidTask =
        task &&
        typeof task === "object" &&
        task.name &&
        task.trigger &&
        task.trigger.source &&
        task.trigger.field &&
        task.trigger.operator &&
        task.trigger.value !== undefined &&
        task.trigger.value !== null &&
        Array.isArray(task.actions) &&
        task.actions.length > 0;

      if (!isValidTask) {
        console.error("Invalid task data:", task);
        return;
      }

      try {
        if (task.id && this.isEditing) {
          // Editing an existing task
          const payload = {
            tasks: {
              [task.id]: task,
            },
          };

          const response = await DummyAPI.put(
            `/api/conditionalTasks/${task.id}`,
            payload
          );
          if (response.success) {
            // Update local tasks
            this.conditionalTasks = {
              ...this.conditionalTasks,
              [task.id]: response.data.tasks[task.id],
            };
            console.log(
              "Updated Task:",
              JSON.stringify(this.cleanObject(response.data.tasks[task.id]), null, 2)
            );
            this.closeModal();
          } else {
            console.error("Failed to update task:", response.error);
          }
        } else {
          // Adding a new task
          // Assign unique IDs to actions based on their position
          task.actions = task.actions.map((action, index) => ({
            ...action,
            id: index + 1, // Assign ID=1,2,3
          }));

          // Clean task object before saving
          const cleanedTask = this.cleanTaskForSaving(task);

          // Prepare payload without an ID (assuming backend assigns it)
          const payload = {
            tasks: {
              new: cleanedTask,
            },
          };

          const response = await DummyAPI.post("/api/conditionalTasks", payload);
          if (response.success) {
            // Assume backend returns the new task with its assigned ID
            const newTask = Object.values(response.data.tasks)[0]; // get the task
            const newTaskId = newTask.id;

            // Add to conditionalTasks
            this.conditionalTasks = {
              ...this.conditionalTasks,
              [newTaskId]: newTask,
            };
            console.log(
              "Added Task:",
              JSON.stringify(this.cleanObject(newTask), null, 2)
            );
            this.closeModal();
          } else {
            console.error("Failed to add task:", response.error);
          }
        }
      } catch (error) {
        console.error("Error saving task:", error);
      }
    },
    /**
     * Deletes a task without any confirmation prompt.
     * @param {Number} taskId - The ID of the task to delete.
     */
    async deleteTask(taskId) {
      try {
        const response = await DummyAPI.delete(`/api/conditionalTasks/${taskId}`);
        if (response.success) {
          // Remove the task from the object using destructuring
          const { [taskId]: _, ...remainingTasks } = this.conditionalTasks;
          this.conditionalTasks = remainingTasks;
          // Optionally log deletion
          console.log(`Deleted Task ID: ${taskId}`);
        } else {
          console.error("Failed to delete task:", response.error);
        }
      } catch (error) {
        console.error("Error deleting task:", error);
      }
    },

    /**
     * Opens the modal to edit an existing task.
     * @param {Object} task - The task object to edit.
     */
    editTask(task) {
      this.currentTask = JSON.parse(JSON.stringify(task)); // Deep copy to avoid direct mutations
      this.modalTitle = "Edit Conditional Task";
      this.showModal = true;
    },

    /**
     * Checks if the action type corresponds to a relay action.
     * @param {String} actionType - The type of the action.
     * @returns {Boolean} - True if relay action, else false.
     */
    isRelayAction(actionType) {
      return this.enabledRelays.some((relay) => relay.id === actionType);
    },

    /**
     * Cleans an object by removing empty or null fields.
     * Recursively processes nested objects and arrays.
     * @param {Object} obj - The object to clean.
     * @returns {Object} - The cleaned object.
     */
    cleanObject(obj) {
      if (Array.isArray(obj)) {
        // Recursively clean each item in the array
        return obj
          .map((item) => this.cleanObject(item))
          .filter((item) => Object.keys(item).length > 0);
      } else if (typeof obj === "object" && obj !== null) {
        const cleaned = {};
        Object.keys(obj).forEach((key) => {
          const value = this.cleanObject(obj[key]);
          if (value !== undefined && value !== null && value !== "") {
            cleaned[key] = value;
          }
        });
        return cleaned;
      }
      return obj;
    },

    /**
     * Cleans the task object before saving by removing empty fields.
     * Ensures that 'trigger' is an object, not an array.
     * @param {Object} task - The task object to clean.
     * @returns {Object} - The cleaned task object.
     */
    cleanTaskForSaving(task) {
      // Ensure trigger is an object and not an array
      if (Array.isArray(task.trigger)) {
        task.trigger = task.trigger[0] || {
          source: "",
          field: "",
          operator: "",
          value: "",
        };
      }
      return this.cleanObject(task);
    },
  },
  mounted() {
    // Fetch initial data when component is mounted
    this.fetchRelays();
    this.fetchConditionalTasks();
  },
};
</script>

<style scoped>
/* Ensure table headers and cells are centered */
th,
td {
  text-align: center;
}

/* Modal content padding and scroll behavior */
/* Reduced padding to prevent overlapping */
.modal-content {
  padding-top: 2rem;
  padding-bottom: 2rem;
}

/* Border between Actions section and buttons */
.border-t {
  border-top: 1px solid #d1d5db; /* Tailwind gray-300 */
}

/* Centering buttons */
.save-cancel-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

/* Ensure the modal does not overflow the viewport and menus open downward */
.modal-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Responsive adjustments for trigger section */
@media (max-width: 768px) {
  .trigger-section {
    flex-direction: column;
  }
}
</style>
