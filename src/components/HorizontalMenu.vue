<template>
  <div class="w-full bg-grayDark text-white flex justify-center">
    <ul class="flex space-x-6 p-4">
      <li
        v-for="(menu, index) in menus"
        :key="index"
        class="relative group"
      >
        <span class="cursor-pointer hover:underline" @click="toggleDropdown(index)">{{ menu.title }}</span>
        <ul
          v-if="dropdownStates[index]"
          class="absolute bg-gray-800 text-gray-300 rounded-md shadow-lg mt-2"
        >
          <li
            v-for="(item, subIndex) in menu.items"
            :key="subIndex"
            class="px-4 py-2 hover:bg-primaryMed"
          >
            {{ item }}
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>

<script>
import { reactive } from "vue";

export default {
  name: "HorizontalMenu",
  setup() {
    const menus = reactive([
      {
        title: "Settings",
        items: ["General", "Advanced", "Network"],
      },
      {
        title: "Devices",
        items: ["Device List", "Add Device", "Manage Groups"],
      },
      {
        title: "Logs",
        items: ["System Logs", "Error Logs"],
      },
    ]);

    const dropdownStates = reactive(menus.map(() => false));

    const toggleDropdown = (index) => {
      dropdownStates[index] = !dropdownStates[index];
    };

    return {
      menus,
      dropdownStates,
      toggleDropdown,
    };
  },
};
</script>

<style scoped>
.group:hover .group-hover\:block {
  display: block;
}
</style>
