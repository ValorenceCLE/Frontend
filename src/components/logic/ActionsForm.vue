<template>
  <div class="mb-4">
    <h3 class="text-Subheader text-textColor border-b border-gray-500 pb-2">Actions</h3>

    <div v-for="(action, index) in actions" :key="index" class="flex flex-col mt-4">
      <div class="flex justify-between items-center mb-2">
        <label class="text-Body text-textColor">Action {{ index + 1 }}:</label>
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
        v-model="displayActionType[index]"
        @change="onActionTypeChange(index, $event.target.value)"
        class="w-full border-gray-300 rounded-md p-2 shadow-sm"
        required
      >
        <option disabled value="">Select an action</option>
        <option value="reboot">Reboot</option>
        <option value="email">Email</option>
        <option value="log">Log</option>
        <option value="awsLog">AWS Log</option>
        <optgroup label="Relay Actions">
          <option v-for="relay in enabledRelays" :key="relay.id" :value="relay.id">
            {{ relay.name }}
          </option>
        </optgroup>
      </select>

      <!-- Relay Action Details (Only Shown for Relay Actions) -->
      <div v-if="action.type === 'io'">
        <label class="text-Body text-textColor mt-2">Set To:</label>
        <select
          v-model="action.state"
          class="mt-2 w-full border-gray-300 rounded-md p-2 shadow-sm"
          required
        >
          <option value="on">ON</option>
          <option value="off">OFF</option>
          <option value="pulse">PULSE</option>
        </select>
      </div>

      <!-- Email Action Details -->
      <div v-if="action.type === 'email'">
        <label class="text-Body text-textColor mt-2">Message:</label>
        <textarea
          v-model="action.message"
          class="mt-2 border-gray-300 rounded-md p-2 shadow-sm w-full"
          placeholder="Enter email message..."
          required
        ></textarea>
      </div>
    </div>

    <div class="mt-4">
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
    /**
     * Computed property to handle displaying relay names while storing the correct values.
     */
    displayActionType() {
      return this.actions.map((action) => {
        if (action.type === "io") {
          const relay = this.enabledRelays.find((r) => r.id === action.target);
          return relay ? relay.id : "io";
        }
        return action.type;
      });
    },
  },
  methods: {
    /**
     * Handles changes to the action type.
     * - If a relay is selected, the type becomes `"io"` and target is assigned.
     * - If another action is selected, it ensures unnecessary fields are removed.
     * @param {Number} index - The index of the action in the array.
     * @param {String} newType - The selected action type.
     */
    onActionTypeChange(index, newType) {
      const action = this.actions[index];

      if (this.isRelayAction(newType)) {
        const selectedRelay = this.enabledRelays.find((relay) => relay.id === newType);
        if (selectedRelay) {
          action.target = selectedRelay.id; // Store relay ID as target
          action.type = "io"; // Internally set as "io"
          action.state = action.state || "on"; // Default state
        }
        delete action.message;
      } else if (newType === "email") {
        action.type = "email";
        action.message = action.message || "";
        delete action.target;
        delete action.state;
      } else {
        action.type = newType;
        delete action.target;
        delete action.state;
        delete action.message;
      }

      // Ensure Vue detects changes
      this.actions.splice(index, 1, { ...action });
    },

    /**
     * Checks if the given type corresponds to a relay action.
     * @param {String} type - The action type.
     * @returns {Boolean} - True if it's a relay action.
     */
    isRelayAction(type) {
      return this.enabledRelays.some((relay) => relay.id === type);
    },

    /**
     * Adds a new action to the list.
     */
    addAction() {
      if (this.actions.length < 3) {
        this.actions.push({
          type: "",
          state: "",
          message: "",
          target: "",
        });
      }
    },

    /**
     * Removes an action from the list.
     * @param {Number} index - The index of the action to remove.
     */
    removeAction(index) {
      this.actions.splice(index, 1);
    },
  },
};
</script>

<style scoped>
/* Add any specific styles if necessary */
</style>
