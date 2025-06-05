<template>
  <div class="w-52 text-gray-200 text-Form flex flex-col shadow-2xl"
    style="height: calc(100vh - var(--header-height) - var(--footer-height))">
    <ul class="divide-y divide-gray-700">
      <li v-for="(menu, index) in menus" :key="index" class="relative">
        <!-- All menu items have clickable headers that navigate to default routes -->
        <div class="p-2 flex justify-between items-center cursor-pointer hover:bg-gray-500 transition-colors"
          @click="navigateToSection(menu, index)">
          <div class="flex items-center gap-2">
            <img :src="menu.icon" :alt="menu.title + ' Icon'" class="w-5 h-5 text-gray-200" />
            <span>{{ menu.title }}</span>
          </div>
          <!-- Only show dropdown icon for menu items with subitems -->
          <img v-if="menu.items" :src="chevronDown" alt="Chevron Down"
            class="w-6 h-6 transform transition-transform duration-200" :class="{ 'rotate-180': dropdownStates[index] }"
            @click.stop="toggleDropdown(index)" />
        </div>

        <!-- Dropdown Items (only for menus with items) -->
        <transition name="slide-dropdown" :key="dropdownStates[index]">
          <ul v-if="menu.items && dropdownStates[index]" class="bg-gray-600">
            <li v-for="(item, subIndex) in menu.items" :key="subIndex"
              class="pl-8 py-0.5 hover:bg-gray-500 transition-colors">
              <router-link :to="generateRoute(menu.title, item)" class="text-white no-underline block py-1.5">
                {{ item }}
              </router-link>
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
import monitorIcon from "@/assets/icons/monitor.svg";
import dashboardIcon from "@/assets/icons/dashboard.svg";
import chevronDown from "@/assets/icons/chevron-down.svg";

export default {
  name: "SideBar",
  data() {
    return {
      chevronDown,
      menus: [
        {
          title: "Settings",
          icon: settingsIcon,
          route: "settings",
          defaultSubRoute: "general",
          items: ["General", "Network", "Date/Time"],
        },
        {
          title: "Relays",
          icon: relaysIcon,
          route: "relays",
          defaultSubRoute: "settings",
          items: ["Settings", "Logic"],
        },
        {
          title: "Monitor",
          icon: monitorIcon,
          route: "monitor",
          defaultSubRoute: "real-time",
          items: ["Real Time", "Historical"],
        },
        {
          title: "Dashboard",
          icon: dashboardIcon,
          route: "",
        },
      ],
      dropdownStates: new Array(4).fill(false),
    };
  },
  computed: {
    basePath() {
      return this.$route.path.startsWith("/admin") ? "/admin" : "/user";
    },
  },
  methods: {
    navigateToSection(menu, index) {
      // If this menu has sub-items, just toggle the dropdown
      if (menu.items) {
        this.toggleDropdown(index);
      } else {
        // For items like Dashboard with no sub-items
        this.$router.push(menu.title === "Dashboard" ? this.basePath : `${this.basePath}/${menu.route}`);
      }
    },
    toggleDropdown(index) {
      this.dropdownStates = this.dropdownStates.map((state, i) => i === index ? !state : false);
    },
    generateRoute(menu, item) {
      const formattedItem = item
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/\//g, "-");
      return `${this.basePath}/${menu.toLowerCase()}/${formattedItem}`;
    },
  },
};
</script>

<style scoped>
.slide-dropdown-enter-active,
.slide-dropdown-leave-active {
  transition: height 0.5s ease-in-out;
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
  filter: brightness(0) invert(1);
}

.rotate-180 {
  transform: rotate(180deg);
  transition: transform 0.5s ease-in-out;
}
</style>