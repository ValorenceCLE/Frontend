<template>
  <!-- Sidebar container -->
  <div
    class="w-56 text-gray-200 font-semibold flex flex-col shadow-2xl"
    style="height: calc(100vh - var(--header-height) - var(--footer-height))"
  >
    <!-- Collapsible menu -->
    <ul class="divide-y divide-gray-700">
      <li v-for="(menu, index) in menus" :key="index" class="relative">
        <!-- Parent menu row -->
        <div
          class="p-3 cursor-pointer flex justify-between items-center"
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
          <ul v-if="dropdownStates[index]" class="bg-gray-600">
            <li
              v-for="(item, subIndex) in menu.items"
              :key="subIndex"
              class="dropdown-item pl-8 py-1 hover:bg-gray-500 transition-colors cursor-pointer"
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
import settingsIcon from "@/assets/icons/settings.svg";
import relaysIcon from "@/assets/icons/relays.svg";
import logsIcon from "@/assets/icons/logs.svg";
import monitorIcon from "@/assets/icons/monitor.svg";
import dashboardIcon from "@/assets/icons/dashboard.svg";

export default {
  name: "SideBar",
  data() {
    return {
      menus: [
        {
          title: "Settings",
          icon: settingsIcon,
          items: ["Network", "Date/Time", "Configuration", "Emails"],
        },
        {
          title: "Relays",
          icon: relaysIcon,
          items: ["Settings", "Logic", "Schedule"],
        },
        {
          title: "Logs",
          icon: logsIcon,
          items: ["System", "Router", "Camera"],
        },
        {
          title: "Monitor",
          icon: monitorIcon,
          items: ["Real Time", "Historical"],
        },
        {
          title: "Dashboard",
          icon: dashboardIcon,
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
