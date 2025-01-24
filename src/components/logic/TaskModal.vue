<template>
  <div
    v-if="show"
    class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
  >
    <div class="bg-white rounded-lg shadow-lg w-full max-w-2xl">
      <!-- Modal Header -->
      <div class="flex justify-between items-center p-4 border-b border-gray-300">
        <h2 class="text-Subheader text-textColor">{{ title }}</h2>
        <button
          @click="$emit('close')"
          class="text-gray-500 hover:text-gray-700 text-2xl"
        >
          &times;
        </button>
      </div>
      <!-- Modal Body -->
      <div class="p-4">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "TaskModal",
  props: {
    show: {
      type: Boolean,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
  },
};
</script>

<style scoped>
/* Optional: Add transition effects or additional styles */
</style>
