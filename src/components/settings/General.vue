<template>
  <div class="flex items-center justify-center w-full h-full relative">
    <div class="w-full mx-auto relative" style="width: 60rem">
      <!-- Header -->
      <div
        class="bg-gray-200 px-2 py-2 rounded-md shadow border border-gray-500 max-w-xl flex justify-center items-center mx-auto relative"
      >
        <div class="flex flex-col items-center justify-center w-full h-14">
          <!-- Main title dynamically passed from the config's general.system_name -->
          <div class="flex items-center">
            <h1 class="text-FormHeader text-textColor mb-1">
              {{ displayed_system_name }}
            </h1>
            <!-- Refresh button to manually update the configuration -->
          </div>
          <p class="text-Body text-textColor">{{ formattedDateTime }}</p>
        </div>
      </div>

      <!-- Main Layout with Equal Height Columns -->
      <div class="w-full mt-2 mb-2 flex text-center space-x-2 break-words items-stretch">
        <!-- Left Column (Three Stacked Content Boxes with Additional Content) -->
        <div class="flex-[1.2] flex flex-col gap-3">
          <!-- Controller Section -->
          <div
            class="bg-gray-200 rounded-lg border border-gray-500 shadow-md flex flex-col items-center justify-start flex-1"
          >
            <h1
              class="text-center border-b border-gray-900 w-full text-FormSubmit text-textColor"
            >
              Controller
            </h1>
            <div class="space-y-1 text-Form font-semibold text-textColor text-left w-full px-2 py-1">
              <div class="flex justify-between">
                CPU Load
                <span>17%</span>
              </div>
              <div class="flex justify-between">
                Memory
                <span>65%</span>
              </div>
              <div class="flex justify-between">
                Logs:
                <span>
                  <button type="button" class="flex items-center justify-center">
                    <img
                      src="@/assets/icons/download.svg"
                      alt="Download Icon"
                      class="w-5 h-5"
                    />
                  </button>
                </span>
              </div>
            </div>
          </div>

          <!-- Router Section -->
          <div
            class="bg-gray-200 rounded-lg border border-gray-500 shadow-md flex flex-col items-center justify-start flex-1"
          >
            <h1
              class="text-center border-b border-gray-900 w-full text-FormSubmit text-textColor"
            >
              Router
            </h1>
            <div class="space-y-1 text-Form font-semibold text-textColor text-left w-full px-2 py-1">
              <div class="flex justify-between">
                Status:
                <span>Online</span>
              </div>
              <div class="flex justify-between">
                Uptime:
                <span>5 Hours</span>
              </div>
              <div class="flex justify-between">
                Logs:
                <span>
                  <button type="button" class="flex items-center justify-center">
                    <img
                      src="@/assets/icons/download.svg"
                      alt="Download Icon"
                      class="w-5 h-5"
                    />
                  </button>
                </span>
              </div>
            </div>
          </div>

          <!-- Camera Section -->
          <div
            class="bg-gray-200 rounded border border-gray-500 shadow flex flex-col items-center justify-start flex-1"
          >
            <h1
              class="text-center border-b border-gray-900 w-full text-FormSubmit text-textColor"
            >
              Camera
            </h1>
            <div class="space-y-1 text-Form font-semibold text-textColor text-left w-full px-2 py-1">
              <div class="flex justify-between">
                Status:
                <span>Online</span>
              </div>
              <div class="flex justify-between">
                Uptime:
                <span>5 Hours</span>
              </div>
              <div class="flex justify-between">
                Logs:
                <span>
                  <button type="button" class="flex items-center justify-center">
                    <img
                      src="@/assets/icons/download.svg"
                      alt="Download Icon"
                      class="w-5 h-5"
                    />
                  </button>
                </span>
              </div>
            </div>
          </div>
        </div>
        <!-- Main Content Column -->
        <div class="flex-[2.8] flex flex-col gap-3">
          <BasicConfiguration class="flex-1" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import BasicConfiguration from "./BasicConfiguration.vue";
import { useConfigStore } from "@/store/config";

export default {
  name: "General",
  components: { BasicConfiguration },
  data() {
    return {
      currentTime: new Date(), // Store the current date object
    };
  },
  computed: {
    // Access the global configuration store
    configStore() {
      return useConfigStore();
    },
    // Dynamically display system name from global config general object
    displayed_system_name() {
      const config = this.configStore.configData;
      return config && config.general && config.general.system_name
        ? config.general.system_name
        : "Unknown System";
    },
    formattedDateTime() {
      const date = this.currentTime;
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const seconds = String(date.getSeconds()).padStart(2, "0");
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    },
  },
  methods: {
    refreshConfig() {
      // Trigger a manual refresh of the configuration without reloading the page
      this.configStore.refreshConfig();
    },
  },
  mounted() {
    // Update currentTime every second so displayed time is live
    this.timer = setInterval(() => {
      this.currentTime = new Date();
    }, 1000);
  },
  beforeUnmount() {
    clearInterval(this.timer);
  },
};
</script>
