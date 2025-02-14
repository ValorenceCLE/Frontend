<template>
  <div
    class="w-56 text-gray-200 font-semibold flex flex-col shadow-2xl"
    style="height: calc(100vh - var(--header-height) - var(--footer-height))"
  >
    <ul class="divide-y divide-gray-700">
      <li v-for="(menu, index) in menus" :key="index" class="relative">
        <!-- Direct link: if the menu item has a defined 'route' property -->
        <div v-if="menu.hasOwnProperty('route')">
          <router-link
            :to="menu.title === 'Dashboard' ? basePath : `${basePath}/${menu.route}`"
            class="p-3 flex items-center gap-2 hover:bg-gray-500 transition-colors"
          >
            <img
              :src="menu.icon"
              :alt="menu.title + ' Icon'"
              class="w-5 h-5 text-gray-200"
            />
            <span>{{ menu.title }}</span>
          </router-link>
        </div>

        <!-- Otherwise, render a dropdown for menus with items -->
        <div v-else>
          <div
            class="p-3 cursor-pointer flex justify-between items-center"
            @click="toggleDropdown(index)"
          >
            <div class="flex items-center gap-2">
              <img
                :src="menu.icon"
                :alt="menu.title + ' Icon'"
                class="w-5 h-5 text-gray-200"
              />
              <span>{{ menu.title }}</span>
            </div>
            <span
              class="transform transition-transform duration-200"
              :class="{ 'rotate-180': dropdownStates[index] }"
            >
              ▼
            </span>
          </div>

          <!-- Dropdown Items -->
          <transition name="slide-dropdown">
            <ul v-if="dropdownStates[index]" class="bg-gray-600">
              <li
                v-for="(item, subIndex) in menu.items"
                :key="subIndex"
                class="pl-8 py-1 hover:bg-gray-500 transition-colors"
              >
                <router-link
                  :to="generateRoute(menu.title, item)"
                  class="text-white no-underline"
                >
                  {{ item }}
                </router-link>
              </li>
            </ul>
          </transition>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import settingsIcon from "@/assets/icons/settings.svg";
import relaysIcon from "@/assets/icons/relays.svg";
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
          items: ["General", "Network", "Date/Time", "Emails"],
        },
        {
          title: "Relays",
          icon: relaysIcon,
          items: ["Settings", "Logic"],
        },
        // Uncomment when Logs is ready.
        // {
        //   title: "Logs",
        //   icon: logsIcon,
        //   items: ["System", "Router", "Camera"],
        // },
        {
          title: "Monitor",
          icon: monitorIcon,
          items: ["Real Time", "Historical"],
        },
        // Dashboard now becomes a direct link that routes to the base path.
        {
          title: "Dashboard",
          icon: dashboardIcon,
          route: "", // empty string indicates base route
        },
      ],
      // Initialize one boolean per menu.
      dropdownStates: new Array(4).fill(false),
    };
  },
  computed: {
    basePath() {
      // Determine the current base path (either /admin or /user)
      return this.$route.path.startsWith("/admin") ? "/admin" : "/user";
    },
  },
  methods: {
    // Use direct assignment for Vue 3 reactivity.
    toggleDropdown(index) {
      this.dropdownStates[index] = !this.dropdownStates[index];
    },
    generateRoute(menu, item) {
      const formattedItem = item
        .toLowerCase()
        .replace(/\s+/g, "-") // Replace spaces with dashes
        .replace(/\//g, "-"); // Replace slashes with dashes
      return `${this.basePath}/${menu.toLowerCase()}/${formattedItem}`;
    },
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
