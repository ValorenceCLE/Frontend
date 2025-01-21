<template>
  <div
    v-if="visible"
    class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50"
  >
    <div
      class="bg-gray-100 rounded-lg shadow-lg w-fit p-4 border-gray-500 border text-center"
    >
      <p class="text-textColor text-Header">Changes Applied Successfully!</p>
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
  },
};
</script>

<style scoped>
/* Optional animation for the toast */
@keyframes fadeInOut {
  0% {
    opacity: 0;
    transform: translateY(-10px);
  }
  10% {
    opacity: 1;
    transform: translateY(0);
  }
  90% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateY(-10px);
  }
}
.toast {
  animation: fadeInOut 3s ease-in-out;
}
</style>
