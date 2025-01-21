<template>
  <div
    v-if="visible"
    class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50"
  >
    <div
      class="bg-gray-100 rounded-lg shadow-lg w-fit p-3 border-gray-600 border text-center"
    >
      <p class="text-textColor text-lg text-Subheader">{{ message }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: "ToastNotification",
  props: {
    visible: {
      type: Boolean,
      required: true,
    },
    message: {
      type: String,
      required: true, // Message must be provided
    },
  },
};
</script>
