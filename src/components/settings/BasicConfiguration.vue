<template>
  <!-- Parent wrapper for everything -->
  <div class="flex flex-col h-full">
    <!-- Main Container (Fields, Configuration, Submit/Cancel) -->
    <div class="bg-gray-200 rounded border border-gray-500 shadow flex flex-col space-y-2">
      <!-- Header -->
      <div class="flex flex-col items-center justify-center">
        <h1 class="text-FormHeader text-textColor border-b border-gray-900 w-full text-center p-1">
          Basic Configuration
        </h1>
      </div>

      <!-- System Name (Inline) -->
      <div class="flex items-center justify-between px-4">
        <label class="text-Settings text-textColor">System Name:</label>
        <input
          v-model="system_name"
          type="text"
          class="w-[40%] p-1 border border-gray-400 rounded"
          :placeholder="displayed_system_name"
        />
      </div>

      <!-- Reboot Time (Inline) -->
      <div class="flex items-center justify-between px-4">
        <label class="text-Settings text-textColor">Reboot Time:</label>
        <input
          v-model="reboot_time"
          type="time"
          class="w-[40%] p-1 border border-gray-400 rounded"
        />
      </div>

      <!-- ========== CONFIGURATION SECTION ========== -->

      <!-- Upload Section -->
      <div class="flex items-center justify-between px-4">
        <h3 class="text-Settings text-textColor">
          Upload Configuration:
          <!-- SHOW the uploaded file name ONLY if new_config_file_name is set -->
          <span v-if="new_config_file_name" class="ml-2 text-sm text-gray-800">
            ({{ new_config_file_name }})
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
            class="flex items-center justify-center bg-textColor hover:bg-primaryMed text-white font-semibold px-3 py-1.5 rounded shadow w-[150px]"
            @click="openFilePicker"
          >
            <img src="@/assets/icons/upload.svg" alt="Upload Icon" class="w-5 h-5 mr-2" />
            Upload File
          </button>
        </div>
      </div>

      <!-- Download Section -->
      <div class="flex items-center justify-between px-4">
        <h3 class="text-Settings text-textColor">
          Download Configuration:
          <!-- ALWAYS show the current_config_file_name here (no new file until submit) -->
          <span v-if="current_config_file_name" class="-ml-1 text-sm text-gray-800">
            ({{ current_config_file_name }})
          </span>
        </h3>
        <button
          type="button"
          class="flex items-center justify-center bg-textColor hover:bg-primaryMed text-white font-semibold px-3 py-1.5 rounded shadow w-[150px]"
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
      <div class="flex items-center justify-center space-x-2 border-t border-gray-500 p-2">
        <button
          type="button"
          class="bg-primaryMed hover:bg-primaryLight text-white text-FormButton py-1.5 px-3 flex justify-center rounded-md border border-gray-400 w-24"
          @click="handleSubmit"
        >
          Submit
        </button>
        <button
          type="button"
          class="bg-textColor hover:bg-gray-700 text-white text-FormButton py-1.5 px-3 flex justify-center rounded-md border border-gray-400 w-24"
          @click="handleCancel"
        >
          Cancel
        </button>
      </div>
    </div>

    <!-- ========== REBOOT BUTTONS ROW ========== -->
    <div class="bg-gray-200 p-2 rounded border border-gray-500 shadow-md flex flex-col mt-1">
      <div class="flex justify-between space-x-2">
        <button
          class="w-[90%] bg-textColor hover:bg-red-800 text-white text-FormButton px-2 py-2 rounded-md shadow"
          @click="confirmAction('Restart the Raspberry Pi', rebootDevice)"
        >
          Restart
        </button>
        <button
          class="w-[90%] bg-textColor hover:bg-red-800 text-white text-FormButton px-2 py-2 rounded-md shadow"
          @click="confirmAction('Power Cycle the system\nThis will cut the main power then turn it back on', rebootSystem)"
        >
          Power Cycle
        </button>
        <button
          class="w-[90%] bg-textColor hover:bg-red-800 text-white font-bold px-2 py-2 rounded-md shadow"
          @click="confirmAction('Restore factory defaults', factoryReset)"
        >
          Restore Default
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue';
import { useConfigStore } from '@/store/config';
import { rebootDevice } from '@/api/deviceService';

