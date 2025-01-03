<template>
  <div class="bg-white border border-gray-300 shadow-md rounded-md flex flex-col">
    <div
      class="bg-primaryMed text-white px-4 py-2 rounded-t-md flex justify-between items-center"
    >
      <h3 class="text-sm font-semibold">{{ relayName }}</h3>
      <span
        class="text-xs font-semibold px-2 py-1 rounded"
        :class="status === 'On' ? 'bg-green-500' : 'bg-red-500'"
      >
        {{ status }}
      </span>
    </div>
    <div class="grid grid-cols-3 gap-2 px-4 py-4">
      <button
        class="bg-primaryLight text-white font-semibold rounded-lg py-2 hover:bg-primaryMed"
        @click="simulateAction(onLabel)"
      >
        {{ onLabel }}
      </button>
      <button
        class="bg-grayDark text-white font-semibold rounded-lg py-2 hover:bg-gray-600"
        @click="simulateAction(offLabel)"
      >
        {{ offLabel }}
      </button>
      <button
        v-if="pulseLabel"
        class="bg-blue-500 text-white font-semibold rounded-lg py-2 hover:bg-blue-400"
        @click="simulateAction(pulseLabel)"
      >
        {{ pulseLabel }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: "RelayCard",
  props: {
    relayName: { type: String, required: true },
    status: { type: String, required: true },
    onLabel: { type: String, required: true },
    offLabel: { type: String, required: true },
    pulseLabel: { type: String, default: null },
  },
  methods: {
    simulateAction(action) {
      console.log(`Executing ${action}`);
    },
  },
};
</script>
