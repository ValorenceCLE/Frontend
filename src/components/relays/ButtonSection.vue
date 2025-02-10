<template>
    <div class="border border-gray-300 rounded-md p-2 mb-4">
      <div class="flex items-center justify-between cursor-pointer" @click="toggleExpansion">
        <span class="text-Body font-bold">{{ title }}</span>
        <div class="flex space-x-1">
          <button @click.stop="setEnabled(true)" :class="buttonClass(true)">Show</button>
          <button @click.stop="setEnabled(false)" :class="buttonClass(false)">Hide</button>
        </div>
      </div>
      <div v-if="isActive && data.show" class="mt-2">
        <label v-for="(field, index) in fields" :key="index" class="flex justify-between items-center mb-2">
          <span class="text-Body">{{ field.label }}</span>
          <input
            type="text"
            v-model="data[field.model]"
            class="ml-2 w-7/12 text-Form border-gray-300 rounded-md shadow-sm"
          />
        </label>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: "ButtonSection",
    props: {
      title: String,
      data: Object,
      isActive: Boolean,
      sectionKey: String,
      fields: Array,
    },
    methods: {
      toggleExpansion() {
        if (!this.data.show) return;
        this.$emit('toggle', this.sectionKey);
      },
      setEnabled(value) {
        this.$emit('set-enabled', this.sectionKey, value);
      },
      buttonClass(buttonValue) {
        const isActive = this.data.show === buttonValue;
        return (
          "flex-1 py-1 px-2 text-sm font-medium rounded " +
          (isActive ? "bg-blue-500 text-white" : "bg-white text-blue-500 border border-blue-500")
        );
      },
    },
  };
</script>
  