<template>
  <div class="relative h-full">
    <!-- Sidebar -->
    <div
      :class="['h-full bg-grayDark text-white fixed top-0 bottom-0', isCollapsed ? 'w-16' : 'w-64']"
    >
      <!-- Toggle Button -->
      <div
        class="p-4 bg-primaryDark cursor-pointer text-center hover:bg-primaryMed"
        @click="toggleSidebar"
      >
        {{ isCollapsed ? '☰' : '✖' }}
      </div>

      <!-- Menu Items -->
      <ul class="mt-4 space-y-4">
        <li
          v-for="(menu, index) in menus"
          :key="index"
          class="cursor-pointer hover:bg-primaryMed p-3 text-sm font-semibold"
        >
          {{ menu }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: "VerticalSlideOutMenu",
  data() {
    return {
      isCollapsed: false,
      menus: ["Dashboard", "Settings", "Devices", "Logs", "Monitor"],
    };
  },
  methods: {
    toggleSidebar() {
      this.isCollapsed = !this.isCollapsed;
    },
  },
};
</script>

<style scoped>
/* Optional CSS for smoother transition */
</style>
