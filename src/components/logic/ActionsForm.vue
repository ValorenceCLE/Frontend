<template>
  <div class="mb-4">
    <h3 class="text-Subheader text-textColor border-b border-gray-500 pb-2">Actions</h3>
    <div
      v-for="(action, index) in actions"
      :key="action.id || index"
      class="flex flex-col mt-4"
    >
      <div class="flex justify-between items-center mb-2">
        <label class="text-Body text-textColor"> Action {{ index + 1 }}: </label>
        <!-- Button to remove an action -->
        <button
          v-if="actions.length > 1"
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
        required
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
            required
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
            required
          ></textarea>
        </div>
        <!-- Placeholder for Future Action Types -->
        <!-- Add additional action types here as needed -->
      </div>
    </div>
    <div class="mt-4">
      <!-- Add Action Button disappears after adding three actions -->
      <button
        v-if="actions.length < 3"
        @click.prevent="addAction"
        class="bg-primaryMed hover:bg-primaryLight text-white p-2 rounded shadow flex items-center"
      >
        <img src="@/assets/icons/add.svg" alt="Add Action" class="w-4 h-4 mr-2" />
        Add Action
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: "ActionsForm",
  props: {
    modelValue: {
      type: Array,
      required: true,
    },
    enabledRelays: {
      type: Array,
      required: true,
    },
  },
  computed: {
    actions: {
      get() {
        return this.modelValue;
      },
      set(val) {
        this.$emit("update:modelValue", val);
      },
    },
  },
  methods: {
    isRelayAction(type) {
      return this.enabledRelays.some((relay) => relay.id === type);
    },
    addAction() {
      if (this.actions.length < 3) {
        this.actions.push({
          id: this.actions.length + 1, // Assign ID=1,2,3
          type: "",
          state: "",
          message: "",
        });
      }
    },
    removeAction(index) {
      if (this.actions.length > 1) {
        this.actions.splice(index, 1);
        // Reassign IDs to maintain 1,2,3
        this.actions = this.actions.map((action, idx) => ({
          ...action,
          id: idx + 1,
        }));
      }
    },
  },
};
</script>

<style scoped>
/* Add any specific styles if necessary */
</style>
