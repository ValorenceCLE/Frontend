<template>
  <!-- Sidebar container -->
  <div
    class="h-full w-56 bg-gradient-to-b from-gray-800 to-gray-900 text-gray-200 font-semibold flex flex-col shadow-lg"
  >
    <!-- Collapsible menu -->
    <ul class="divide-y divide-gray-700">
      <li v-for="(menu, index) in menus" :key="index" class="relative">
        <!-- Parent menu row -->
        <div
          class="p-3 cursor-pointer flex justify-between items-center hover:bg-gray-700 transition-colors"
          @click="toggleDropdown(index)"
        >
          <div class="flex items-center gap-2">
            <img
              :src="menu.icon"
              alt="{{ menu.title }} Icon"
              class="w-5 h-5 text-gray-200"
            />
            <span>{{ menu.title }}</span>
          </div>
          <!-- Rotate arrow with transition -->
          <span
            class="transform transition-transform duration-200"
            :class="{ 'rotate-180': dropdownStates[index] }"
          >
            ▼
          </span>
        </div>

        <!-- Dropdown Items -->
        <transition
          name="slide-dropdown"
          @enter="onEnter"
          @after-enter="onAfterEnter"
          @leave="onLeave"
          @after-leave="onAfterLeave"
        >
          <ul v-if="dropdownStates[index]" class="bg-gray-700">
            <li
              v-for="(item, subIndex) in menu.items"
              :key="subIndex"
              class="pl-8 py-2 hover:bg-gray-600 hover:text-white transition-colors cursor-pointer"
            >
              {{ item }}
            </li>
          </ul>
        </transition>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: "SideBar",
  data() {
    return {
      menus: [
        {
          title: "Settings",
          icon: require("@/assets/icons/settings.svg"),
          items: ["Information", "Network", "Date/Time", "Configuration"],
        },
        {
          title: "Relays",
          icon: require("@/assets/icons/relays.svg"),
          items: ["Settings", "Logic", "Schedule"],
        },
        {
          title: "Logs",
          icon: require("@/assets/icons/logs.svg"),
          items: ["System Logs", "Router Logs", "Camera Logs"],
        },
        {
          title: "Monitor",
          icon: require("@/assets/icons/monitor.svg"),
          items: ["Real Time", "Historical"],
        },
        {
          title: "Dashboard",
          icon: require("@/assets/icons/dashboard.svg"),
          items: ["Setup", "View"],
        },
      ],
      dropdownStates: [],
    };
  },
  methods: {
    toggleDropdown(index) {
      this.dropdownStates[index] = !this.dropdownStates[index];
    },
    onEnter(el) {
      el.style.height = "0";
    },
    onAfterEnter(el) {
      el.style.height = "";
    },
    onLeave(el) {
      el.style.height = el.scrollHeight + "px";
      void el.offsetHeight; // force reflow
      el.style.height = "0";
    },
    onAfterLeave(el) {
      el.style.height = "";
    },
  },
  mounted() {
    this.dropdownStates = this.menus.map(() => false);
  },
};
</script>

<style scoped>
.slide-dropdown-enter-active,
.slide-dropdown-leave-active {
  transition: height 0.2s ease-out;
  overflow: hidden;
}
.slide-dropdown-enter,
.slide-dropdown-leave-to {
  height: 0;
}
.shadow-lg {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.06);
}
img {
  filter: brightness(0) invert(1); /* Matches text color */
}
</style>
