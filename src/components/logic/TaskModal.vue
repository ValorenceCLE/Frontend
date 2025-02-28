<template>
  <div
    v-if="show"
    class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
  >
    <div class="bg-white rounded-md shadow w-full max-w-2xl">
      <!-- Modal Header -->
      <div class="flex justify-between items-center px-3 py-1.5 border-b border-gray-500">
        <h2 class="text-Header text-textColor">{{ title }}</h2>
        <button
          @click="$emit('close')"
          class="text-gray-700 hover:text-gray-900 text-3xl"
        >
          &times;
        </button>
      </div>
      <!-- Modal Body -->
      <div class="px-3 py-1.5">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "TaskModal",
  props: {
    show: { type: Boolean, required: true },
    title: { type: String, required: true },
  },
};
</script>

<style scoped></style>
