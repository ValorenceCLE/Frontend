<template>
  <div class="h-full w-64 bg-grayDark text-white flex flex-col">
    <ul>
      <li
        v-for="(menu, index) in menus"
        :key="index"
        class="border-b border-gray-700"
      >
        <div
          class="p-4 cursor-pointer flex justify-between items-center bg-primaryDark hover:bg-primaryMed"
          @click="toggleDropdown(index)"
        >
          <span>{{ menu.title }}</span>
          <span :class="dropdownStates[index] ? 'rotate-180' : ''">
            ▼
          </span>
        </div>

        <!-- Dropdown Items -->
        <ul
          v-if="dropdownStates[index]"
          class="pl-6 bg-gray-800"
        >
          <li
            v-for="(item, subIndex) in menu.items"
            :key="subIndex"
            class="p-2 hover:underline text-gray-300"
          >
            {{ item }}
          </li>
        </ul>
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
        { title: "General Settings", items: ["Ethernet", "WiFi"] },
        { title: "Devices", items: ["Device List", "Manage Devices"] },
        { title: "Logs", items: ["System Logs", "Access Logs"] },
      ],
      dropdownStates: [],
    };
  },
  methods: {
    toggleDropdown(index) {
      this.dropdownStates[index] = !this.dropdownStates[index];
    },
  },
  mounted() {
    this.dropdownStates = this.menus.map(() => false);
  },
};
</script>

<style scoped>
.rotate-180 {
  transform: rotate(180deg);
}
</style>
