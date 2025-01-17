<template>
  <div class="flex items-center justify-center w-full h-full relative">
    <div class="w-full mx-auto rounded-md" style="max-width: 40rem">
      <div class="bg-gray-200 shadow-lg rounded-lg my-3 border-gray-500 border relative">
        <table class="text-left w-full border-collapse">
          <thead>
            <tr>
              <th
                class="py-3 text-center text-textColor text-FormHeader border-b border-gray-500"
                colspan="2"
              >
                Network Settings
              </th>
            </tr>
          </thead>
          <tbody class="text-textColor">
            <!-- Input Fields -->
            <tr>
              <td class="py-2 px-5 text-Body font-bold">IP Address:</td>
              <td class="py-2 px-2">
                <input
                  v-model="networkSettings.ip_address"
                  class="border-grayMed border rounded w-3/4 px-2 text-Form"
                  type="text"
                />
              </td>
            </tr>
            <tr>
              <td class="py-2 px-5 text-Body font-bold">Subnet Mask:</td>
              <td class="py-2 px-2">
                <input
                  v-model="networkSettings.subnet_mask"
                  class="border-grayMed border rounded w-3/4 px-2 text-Form"
                  type="text"
                />
              </td>
            </tr>
            <tr>
              <td class="py-2 px-5 text-Body font-bold">Gateway:</td>
              <td class="py-2 px-2">
                <input
                  v-model="networkSettings.gateway"
                  class="border-grayMed border rounded w-3/4 px-2 text-Form"
                  type="text"
                />
              </td>
            </tr>
            <tr>
              <td class="py-2 px-5 text-Body font-bold">Use DHCP:</td>
              <td class="py-2 px-2">
                <div class="flex rounded-md w-max overflow-hidden border border-grayMed">
                  <button
                    :class="[
                      'py-1 px-4 text-FormButton transition-colors',
                      networkSettings.dhcp_enabled
                        ? 'bg-primaryMed text-white'
                        : 'bg-buttonUnselected text-textColor hover:bg-buttonHover hover:text-white',
                      ,
                    ]"
                    @click="networkSettings.dhcp_enabled = true"
                  >
                    Yes
                  </button>
                  <button
                    :class="[
                      'py-1 px-4 text-FormButton transition-colors',
                      !networkSettings.dhcp_enabled
                        ? 'bg-primaryMed text-white'
                        : 'bg-buttonUnselected text-textColor hover:bg-buttonHover hover:text-white',
                      ,
                    ]"
                    @click="networkSettings.dhcp_enabled = false"
                  >
                    No
                  </button>
                </div>
              </td>
            </tr>
            <tr>
              <td class="py-2 px-5 text-Body font-bold">Preferred DNS:</td>
              <td class="py-2 px-2">
                <input
                  v-model="networkSettings.perfered_dns"
                  class="border-grayMed border rounded w-3/4 px-2 text-Form"
                  type="text"
                />
              </td>
            </tr>
            <tr>
              <td class="py-2 px-5 text-Body font-bold">Alternate DNS:</td>
              <td class="py-2 px-2">
                <input
                  v-model="networkSettings.alternate_dns"
                  class="border-grayMed border rounded w-3/4 px-2 text-Form"
                  type="text"
                />
              </td>
            </tr>
            <tr>
              <td class="py-2 px-5 text-Body font-bold">HTTPS Port:</td>
              <td class="py-2 px-2">
                <input
                  v-model="networkSettings.https_port"
                  class="border-grayMed border rounded w-3/4 px-2 text-Form"
                  type="number"
                />
              </td>
            </tr>
            <!-- Submit Button -->
            <tr>
              <td class="py-3 text-center" colspan="2">
                <div class="flex justify-center gap-2">
                  <!-- Submit Button -->
                  <button
                    class="bg-primaryMed hover:bg-primaryLight text-white text-FormSubmit py-1 px-4 flex justify-center rounded-md border border-grayMed w-24"
                    @click="submitSettings"
                  >
                    Submit
                  </button>
                  <!-- Clear Button -->
                  <button
                    class="bg-grayDark hover:bg-gray-700 text-white text-FormSubmit py-1 px-4 flex justify-center rounded-md border border-grayMed w-24"
                    @click="clearSettings"
                  >
                    Clear
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import DummyAPI from "@/api/dummyApi";

export default {
  name: "Network",
  data() {
    return {
      networkSettings: {
        ip_address: "",
        subnet_mask: "",
        gateway: "",
        dhcp_enabled: false,
        perfered_dns: "",
        alternate_dns: "",
        https_port: "",
      },
      backupSettings: {}, // Store the original fetched settings
    };
  },
  methods: {
    fetchNetworkSettings() {
      const response = DummyAPI.get("/api/network");
      if (response.success) {
        this.networkSettings = { ...response.data };
        this.backupSettings = { ...response.data }; // Backup the original data
      }
    },
    submitSettings() {
      const response = DummyAPI.post("/api/network", this.networkSettings);
      if (response.success) {
        console.log("Settings successfully updated:", response.data);
      }
    },
    clearSettings() {
      // Reset to original values
      this.networkSettings = { ...this.backupSettings };
    },
  },
  mounted() {
    this.fetchNetworkSettings();
  },
};
</script>
<style scoped>
/* Customize the focus ring color */
input:focus {
  outline: 1px solid #909294; /* Change to your desired color */
  border-color: #909294; /* Match the border color if desired */
}
select:focus {
  outline: 1px solid #909294; /* Change to your desired color */
  border-color: #909294; /* Match the border color if desired */
}
</style>
