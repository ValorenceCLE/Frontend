<template>
  <div>
    <div class="border-b border-gray-500">
      <h3 class="text-ModalInfo text-textColor px-2 py-1">Actions</h3>
    </div>

    <div class="space-y-2 px-2 py-1 ">
      <div
        v-for="(action, index) in actions"
        :key="index"
        class="bg-gray-100 px-2  py-1 relative border border-gray-500 rounded space-x-4 space-y-1"
      >
        <div class="flex justify-between items-center mb-2">
          <label class="text-AddTask text-textColor">Action {{ index + 1 }}:</label>
          <button
            v-if="actions.length > 1"
            @click="removeAction(index)"
            class="bg-relayStatusred hover:bg-red-700 text-white p-1.5 rounded"
            >
            <img src="@/assets/icons/trash.svg" alt="Remove" class="w-4 h-4 invert" />
          </button>
        </div>

        <!-- Action Type Selector -->
        <div class="grid grid-cols-2 items-center gap-2">
          <label class="text-ModalLabel text-textColor text-left">Type:</label>
          <select
            v-model="displayActionType[index]"
            @change="onActionTypeChange(index, $event.target.value)"
            class="border border-gray-500 rounded px-1 py-0.5 w-full text-sm mb-1"
            required
          >
            <option disabled value="">Select an Action</option>
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
        </div>

        <!-- If it's a relay action -->
        <div v-if="action.type === 'io'" class="grid grid-cols-2 items-center gap-2">
          <label class="text-ModalLabel text-textColor text-left">Set To:</label>
          <select
            v-model="action.state"
            class="border border-gray-500 rounded px-1 py-0.5 w-full text-sm mb-1"
            required
          >
            <option value="on">ON</option>
            <option value="off">OFF</option>
            <option value="pulse">PULSE</option>
          </select>
        </div>

        <!-- If it's an email action -->
        <div v-if="action.type === 'email'" class="grid grid-cols-1 items-center gap-2">
          <label class="text-ModalLabel text-textColor">Message:</label>
          <textarea
            v-model="action.message"
            class="border border-gray-500 rounded px-1 py-0.5 w-full text-sm mb-1"
            rows="2"
            placeholder="Email message..."
            required
          ></textarea>
        </div>
      </div>
    </div>

    <!-- Add Action Button -->
    <div class="my-1 flex justify-center">
      <button
        v-if="actions.length < 3"
        @click.prevent="addAction"
        class="bg-grayDark hover:bg-gray-700 text-white px-2 py-1 rounded shadow flex items-center text-sm"
      >
        
        Add Action
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: "ActionsForm",
  props: {
    modelValue: { type: Array, required: true },
    enabledRelays: { type: Array, required: true },
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
    displayActionType() {
      return this.actions.map((action) => {
        if (action.type === "io") {
          const r = this.enabledRelays.find((rl) => rl.id === action.target);
          return r ? r.id : "io";
        }
        return action.type;
      });
    },
  },
  methods: {
    onActionTypeChange(index, newType) {
      const action = this.actions[index];
      if (this.isRelayAction(newType)) {
        const selectedRelay = this.enabledRelays.find((r) => r.id === newType);
        if (selectedRelay) {
          action.type = "io";
          action.target = selectedRelay.id;
          action.state = action.state || "on";
        }
        delete action.message;
      } else if (newType === "email") {
        action.type = "email";
        action.message = action.message || "";
        delete action.target;
        delete action.state;
      } else {
        // e.g. 'reboot', 'log', 'awsLog'
        action.type = newType;
        delete action.target;
        delete action.state;
        delete action.message;
      }
      this.actions.splice(index, 1, { ...action });
    },
    isRelayAction(type) {
      return this.enabledRelays.some((r) => r.id === type);
    },
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
    removeAction(index) {
      this.actions.splice(index, 1);
    },
  },
};
</script>

<style scoped>

</style>
