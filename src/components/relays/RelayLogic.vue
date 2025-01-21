<template>
  <div class="flex flex-col items-center justify-center w-full h-full">
    <!-- Page Header -->
    <div
      class="bg-gray-200 p-2 rounded-lg shadow-md border border-gray-500 max-w-fit flex justify-center items-center mx-auto"
    >
      <h1 class="text-Header text-textColor">Relay Conditional Logic</h1>
    </div>

    <!-- Conditional Tasks Table -->
    <div
      class="w-full max-w-4xl bg-gray-200 rounded-lg shadow-md border border-gray-500 p-4 my-3"
    >
      <div class="flex justify-between items-center mb-4 px-4">
        <h2 class="text-Subheader text-textColor">Conditional Tasks</h2>
        <button
          @click="openAddTaskModal"
          class="bg-primaryMed hover:bg-primaryLight text-white py-2 px-4 rounded shadow"
        >
          Add Conditional Task +
        </button>
      </div>
      <table class="w-full text-left border-collapse rounded-md">
        <thead>
          <tr class="bg-gray-200 border-b border-gray-300">
            <th class="py-3 px-4 text-textColor text-Subheader">Name</th>
            <th class="py-3 px-4 text-textColor text-Subheader">Triggers</th>
            <th class="py-3 px-4 text-textColor text-Subheader">Actions</th>
            <th class="py-3 px-4 text-textColor text-Subheader">Edit</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(task, index) in conditionalTasks"
            :key="index"
            class="hover:bg-gray-100 border-t border-gray-300"
          >
            <td class="py-2 px-4 text-textColor">{{ task.name }}</td>
            <td class="py-2 px-4 text-textColor">{{ formatTriggers(task.triggers) }}</td>
            <td class="py-2 px-4 text-textColor">{{ formatActions(task.actions) }}</td>
            <td class="py-2 px-4 text-center">
              <button
                @click="editTask(index)"
                class="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded"
              >
                Edit
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add/Edit Task Modal -->
    <RelayModal
      v-if="showModal"
      :show="showModal"
      :title="modalTitle"
      @close="closeModal"
    >
      <div>
        <!-- Task Name -->
        <label class="flex justify-between items-center mb-4">
          <span class="text-textColor text-Body">Task Name:</span>
          <input
            type="text"
            v-model="currentTask.name"
            class="ml-2 w-3/5 border-gray-300 rounded-md shadow-sm"
          />
        </label>

        <!-- Trigger Section -->
        <div class="mb-4">
          <div v-for="(trigger, index) in currentTask.triggers" :key="index" class="mb-4">
            <label class="flex justify-between items-center mb-2">
              <span class="text-textColor text-Body">Source:</span>
              <select
                v-model="trigger.source"
                class="ml-2 w-3/5 border-gray-300 rounded-md shadow-sm"
              >
                <option value="temperature">Temperature</option>
                <option value="power">Power</option>
                <option value="packetLoss">Packet Loss</option>
                <option value="cellSignal">Cellular Signal</option>
                <option v-for="n in 6" :key="'relay' + n" :value="'relayPower' + n">
                  Relay {{ n }} Power
                </option>
              </select>
            </label>
            <label class="flex justify-between items-center mb-2">
              <span class="text-textColor text-Body">Operator:</span>
              <select
                v-model="trigger.operator"
                class="ml-2 w-3/5 border-gray-300 rounded-md shadow-sm"
              >
                <option value=">">></option>
                <option value="<"><</option>
                <option value="=">=</option>
                <option value="!=">!=</option>
              </select>
            </label>
            <label class="flex justify-between items-center">
              <span class="text-textColor text-Body">Value:</span>
              <input
                type="text"
                v-model="trigger.value"
                class="ml-2 w-3/5 border-gray-300 rounded-md shadow-sm"
              />
            </label>
          </div>
          <button
            @click="addTrigger"
            class="bg-gray-300 hover:bg-gray-400 text-gray-800 text-FormButton py-1 px-3 rounded mt-2"
          >
            Add Trigger
          </button>
        </div>

        <!-- Actions Section -->
        <div>
          <div v-for="(action, index) in currentTask.actions" :key="index" class="mb-4">
            <label class="flex justify-between items-center">
              <span class="text-textColor text-Body">Action:</span>
              <select
                v-model="action.type"
                class="ml-2 w-3/5 border-gray-300 rounded-md shadow-sm"
              >
                <option value="reboot">Reboot</option>
                <option value="sendEmail">Send Email</option>
                <option value="log">Log</option>
                <option value="awsLog">AWS Log</option>
                <optgroup label="Relay States">
                  <option
                    v-for="n in 6"
                    :key="'relay' + n + 'On'"
                    :value="'relay' + n + 'On'"
                  >
                    Relay {{ n }} On
                  </option>
                  <option
                    v-for="n in 6"
                    :key="'relay' + n + 'Off'"
                    :value="'relay' + n + 'Off'"
                  >
                    Relay {{ n }} Off
                  </option>
                </optgroup>
              </select>
            </label>
          </div>
          <button
            @click="addAction"
            class="bg-gray-300 hover:bg-gray-400 text-gray-800 text-FormButton py-1 px-3 rounded mt-2"
          >
            Add Action
          </button>
        </div>

        <!-- Save/Cancel Buttons -->
        <div class="flex justify-end mt-6">
          <button
            @click="saveTask"
            class="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
          >
            Save
          </button>
          <button
            @click="closeModal"
            class="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded ml-2"
          >
            Cancel
          </button>
        </div>
      </div>
    </RelayModal>
  </div>
</template>

<script>
import RelayModal from "@/components/relays/RelayModal.vue";

export default {
  name: "RelayLogic",
  components: { RelayModal },
  data() {
    return {
      conditionalTasks: [],
      currentTask: {
        name: "",
        triggers: [{ source: "temperature", operator: ">", value: "" }],
        actions: [{ type: "reboot" }],
      },
      showModal: false,
      modalTitle: "Add Conditional Task",
    };
  },
  methods: {
    openAddTaskModal() {
      this.currentTask = {
        name: "",
        triggers: [{ source: "", operator: "", value: "" }],
        actions: [{ type: "" }],
      };
      this.modalTitle = "Add Conditional Task";
      this.showModal = true;
    },
    editTask(index) {
      this.currentTask = { ...this.conditionalTasks[index] };
      this.modalTitle = `Edit Task: ${this.currentTask.name}`;
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
    },
    saveTask() {
      if (this.modalTitle.includes("Add")) {
        this.conditionalTasks.push({ ...this.currentTask });
      } else {
        const index = this.conditionalTasks.findIndex(
          (task) => task.name === this.currentTask.name
        );
        this.conditionalTasks[index] = { ...this.currentTask };
      }
      this.closeModal();
    },
    addTrigger() {
      this.currentTask.triggers.push({ source: "", operator: "", value: "" });
    },
    addAction() {
      this.currentTask.actions.push({ type: "" });
    },
    formatTriggers(triggers) {
      return triggers
        .map((trigger) => `${trigger.source} ${trigger.operator} ${trigger.value}`)
        .join(", ");
    },
    formatActions(actions) {
      return actions.map((action) => action.type).join(", ");
    },
  },
};
</script>
