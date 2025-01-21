<template>
  <div class="flex items-center justify-center w-full h-full relative">
    <div class="w-full mx-auto rounded-md" style="max-width: 40rem">
      <div class="bg-gray-200 shadow-lg rounded-md my-3 border border-gray-500 relative">
        <table class="text-left w-full border-collapse">
          <thead>
            <tr>
              <th
                class="py-2 text-center text-textColor text-FormHeader border-b border-gray-500"
                colspan="2"
              >
                Configuration File
              </th>
            </tr>
          </thead>
          <tbody class="text-textColor">
            <!-- Import Section -->
            <tr>
              <td class="py-2 px-5 text-Body font-bold align-top">
                Upload Configuration:
              </td>
              <td class="py-2 px-2">
                <div class="space-y-4">
                  <!-- File Input -->
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
                      class="flex items-center justify-center bg-textColor hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded shadow w-auto"
                      @click="openFilePicker"
                    >
                      <img
                        src="@/assets/icons/upload.svg"
                        alt="Upload Icon"
                        class="w-5 h-5 mr-2"
                      />
                      Select File
                    </button>
                  </div>
                  <!-- Use Default Settings Checkbox -->

                  <!-- Apply Button -->
                  <!-- <button
                    type="button"
                    class="flex items-center justify-center bg-textColor hover:bg-yellow-600 text-white font-semibold px-4 py-2 rounded shadow w-fit"
                    @click="applyConfiguration"
                  >
                    Apply
                  </button> -->
                </div>
              </td>
            </tr>
            <!-- Divider -->
            <tr>
              <td class="py-2 px-5" colspan="2">
                <hr class="border-gray-300" />
              </td>
            </tr>
            <!-- Export Section -->
            <tr>
              <td class="py-2 px-5 text-Body font-bold align-center">
                Download Configuration:
              </td>
              <td class="py-2 px-2">
                <button
                  type="button"
                  class="flex items-center justify-center bg-textColor hover:bg-green-600 text-white font-semibold px-4 py-2 rounded shadow w-auto"
                  @click="exportConfiguration"
                >
                  <img
                    src="@/assets/icons/download.svg"
                    alt="Download Icon"
                    class="w-5 h-5 mr-2"
                  />
                  Export
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Configuration",
  data() {
    return {
      useDefaultSettings: false, // Single option: Use Default Settings
      selectedFile: null, // Holds the selected file
    };
  },
  methods: {
    openFilePicker() {
      // Trigger the file input to open the file selection dialog
      this.$refs.configFile.click();
    },
    handleFileSelection(event) {
      const file = event.target.files[0];
      if (file) {
        this.selectedFile = file;
        console.log("File selected:", file.name);
      }
    },
    applyConfiguration() {
      if (!this.selectedFile) {
        alert("Please select a configuration file to apply.");
        return;
      }

      console.log("Applying configuration with file:", this.selectedFile.name);
      console.log("Use Default Settings:", this.useDefaultSettings);
      // Logic to apply the selected configuration file goes here
    },
    exportConfiguration() {
      console.log("Exporting configuration...");
      // Logic to export the configuration file goes here
    },
  },
};
</script>

<style scoped>
/* Customize the focus ring color */
input:focus,
select:focus {
  outline: 1px solid #909294;
  border-color: #909294;
}
button:focus {
  outline: 2px solid #2563eb; /* Tailwind Blue */
  outline-offset: 2px;
}
img {
  filter: brightness(0) invert(1); /* Matches text color */
}
</style>
