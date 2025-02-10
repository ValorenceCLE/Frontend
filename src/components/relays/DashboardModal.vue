<template>
  <transition name="fade">
    <div
      v-if="show"
      class="modal-overlay fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm z-50"
      @click.self="closeModal"
    >
      <div
        class="bg-white rounded-xl shadow-2xl w-full md:w-1/2 lg:w-1/3 relative border-gray-300"
        @click.stop
      >
        <!-- Modal Header -->
        <div class="flex items-center justify-between p-4 border-b border-gray-300">
          <h2 class="text-2xl text-gray-800 text-center font-bold flex-1">
            Dashboard Settings
          </h2>
          <XMarkIcon
            class="h-6 w-6 text-gray-800 cursor-pointer hover:text-gray-900"
            @click="closeModal"
          />
        </div>

        <!-- Modal Content -->
        <div class="p-2 text-gray-700">
          <div
            v-for="(section, key) in sections"
            :key="key"
            class="border border-gray-300 rounded-md p-2 mb-3"
          >
            <!-- Section Header -->
            <div
              class="flex items-center justify-between cursor-pointer hover:bg-gray-100 p-1 rounded-md"
              @click="toggleExpansion(key)"
            >
              <span class="text-lg font-bold">{{ section.title }}</span>

              <!-- Button Group -->
              <div class="flex items-center">
                <button
                  @click.stop="setEnabled(key, true)"
                  :class="getToggleButtonClass(key, true)"
                  title="Show this section and make it editable"
                >
                  <EyeIcon class="h-4 w-4 mr-1" /> Show
                </button>

                <button
                  @click.stop="setEnabled(key, false)"
                  :class="getToggleButtonClass(key, false)"
                  title="Hide this section and disable editing"
                >
                  <BanIcon class="h-4 w-4 mr-1" /> Hide
                </button>

                <component
                  :is="activeSection === key ? ChevronDownIcon : ChevronRightIcon"
                  class="h-5 w-5 text-gray-600 ml-4"
                  title="Click to expand/collapse"
                />
              </div>
            </div>

            <!-- Form Fields -->
            <div
              :class="[
                'mt-2 space-y-1 p-2 rounded-md transition',
                editedDashboard[key].show ? 'bg-white' : 'bg-gray-100 opacity-50 cursor-not-allowed'
              ]"
            >
              <div
                v-for="field in section.fields"
                :key="field.model"
                class="flex items-center justify-between mb-1"
              >
                <label class="text-sm font-medium text-gray-700 mr-2 min-w-[30%]">
                  {{ field.label }}
                </label>

                <input
                  type="text"
                  v-model="editedDashboard[key][field.model]"
                  :disabled="!editedDashboard[key].show"
                  class="flex-1 border-gray-300 rounded-md shadow-sm p-1 text-sm disabled:bg-gray-200 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex justify-center mt-3 space-x-2">
            <button
              class="bg-primaryMed hover:bg-primaryLight text-white py-1.5 px-3 rounded-md"
            >
              Preview
            </button>
            <button
              class="bg-green-500 hover:bg-green-600 text-white py-1.5 px-3 rounded-md"
              @click="saveChanges"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import {
  ChevronDownIcon,
  ChevronRightIcon,
  XMarkIcon,
  EyeIcon,
  BanIcon
} from '@heroicons/vue/24/outline';

export default {
  name: "DashboardModal",
  components: { ChevronDownIcon, ChevronRightIcon, XMarkIcon, EyeIcon, BanIcon },
  props: {
    show: { type: Boolean, required: true },
    dashboard: { type: Object, required: true },
  },
  data() {
    return {
      editedDashboard: {},
      activeSection: null,
      sections: {
        on_button: {
          title: "On Button",
          fields: [
            { label: "Status Text:", model: "status_text" },
            { label: "Status Color:", model: "status_color" },
            { label: "Button Label:", model: "button_label" },
          ],
        },
        off_button: {
          title: "Off Button",
          fields: [
            { label: "Status Text:", model: "status_text" },
            { label: "Status Color:", model: "status_color" },
            { label: "Button Label:", model: "button_label" },
          ],
        },
        pulse_button: {
          title: "Pulse Button",
          fields: [
            { label: "Status Text:", model: "status_text" },
            { label: "Button Label:", model: "button_label" },
          ],
        },
      },
    };
  },
  watch: {
    dashboard: {
      immediate: true,
      handler(newVal) {
        this.editedDashboard = JSON.parse(JSON.stringify(newVal));
      },
    },
  },
  methods: {
    closeModal() {
      this.$emit("close");
    },
    setEnabled(sectionKey, value) {
      this.editedDashboard[sectionKey].show = value;
      if (!value && this.activeSection === sectionKey) {
        this.activeSection = null;
      }
    },
    toggleExpansion(sectionKey) {
      if (!this.editedDashboard[sectionKey].show) return;
      this.activeSection = this.activeSection === sectionKey ? null : sectionKey;
    },
    getToggleButtonClass(sectionKey, buttonValue) {
      const isActive = this.editedDashboard[sectionKey].show === buttonValue;
      const baseClass = "py-1 px-3 text-sm font-medium border transition";

      const roundedClass = buttonValue
        ? "rounded-l-md border-r-0"
        : "rounded-r-md";

      return (
        `${baseClass} ${roundedClass} ` +
        (isActive
          ? "bg-blue-500 text-white border-blue-500"
          : "bg-white text-blue-500 border-blue-500 hover:bg-blue-50")
      );
    },
    saveChanges() {
      this.$emit("update-dashboard", this.editedDashboard);
      this.$emit("updated");
      this.closeModal();
    },
  },
};
</script>

<style scoped>
/* Modal fade animation */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
