<template>
  <div
    v-if="show"
    class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50"
  >
    <div class="bg-white rounded-lg shadow-lg w-1/3 relative border-gray-600 border">
      <!-- Modal Header -->
      <div class="flex items-center justify-between p-4 border-b border-gray-600">
        <!-- Modal Title -->
        <h2 class="text-textColor text-center flex-1 text-FormHeader font-bold">
          {{ title }}
        </h2>
        <!-- Close Button -->
        <button
          class="text-gray-800 font-extrabold text-xl hover:text-gray-900"
          @click="closeModal"
        >
          ✕
        </button>
      </div>
      <!-- Content Slot -->
      <div class="p-6">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Modal",
  props: {
    show: {
      type: Boolean,
      required: true,
    },
    title: {
      type: String,
      default: "Modal Title",
    },
  },
  methods: {
    closeModal() {
      this.$emit("close");
    },
  },
};
</script>
