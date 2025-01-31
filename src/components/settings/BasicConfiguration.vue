<template>
  <!-- Parent wrapper for everything -->
  <div class="flex flex-col h-full">
    <!-- Main Container (Fields, Configuration, Submit/Cancel) -->
    <div
      class="bg-gray-200 p-4 rounded-lg border border-gray-400 shadow-md flex flex-col"
    >
      <!-- Header -->
      <div class="flex flex-col items-center justify-center">
        <h1 class="text-Header text-textColor font-bold -translate-y-1">
          Basic Configuration
        </h1>
        <div class="w-full h-[2px] bg-gray-700 mx-auto mb-2 m-1"></div>
      </div>

      <!-- System Name (Inline) -->
      <div class="flex items-center justify-between mt-4">
        <label class="text-Settings text-textColor">System Name:</label>
        <input
          v-model="systemName"
          type="text"
          class="w-[40%] p-1 border border-gray-400 rounded"
          placeholder="Enter system name"
        />
      </div>

      <!-- Reboot Time (Inline) -->
      <div class="flex items-center justify-between mt-4">
        <label class="text-Settings text-textColor">Reboot Time:</label>
        <input
          v-model="rebootTime"
          type="time"
          class="w-[40%] p-1 border border-gray-400 rounded"
        />
      </div>

      <!-- Ping Test -->
      <div class="flex items-center justify-between mt-4">
        <label class="text-Settings text-textColor">Ping Test:</label>
        <div class="flex items-center space-x-1 w-[40%]">
          <input
            v-model="pingTarget"
            type="text"
            class="flex-1 p-1 border border-gray-400 rounded"
            placeholder="Enter IP or domain"
          />
          <button
            class="bg-primaryMed hover:bg-primaryLight text-white font-semibold py-1 px-3 h-8 rounded shadow"
            @click="runPingTest"
          >
            <img src="@/assets/icons/play.svg" alt="Play Icon" class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- ========== CONFIGURATION SECTION ========== -->

      <!-- Upload Section -->
      <div class="flex items-center justify-between mt-4 mb-4">
        <h3 class="text-Settings text-textColor">
          Upload Configuration:
          <!-- SHOW the uploaded file name ONLY if newConfigFileName is set -->
          <span v-if="newConfigFileName" class="ml-2 text-sm text-gray-800">
            ({{ newConfigFileName }})
          </span>
        </h3>
        <div>
          <input
            type="file"
            ref="configFile"
            @change="handleFileSelection"
            accept=".json"
            class="hidden"
          />
          <button
            type="button"
            class="flex items-center justify-center bg-textColor hover:bg-primaryMed text-white font-semibold px-4 py-2 rounded shadow w-[150px]"
            @click="openFilePicker"
          >
            <img src="@/assets/icons/upload.svg" alt="Upload Icon" class="w-5 h-5 mr-2" />
            Upload File
          </button>
        </div>
      </div>

      <!-- Download Section -->
      <div class="flex items-center justify-between">
        <h3 class="text-Settings text-textColor">
          Download Configuration:
          <!-- ALWAYS show the currentConfigFileName here (no new file until submit) -->
          <span v-if="currentConfigFileName" class="ml-2 text-sm text-gray-800">
            ({{ currentConfigFileName }})
          </span>
        </h3>
        <button
          type="button"
          class="flex items-center justify-center bg-textColor hover:bg-primaryMed text-white font-semibold px-4 py-2 rounded shadow w-[150px]"
          @click="exportConfiguration"
        >
          <img
            src="@/assets/icons/download.svg"
            alt="Download Icon"
            class="w-5 h-5 mr-2"
          />
          Download
        </button>
      </div>

      <!-- ========== SUBMIT / CANCEL SECTION ========== -->
      <div class="flex items-center justify-center space-x-2 mt-8">
        <button
          type="button"
          class="bg-primaryMed hover:bg-primaryLight text-white font-bold py-2 px-4 flex justify-center rounded-md border border-gray-400 w-24"
          @click="handleSubmit"
        >
          Submit
        </button>
        <button
          type="button"
          class="bg-textColor hover:bg-gray-700 text-white font-bold py-2 px-4 flex justify-center rounded-md border border-gray-400 w-24"
          @click="handleCancel"
        >
          Cancel
        </button>
      </div>
    </div>

    <!-- ========== REBOOT BUTTONS ROW ========== -->
    <div
      class="bg-gray-200 p-2 rounded-lg border border-gray-400 shadow-md flex flex-col mt-3"
    >
      <div class="flex justify-between space-x-2">
        <button
          class="w-[90%] bg-textColor hover:bg-red-800 text-white font-bold px-2 py-2 rounded shadow"
          @click="confirmAction('Restart the Raspberry Pi', rebootDevice)"
        >
          Restart
        </button>
        <button
          class="w-[90%] bg-textColor hover:bg-red-800 text-white font-bold px-2 py-2 rounded shadow"
          @click="
            confirmAction(
              'Power Cycle the system\nThis will cut the main power then turn it back on',
              rebootSystem
            )
          "
        >
          Power Cycle
        </button>
        <button
          class="w-[90%] bg-textColor hover:bg-red-800 text-white font-bold px-2 py-2 rounded shadow"
          @click="confirmAction('Restore factory defaults', factoryReset)"
        >
          Restore Default
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Basic",
  data() {
    return {
      systemName: "",
      rebootTime: "",
      currentTime: new Date(),
      pingTarget: "",

      // 1) The official/saved config file name
      currentConfigFileName: "MainConfig.json",

      // 2) A temporary file name if user uploads a new one.
      //    Only show if non-null
      newConfigFileName: null,
    };
  },
  computed: {
    // We keep this in case other parts of your code rely on it,
    // but no longer show it in the template for Download/Upload labels
    displayedConfigFileName() {
      return this.newConfigFileName || this.currentConfigFileName;
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
    // Confirmation helper
    confirmAction(actionName, callback) {
      const confirmMessage = `You are about to ${actionName}.\n\nAre you sure you want to continue?`;
      if (window.confirm(confirmMessage)) {
        callback();
      }
    },

    runPingTest() {
      alert(`Pinging ${this.pingTarget}...`);
      // Real ping logic would go here
    },

    // Open file dialog
    openFilePicker() {
      this.$refs.configFile.click();
    },
    handleFileSelection(event) {
      const file = event.target.files[0];
      if (file) {
        this.newConfigFileName = file.name;
        console.log("File selected:", file.name);
      }
    },

    // Download the current official config file
    exportConfiguration() {
      const data = { message: "This is a sample configuration file." };
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      // Always use the official (current) name, not any newly uploaded file
      link.download = this.currentConfigFileName;
      link.click();
      URL.revokeObjectURL(url);
    },

    // Submit -> finalize new file name
    handleSubmit() {
      if (this.newConfigFileName) {
        this.currentConfigFileName = this.newConfigFileName;
        this.newConfigFileName = null;
      }
      console.log("Form submitted with:", {
        systemName: this.systemName,
        rebootTime: this.rebootTime,
        configFileName: this.currentConfigFileName,
      });
    },

    // Cancel -> discard new file name
    handleCancel() {
      this.newConfigFileName = null;
      this.systemName = "";
      this.rebootTime = "";
      console.log("Changes have been canceled.");
    },

    rebootDevice() {
      console.log("Rebooting device...");
      alert("Device is restarting now...");
    },
    rebootSystem() {
      console.log("Rebooting system...");
      alert("Beginning power cycle...\nPlease do not navigate away from this page.");
    },
    factoryReset() {
      console.log("Performing factory reset...");
      alert("Factory reset initiated! This will restore all settings to default.");
    },
  },
  mounted() {
    // Keep the current time updated if used elsewhere
    this.timer = setInterval(() => {
      this.currentTime = new Date();
    }, 1000);
  },
  beforeUnmount() {
    clearInterval(this.timer);
  },
};
</script>

<style scoped>
img {
  filter: brightness(0) invert(1); /* Matches text color */
}
</style>
