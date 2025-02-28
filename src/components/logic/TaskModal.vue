<template>
  <transition name="fade">
    <div
      v-if="show"
      class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50"
      @click.self="$emit('close')"
    >
      <div
        class="bg-white rounded shadow w-full max-w-2xl relative border border-gray-500"
        @click.stop
      >
        <!-- HEADER -->
        <div class="border-b border-gray-500 relative py-2 px-3">
          <!-- Close Icon (same approach as EditModal.vue) -->
          <img
            :src="xIcon"
            alt="Close"
            class="w-6 h-6 cursor-pointer hover:scale-105 transition-transform absolute top-1 right-1"
            @click="$emit('close')"
          />

          <!-- Title centered -->
          <h2 class="text-center text-ModalHeader text-textColor italic">
            {{ title }}
          </h2>
        </div>

        <!-- MAIN CONTENT SLOT -->
        <div class="px-3 py-1.5">
          <slot></slot>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import xIcon from "@/assets/icons/x.svg";

export default {
  name: "TaskModal",
  props: {
    show: { type: Boolean, required: true },
    title: { type: String, required: true },
  },
  data() {
    return {
      xIcon, // same icon file used by EditModal.vue
    };
  },
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
