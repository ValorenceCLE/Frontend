<template>
  <div v-if="isLoading" class="loading-overlay">
    <div class="loading-popup">
      <p>Loading...</p>
    </div>
  </div>
</template>

<script>
export default {
  name: "Loading",
  props: {
    isLoading: {
      type: Boolean,
      required: true,
    },
  },
};
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-popup {
  background: white;
  padding: 1.5rem 2rem;
  border-radius: 0.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  text-align: center;
}
</style>
