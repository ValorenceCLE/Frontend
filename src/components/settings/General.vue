<template>
  <div class="w-full mx-auto" style="width: 60rem">
    <!-- Header -->
    <div
      class="bg-gray-200 p-3 rounded-lg shadow-md border border-gray-400 max-w-xl flex justify-center items-center mx-auto"
    >
      <div class="flex flex-col items-center justify-center w-full h-12">
        <!-- Main title: "Basic Settings" -->
        <h1 class="text-FormHeader text-textColor font-bold mb-1">Protoype DPM #1</h1>
        <p class="text-Body text-textColor">{{ formattedDateTime }}</p>
        <!-- Subheader line: "System Time: ..." -->
      </div>
    </div>

    <!-- Main Layout with Equal Height Columns -->
    <div class="w-full mt-3 mb-3 flex text-center space-x-3 break-words items-stretch">
      <!-- Left Column (Three Stacked Content Boxes with Additional Content) -->
      <div class="flex-[1.2] flex flex-col gap-3">
        <!-- Controller Section -->
        <div
          class="bg-gray-200 p-1 rounded-lg border border-gray-400 shadow-md flex flex-col items-center justify-start flex-1"
        >
          <h1
            class="text-center border-b-2 border-gray-700 w-full text-FormSubmit text-textColor"
          >
            Controller
          </h1>
          <div class="mt-2 space-y-0.5 text-Form text-textColor text-left px-2 w-full">
            <div class="flex justify-between">
              Serial Number:
              <span>100000001d546663</span>
            </div>
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
          class="bg-gray-200 p-1 rounded-lg border border-gray-400 shadow-md flex flex-col items-center justify-start flex-1"
        >
          <h1
            class="text-center border-b-2 border-gray-700 w-full text-FormSubmit text-textColor"
          >
            Router
          </h1>
          <div class="mt-2 space-y-1 text-Form text-textColor text-left px-2 w-full">
            <div class="flex justify-between">
              Status:
              <span>Online</span>
            </div>
            <div class="flex justify-between">
              Uptime:
              <span>5 Hours</span>
            </div>
            <div class="flex justify-between">
              Serial Number:
              <span>192F-52EB-C0F2</span>
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
          class="bg-gray-200 p-2 rounded-lg border border-gray-400 shadow-md flex flex-col items-center justify-start flex-1"
        >
          <h1
            class="text-center border-b-2 border-gray-700 w-full text-FormSubmit text-textColor"
          >
            Camera
          </h1>
          <div class="mt-2 space-y-1 text-Form text-textColor text-left px-2 w-full">
            <div class="flex justify-between">
              Status:
              <span>Online</span>
            </div>
            <div class="flex justify-between">
              Uptime:
              <span>5 Hours</span>
            </div>
            <div class="flex justify-between">
              Serial Number:
              <span>192F-52EB-C0F2</span>
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
</template>

<script>
import BasicConfiguration from "./BasicConfiguration.vue";
export default {
  name: "General",
  components: { BasicConfiguration },
  created() {},
  data() {
    return {
      systemName: "",
      rebootTime: "",
      currentTime: new Date(), // Store the current date object
      selectedFile: null,
      pingTarget: "",
    };
  },
  props: {},
  computed: {
    formattedDateTime() {
      return this.formatDateTime(this.currentTime);
    },
  },
  methods: {
    formatDateTime(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const seconds = String(date.getSeconds()).padStart(2, "0");
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
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
