<template>
  <div class="flex flex-col items-center justify-center w-full h-full">
    <!-- Page Header -->
    <div
      class="bg-gray-200 p-4 rounded-lg shadow-md border border-gray-500 max-w-md flex justify-center items-center mx-auto w-full"
    >
      <h1 class="text-Header text-textColor">Custom Logic</h1>
    </div>

    <!-- Conditional Tasks Table -->
    <div
      class="w-full max-w-4xl bg-gray-200 rounded-lg shadow-md border border-gray-500 p-6 my-4"
    >
      <div class="flex justify-between items-center mb-4 px-4">
        <h2 class="text-Subheader text-textColor">Conditional Tasks</h2>
        <!-- Button to open the Add Task modal -->
        <button
          @click="openAddTaskModal"
          class="bg-primaryMed hover:bg-primaryLight text-white py-2 px-4 rounded shadow flex items-center"
        >
          <img src="@/assets/icons/add.svg" alt="Add" class="w-4 h-4 mr-2" />
          Add Conditional Task
        </button>
      </div>
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
            v-for="task in conditionalTasks"
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
                @click="editTask(task)"
                class="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded"
              >
                <img src="@/assets/icons/edit.svg" alt="Edit" class="w-4 h-4" />
              </button>
              <button
                @click="deleteTask(task.id)"
                class="bg-red-500 hover:bg-red-600 text-white p-2 rounded"
              >
                <img src="@/assets/icons/trash.svg" alt="Delete" class="w-4 h-4" />
              </button>
            </td>
          </tr>
          <!-- Display message when there are no tasks -->
          <tr v-if="conditionalTasks.length === 0">
            <td colspan="4" class="py-4 text-center text-gray-600">
              No conditional tasks added yet.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add/Edit Task Modal -->
    <Modal :show="showModal" :title="modalTitle" @close="closeModal">
      <div class="py-2 max-h-[80vh] overflow-auto">
        <!-- Task Name Section -->
        <div class="mb-4">
          <h2 class="text-Subheader text-textColor border-b border-gray-500 pb-2">
            Task Name
          </h2>
          <input
            v-model="currentTask.name"
            type="text"
            placeholder="Enter task name"
            class="mt-2 w-full border-gray-300 rounded-md p-2 shadow-sm text-Form"
          />
        </div>

        <!-- Trigger Section -->
        <div class="mb-4">
          <h2 class="text-Subheader text-textColor border-b border-gray-500 pb-2">
            Trigger
          </h2>
          <div class="flex flex-col md:flex-row md:space-x-4 mt-4 space-y-4 md:space-y-0">
            <!-- Source Dropdown -->
            <div class="flex-1">
              <label class="block text-Body text-textColor mb-1">Source:</label>
              <select
                v-model="currentTask.trigger.source"
                class="w-full border-gray-300 rounded-md p-2 shadow-sm"
              >
                <option disabled value="">Select a source</option>
                <optgroup label="General">
                  <option value="environment">Environment</option>
                  <option value="network">Network</option>
                  <option value="cellular">Cellular</option>
                  <option value="mainPower">Main Power</option>
                </optgroup>
                <optgroup label="Relay Power">
                  <option
                    v-for="relay in enabledRelays"
                    :key="relay.id"
                    :value="relay.id"
                  >
                    {{ relay.name }}
                  </option>
                </optgroup>
              </select>
            </div>

            <!-- Field Dropdown -->
            <div class="flex-1">
              <label class="block text-Body text-textColor mb-1">Field:</label>
              <select
                v-model="currentTask.trigger.field"
                class="w-full border-gray-300 rounded-md p-2 shadow-sm"
                :disabled="!currentTask.trigger.source"
              >
                <option disabled value="">Select a field</option>
                <option v-for="field in availableFields" :key="field" :value="field">
                  {{ field }}
                </option>
              </select>
            </div>

            <!-- Operator Dropdown -->
            <div class="flex-1">
              <label class="block text-Body text-textColor mb-1">Operator:</label>
              <select
                v-model="currentTask.trigger.operator"
                class="w-full border-gray-500 rounded-md p-2 shadow-sm"
                :disabled="!currentTask.trigger.field"
              >
                <option disabled value="">Select operator</option>
                <option value=">">&gt;</option>
                <option value="<">&lt;</option>
                <option value="=">=</option>
                <option value="!=">!=</option>
              </select>
            </div>

            <!-- Value Input -->
            <div class="flex-1">
              <label class="block text-Body text-textColor mb-1">Value:</label>
              <input
                v-model="currentTask.trigger.value"
                type="number"
                placeholder="Enter value"
                class="w-full border-gray-300 rounded-md p-2 shadow-sm"
                :disabled="!currentTask.trigger.operator"
              />
            </div>
          </div>
        </div>

        <!-- Actions Section -->
        <div class="mb-4">
          <h2 class="text-Subheader text-textColor border-b border-gray-500 pb-2">
            Actions
          </h2>
          <div
            v-for="(action, index) in currentTask.actions"
            :key="action.id || index"
            class="flex flex-col mt-4"
          >
            <div class="flex justify-between items-center mb-2">
              <label class="text-Body text-textColor"> Action {{ index + 1 }}: </label>
              <!-- Button to remove an action -->
              <button
                v-if="currentTask.actions.length > 1"
                @click="removeAction(index)"
                class="text-red-500 hover:text-red-700"
              >
                <img src="@/assets/icons/trash.svg" alt="Remove Action" class="w-4 h-4" />
              </button>
            </div>
            <!-- Action Type Selector -->
            <select
              v-model="action.type"
              class="w-full border-gray-300 rounded-md p-2 shadow-sm"
            >
              <option disabled value="">Select an action</option>
              <option value="reboot">Reboot</option>
              <option value="sendEmail">Send Email</option>
              <option value="log">Log</option>
              <option value="awsLog">AWS Log</option>
              <optgroup label="Relay Actions">
                <option v-for="relay in enabledRelays" :key="relay.id" :value="relay.id">
                  {{ relay.name }}
                </option>
              </optgroup>
            </select>
            <!-- Action Details Based on Type -->
            <div class="mt-2 ml-4">
              <!-- Relay Action Details -->
              <div v-if="isRelayAction(action.type)">
                <label class="text-Body text-textColor">Set To:</label>
                <select
                  v-model="action.state"
                  class="mt-2 w-full border-gray-300 rounded-md p-2 shadow-sm"
                >
                  <option value="on">ON</option>
                  <option value="off">OFF</option>
                </select>
              </div>
              <!-- Send Email Action Details -->
              <div v-else-if="action.type === 'sendEmail'">
                <label class="text-Body text-textColor">Message:</label>
                <textarea
                  v-model="action.message"
                  class="mt-2 border-gray-300 rounded-md p-2 shadow-sm w-full"
                  placeholder="Enter email message..."
                ></textarea>
              </div>
              <!-- Placeholder for Future Action Types -->
              <!-- Add additional action types here as needed -->
            </div>
          </div>
          <div class="mt-4">
            <!-- Add Action Button disappears after adding three actions -->
            <button
              v-if="currentTask.actions.length < 3"
              @click="addAction"
              class="bg-primaryMed hover:bg-primaryLight text-white p-2 rounded shadow flex items-center"
            >
              <img src="@/assets/icons/add.svg" alt="Add Action" class="w-4 h-4 mr-2" />
              Add Action
            </button>
          </div>
        </div>

        <!-- Save and Cancel Buttons with Top Border -->
        <div class="border-t border-gray-300 pt-4 flex justify-center">
          <div class="flex space-x-4">
            <button
              @click="saveTask"
              class="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
            >
              Save
            </button>
            <button
              @click="closeModal"
              class="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script>
