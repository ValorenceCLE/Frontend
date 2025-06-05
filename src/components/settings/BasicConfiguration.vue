<!-- src/components/settings/BasicConfiguration.vue -->
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
        <input v-model="formData.system_name" @input="markTouched('system_name')" type="text"
          class="w-[40%] p-1 border border-gray-400 rounded"
          :class="{ 'border-red-500': validationErrors.system_name && touched.system_name }"
          :placeholder="generalData?.system_name || 'Enter system name'" />
      </div>

      <!-- Reboot Time (Inline) -->
      <div class="flex items-center justify-between px-4">
        <label class="text-Settings text-textColor">Reboot Time:</label>
        <input v-model="formData.reboot_time" @input="markTouched('reboot_time')" type="time"
          class="w-[40%] p-1 border border-gray-400 rounded"
          :class="{ 'border-red-500': validationErrors.reboot_time && touched.reboot_time }" />
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
          <input type="file" ref="configFile" @change="handleFileSelection" accept=".json" class="hidden" />
          <button type="button"
            class="flex items-center justify-center bg-textColor hover:bg-primaryMed text-white font-semibold px-3 py-1.5 rounded shadow w-[150px]"
            @click="openFilePicker" :disabled="isLoading">
            <img src="@/assets/icons/upload.svg" alt="Upload Icon" class="w-5 h-5 mr-2" />
            Upload File
          </button>
        </div>
      </div>

      <!-- Download Section -->
      <div class="flex items-center justify-between px-4">
        <h3 class="text-Settings text-textColor">
          Download Configuration:
        </h3>
        <button type="button"
          class="flex items-center justify-center bg-textColor hover:bg-primaryMed text-white font-semibold px-3 py-1.5 rounded shadow w-[150px]"
          @click="exportConfiguration" :disabled="isLoading">
          <img src="@/assets/icons/download.svg" alt="Download Icon" class="w-5 h-5 mr-2" />
          Download
        </button>
      </div>

      <!-- Error message -->
      <div v-if="error" class="px-4 py-1 text-red-500 text-center">
        {{ error }}
      </div>

      <!-- Success message -->
      <div v-if="successMessage" class="px-4 py-1 text-green-600 text-center">
        {{ successMessage }}
      </div>

      <!-- ========== SUBMIT / CANCEL SECTION ========== -->
      <div class="flex items-center justify-center space-x-2 border-t border-gray-500 p-2">
        <button type="button"
          class="bg-primaryMed hover:bg-primaryLight text-white text-FormButton py-1.5 px-3 flex justify-center rounded-md border border-gray-400 w-24"
          @click="handleSubmit" :disabled="isLoading || (!isDirty && !uploaded_config)">
          <span v-if="isLoading">
            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block mr-1"></div>
          </span>
          <span v-else>Submit</span>
        </button>
        <button type="button"
          class="bg-textColor hover:bg-gray-700 text-white text-FormButton py-1.5 px-3 flex justify-center rounded-md border border-gray-400 w-24"
          @click="handleCancel" :disabled="isLoading || (!isDirty && !uploaded_config)">
          Cancel
        </button>
      </div>
    </div>

    <!-- ========== REBOOT BUTTONS ROW ========== -->
    <div class="bg-gray-200 p-2 rounded border border-gray-500 shadow-md flex flex-col mt-1">
      <div class="flex justify-between space-x-2">
        <button class="w-[90%] bg-textColor hover:bg-red-800 text-white text-FormButton px-2 py-2 rounded-md shadow"
          @click="rebootDeviceHandler" :disabled="isLoading">
          Restart
        </button>
        <button class="w-[90%] bg-textColor hover:bg-red-800 text-white font-bold px-2 py-2 rounded-md shadow"
          @click="factoryResetHandler" :disabled="isLoading">
          Restore Default
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useConfig } from '@/composables/useConfig';
import { rebootDevice } from '@/api/deviceService';

// Use the config composable for the general section and full config
const {
  sectionData: generalData,
  configData,
  formData,
  isLoading,
  error,
  successMessage,
  isDirty,
  touched,
  validationErrors,
  markTouched,
  updateSection,
  updateConfig,
  revertToDefaults,
  resetForm
} = useConfig('general');

// File upload state
const current_config_file_name = ref("config.json");
const new_config_file_name = ref(null);
const uploaded_config = ref(null);
const configFile = ref(null);

// Open the hidden file input
const openFilePicker = () => {
  configFile.value.click();
};

// Handle file selection: store file name and parse config
const handleFileSelection = (event) => {
  const file = event.target.files[0];
  if (file) {
    new_config_file_name.value = file.name;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsedConfig = JSON.parse(e.target.result);
        uploaded_config.value = parsedConfig;
      } catch (err) {
        error.value = "Invalid configuration file format. Please select a valid JSON file.";
      }
    };
    reader.readAsText(file);
  }
};

// Export the current configuration
const exportConfiguration = () => {
  if (configData.value) {
    const data = JSON.stringify(configData.value, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    // Create and click a download link
    const link = document.createElement("a");
    link.href = url;

    // Use system name for the filename
    const systemName = configData.value.general?.system_name || "System";
    const safeSystemName = systemName.replace(/[^a-z0-9_-]/gi, '_');
    link.download = `${safeSystemName}_config.json`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

// Submit form changes
const handleSubmit = async () => {
  try {
    // If a new file was uploaded, update the full configuration
    if (new_config_file_name.value && uploaded_config.value) {
      await updateConfig(uploaded_config.value);

      current_config_file_name.value = new_config_file_name.value;
      new_config_file_name.value = null;
      uploaded_config.value = null;
    } else {
      // Otherwise, update only the "general" section
      await updateSection();
    }
  } catch (error) {
  }
};

// Cancel local changes
const handleCancel = () => {
  resetForm();
  new_config_file_name.value = null;
  uploaded_config.value = null;
};

// Confirmation helper for reboot actions
const confirmAction = (actionName, callback) => {
  const confirmMessage = `You are about to ${actionName}.\n\nAre you sure you want to continue?`;
  if (window.confirm(confirmMessage)) {
    callback();
  }
};

// Reboot device handler
const rebootDeviceHandler = async () => {
  try {
    await rebootDevice();
    successMessage.value = "Device restart command sent successfully.";
  } catch (err) {
    error.value = "Failed to restart device: " + err.message;
  }
};

// Reboot system
const rebootSystem = () => {
  // Add your system reboot logic here
};

// Factory reset handler
const factoryResetHandler = async () => {
  try {
    await revertToDefaults();
    // Reset handled by the composable, which will update store and show success message
  } catch (err) {
    // Error handled by composable
  }
};
</script>

<style scoped>
img {
  filter: brightness(0) invert(1);
  /* Matches text color */
}
</style>