export default {
  name: "BasicConfiguration",
  setup() {
    const configStore = useConfigStore();

    // Local editable state for the "general" configuration fields.
    const system_name = ref("");
    const reboot_time = ref("");

    // File upload state.
    const current_config_file_name = ref("Config.json");
    const new_config_file_name = ref(null);
    const uploaded_config = ref(null);
    const configFile = ref(null);

    // Current time for display.
    const currentTime = ref(new Date());
    let timer = null;

    // Load the "general" config from the store.
    const loadConfig = () => {
      if (configStore.configData && configStore.configData.general) {
        system_name.value = configStore.configData.general.system_name || "";
        reboot_time.value = configStore.configData.general.reboot_time || "";
      }
    };

    // Watch for changes in the global config for system name.
    watch(
      () => configStore.configData?.general?.system_name,
      (newName) => {
        if (newName) {
          system_name.value = newName;
        }
      },
      { immediate: true }
    );

    // If configStore is not yet loaded, watch for it.
    if (!configStore.configData) {
      const stopWatch = watch(
        () => configStore.configData,
        (newVal) => {
          if (newVal) {
            loadConfig();
            stopWatch();
          }
        }
      );
    } else {
      loadConfig();
    }

    // Open the hidden file input.
    const openFilePicker = () => {
      configFile.value.click();
    };

    // Handle file selection: store file name and parse config.
    const handleFileSelection = (event) => {
      const file = event.target.files[0];
      if (file) {
        new_config_file_name.value = file.name;
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const parsedConfig = JSON.parse(e.target.result);
            uploaded_config.value = parsedConfig;
            console.log("Configuration file selected:", file.name);
          } catch (err) {
            console.error("Error parsing the configuration file:", err);
          }
        };
        reader.readAsText(file);
      }
    };

    const exportConfiguration = () => {
      if (configStore.configData) {
        const data = JSON.stringify(configStore.configData, null, 2);
        const blob = new Blob([data], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        
        // Create and click a download link
        const link = document.createElement("a");
        link.href = url;
        
        // Use system name for the filename
        const systemName = configStore.configData.general?.system_name || "System";
        const safeSystemName = systemName.replace(/[^a-z0-9_-]/gi, '_');
        link.download = `${safeSystemName}_config.json`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    };

    // Submit local changes.
    const handleSubmit = () => {
      // If a new file was uploaded, update the full configuration.
      if (new_config_file_name.value && uploaded_config.value) {
        configStore.updateConfig(uploaded_config.value)
          .then(() => {
            if (uploaded_config.value.general) {
              system_name.value = uploaded_config.value.general.system_name || "";
              reboot_time.value = uploaded_config.value.general.reboot_time || "";
            }
            current_config_file_name.value = new_config_file_name.value;
            new_config_file_name.value = null;
            uploaded_config.value = null;
            console.log("Configuration file uploaded and applied successfully.");
          })
          .catch((error) => {
            console.error("Failed to update configuration via file upload:", error);
          });
      } else {
        // Otherwise, update only the "general" section.
        const updatedGeneral = {
          ...configStore.configData.general,
          system_name: system_name.value,
          reboot_time: reboot_time.value,
        };
        configStore.updateConfigSection("general", updatedGeneral)
          .then(() => {
            console.log("Basic configuration updated successfully.");
          })
          .catch((error) => {
            console.error("Failed to update basic configuration:", error);
          });
      }
    };

    // Cancel local changes: reload from store and clear any pending file upload.
    const handleCancel = () => {
      loadConfig();
      new_config_file_name.value = null;
      uploaded_config.value = null;
      console.log("Changes have been canceled.");
    };

    // Confirmation helper for reboot actions.
    const confirmAction = (actionName, callback) => {
      const confirmMessage = `You are about to ${actionName}.\n\nAre you sure you want to continue?`;
      if (window.confirm(confirmMessage)) {
        callback();
      }
    };

    const rebootDevice = () => {
      console.log("Rebooting device...");
      alert("Device is restarting now...");
      rebootDevice();
    };

    const rebootSystem = () => {
      console.log("Rebooting system...");
      alert("Beginning power cycle...\nPlease do not navigate away from this page.");
    };

    const factoryReset = () => {
      console.log("Starting factory reset...");
      
      configStore.revertToDefaults()
        .then((response) => {
          console.log("Reset successful:", response);
          // Reload local state from the new config
          loadConfig();
          alert("Factory reset completed successfully. System restored to default settings.");
        })
        .catch((error) => {
          console.error("Factory reset failed:", error);
          alert(`Failed to restore factory defaults: ${error.message}`);
        });
    };

    // Computed for formatted current time.
    const formattedDateTime = computed(() => {
      const date = currentTime.value;
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const seconds = String(date.getSeconds()).padStart(2, "0");
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    });

    // Computed for displayed system name.
    const displayed_system_name = computed(() => {
      return configStore.configData && configStore.configData.general && configStore.configData.general.system_name
        ? configStore.configData.general.system_name
        : "Unknown System";
    });

    // Start timer to update current time.
    onMounted(() => {
      timer = setInterval(() => {
        currentTime.value = new Date();
      }, 1000);
      if (configStore.configData && configStore.configData.general) {
        system_name.value = configStore.configData.general.system_name || '';
      }
    });

    onBeforeUnmount(() => {
      clearInterval(timer);
    });

    return {
      // Local state and references
      system_name,
      reboot_time,
      current_config_file_name,
      new_config_file_name,
      configFile,
      currentTime,
      formattedDateTime,
      // Methods
      openFilePicker,
      handleFileSelection,
      exportConfiguration,
      handleSubmit,
      handleCancel,
      confirmAction,
      rebootDevice,
      rebootSystem,
      factoryReset,
      // Expose configStore and computed values
      configStore,
      displayed_system_name,
    };
  },
};
</script>

<style scoped>
img {
  filter: brightness(0) invert(1); /* Matches text color */
}
</style>