// Import necessary components and APIs
import Modal from "@/components/etc/Modal.vue";
import DummyAPI from "@/api/dummyApi";

export default {
  name: "RelayLogic",
  components: { Modal },
  data() {
    return {
      relays: {}, // Relay data fetched from API
      conditionalTasks: [], // List of user-defined conditional tasks
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
     * Determines if the current task is being edited.
     * @returns {Boolean} - True if editing, else false.
     */
    isEditing() {
      return this.conditionalTasks.some((task) => task.id === this.currentTask.id);
    },

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
     * Returns available fields based on the selected source.
     * @returns {Array} - List of fields.
     */
    availableFields() {
      const source = this.currentTask.trigger.source;
      if (!source) return [];
      // Check if the source is a relay by verifying if it's in enabledRelays
      const isRelay = this.enabledRelays.some((relay) => relay.id === source);
      if (isRelay) {
        return ["Volts", "Watts", "Amps"];
      }
      return this.fieldOptionsMapping[source] || [];
    },
  },
  methods: {
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
        const response = DummyAPI.get("/api/conditionalTasks");
        if (response.success) {
          // Migrate tasks with 'triggers' to 'trigger'
          const migratedTasks = response.data.map((task) => {
            if (task.triggers && Array.isArray(task.triggers)) {
              // Assign first trigger to 'trigger' and remove 'triggers'
              task.trigger = task.triggers[0] || {
                source: "",
                field: "",
                operator: "",
                value: "",
              };
              delete task.triggers;
            }
            return task;
          });
          this.conditionalTasks = migratedTasks;
          // Save migrated tasks back to localStorage to prevent future migrations
          localStorage.setItem("conditionalTasks", JSON.stringify(migratedTasks));
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
    async saveTask() {
      // Temporarily removing validation as per your request

      try {
        if (this.currentTask.id && this.isEditing) {
          // Editing an existing task
          const response = DummyAPI.put(
            `/api/conditionalTasks/${this.currentTask.id}`,
            this.currentTask
          );
          if (response.success) {
            // Update local list
            const index = this.conditionalTasks.findIndex(
              (task) => task.id === this.currentTask.id
            );
            if (index !== -1) {
              // Vue 3 doesn't require this.$set
              this.conditionalTasks[index] = response.data;
            }
            // Log the updated task JSON excluding empty fields
            console.log(
              "Updated Task:",
              JSON.stringify(this.cleanObject(response.data), null, 2)
            );
            this.closeModal();
          } else {
            console.error("Failed to update task:", response.error);
          }
        } else {
          // Adding a new task
          // Assign unique IDs to actions based on their position
          this.currentTask.actions = this.currentTask.actions.map((action, index) => ({
            ...action,
            id: index + 1, // Assign ID=1,2,3
          }));

          // Clean task object before saving
          const cleanedTask = this.cleanTaskForSaving(this.currentTask);

          const response = DummyAPI.post("/api/conditionalTasks", cleanedTask);
          if (response.success) {
            this.conditionalTasks.push(response.data);
            // Log the added task JSON excluding empty fields
            console.log(
              "Added Task:",
              JSON.stringify(this.cleanObject(response.data), null, 2)
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
        const response = DummyAPI.delete(`/api/conditionalTasks/${taskId}`);
        if (response.success) {
          this.conditionalTasks = this.conditionalTasks.filter(
            (task) => task.id !== taskId
          );
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
      // Ensure action IDs are 1,2,3
      this.currentTask.actions = this.currentTask.actions.map((action, index) => ({
        ...action,
        id: index + 1,
      }));
      this.modalTitle = "Edit Conditional Task";
      this.showModal = true;
    },

    /**
     * Adds a new action to the current task.
     * Ensures that there are no more than three actions.
     */
    addAction() {
      if (this.currentTask.actions.length < 3) {
        this.currentTask.actions.push({
          id: this.currentTask.actions.length + 1, // Assign ID=1,2,3
          type: "",
          state: "",
          message: "",
        });
      }
    },

    /**
     * Removes an action from the current task based on its index.
     * Reassigns action IDs to maintain sequence.
     * @param {Number} index - The index of the action to remove.
     */
    removeAction(index) {
      if (this.currentTask.actions.length > 1) {
        this.currentTask.actions.splice(index, 1);
        // Reassign IDs to maintain 1,2,3
        this.currentTask.actions = this.currentTask.actions.map((action, idx) => ({
          ...action,
          id: idx + 1,
        }));
      }
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
     * Formats the trigger object into a readable string.
     * @param {Object} trigger - The trigger object.
     * @returns {String} - Formatted trigger string.
     */
    formatTrigger(trigger) {
      if (
        !trigger ||
        !trigger.source ||
        !trigger.field ||
        !trigger.operator ||
        trigger.value === ""
      ) {
        return "N/A"; // Display 'N/A' if any part is missing
      }
      let sourceDisplay = "";
      if (this.isRelayAction(trigger.source)) {
        // Display relay name instead of ID
        const relay = this.relays[trigger.source];
        sourceDisplay = relay ? relay.name : trigger.source;
      } else {
        // Capitalize first letter
        sourceDisplay = trigger.source.charAt(0).toUpperCase() + trigger.source.slice(1);
      }
      return `${sourceDisplay} - ${trigger.field} ${trigger.operator} ${trigger.value}`;
    },

    /**
     * Formats actions into a readable string for display in the table.
     * For relay actions, displays the relay name and state.
     * For 'sendEmail', only displays 'Email' without the message.
     * @param {Array} actions - List of action objects.
     * @returns {String} - Formatted actions string.
     */
    formatActions(actions) {
      return actions
        .map((action) => {
          if (this.isRelayAction(action.type)) {
            const relay = this.relays[action.type];
            return `${relay.name} Set To: ${action.state.toUpperCase()}`;
          } else if (action.type === "sendEmail") {
            return `Email`;
          } else {
            return action.type.charAt(0).toUpperCase() + action.type.slice(1);
          }
        })
        .join(", ");
    },

    /**
     * Returns a display string for an action, used in the table.
     * For relay actions, displays the relay name and state.
     * For 'sendEmail', only displays 'Email' without the message.
     * @param {Object} action - The action object.
     * @returns {String} - Display string for the action.
     */
    displayAction(action) {
      if (this.isRelayAction(action.type)) {
        const relay = this.relays[action.type];
        return `${relay.name} Set To: ${action.state.toUpperCase()}`;
      } else if (action.type === "sendEmail") {
        return `Email`;
      } else {
        return action.type.charAt(0).toUpperCase() + action.type.slice(1);
      }
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
