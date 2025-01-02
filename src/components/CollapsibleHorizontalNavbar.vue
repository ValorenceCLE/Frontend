<template>
  <div class="w-full bg-grayDark text-white">
    <ul class="flex space-x-6 p-4 justify-center">
      <li v-for="(menu, index) in menus" :key="index" class="relative group">
        <div
          class="cursor-pointer hover:underline"
          @click="toggleDropdown(index)"
        >
          {{ menu.title }}
        </div>
        <ul
          v-if="dropdownStates[index]"
          class="absolute mt-2 bg-gray-800 rounded-md shadow-lg"
        >
          <li
            v-for="(item, subIndex) in menu.items"
            :key="subIndex"
            class="p-2 hover:bg-primaryMed text-gray-300"
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
  name: "CollapsibleHorizontalNavbar",
  data() {
    return {
      menus: [
        { title: "Settings", items: ["General", "Advanced"] },
        { title: "Devices", items: ["Device List", "Add Device"] },
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
.group:hover .group-hover\:block {
  display: block;
}
</style>
