<template>
  <header class="bg-grayDark text-white flex items-center px-2 md:px-4 relative" style="height: 4rem;">
    <!-- Logo Section -->
    <div class="flex items-center h-full">
      <img
        src="/src/assets/valorence.png"
        alt="Valorence Logo"
        class="h-3/4 object-contain"
      />
    </div>

    <!-- Unit Name Section (Centered) -->
    <div
      class="absolute left-1/2 transform -translate-x-1/2 text-center font-semibold text-grayLight"
      style="font-size: 2.2rem; line-height: 4rem;"
    >
      CLE R&D DPM #1
    </div>

    <!-- Clock Section (Right-Aligned) -->
    <div
      class="ml-auto font-semibold text-grayLight"
      style="font-size: 2.2rem; line-height: 4rem;"
    >
      {{ time }}
    </div>
  </header>
</template>

<script>
export default {
  name: "Header",
  data() {
    return {
      time: this.getFormattedTime(),
    };
  },
  methods: {
    getFormattedTime() {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, "0");
      const seconds = now.getSeconds().toString().padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12; // Convert to 12-hour format
      return `${hours}:${minutes}:${seconds} ${ampm}`;
    },
    updateTime() {
      this.time = this.getFormattedTime();
    },
  },
  mounted() {
    this.clockInterval = setInterval(this.updateTime, 1000);
  },
  beforeUnmount() {
    clearInterval(this.clockInterval);
  },
};
</script>

<style scoped>
header {
  line-height: 1;
}
</style>
