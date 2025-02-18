<template>
  <div class="flex items-center justify-center w-full h-full relative shadow">
    <div class="w-full mx-auto rounded-md" style="max-width: 40rem">
      <div class="bg-gray-200 shadow rounded border-gray-500 border relative">
        <table class="w-full border-collapse">
          <thead>
            <tr>
              <th
                class="py-2 text-center text-textColor text-FormHeader border-b border-gray-500"
                colspan="2"
              >
                Network Settings
              </th>
            </tr>
          </thead >
          <div class="py-1"></div>
          <tbody class="text-textColor">
            <!-- IP Address -->
            <tr class="text-center">
              <td class="text-Body font-bold py-1">IP Address:</td>
              <td>
                <div class="flex justify-center">
                  <input
                    v-model="networkSettings.ip_address"
                    class="border-gray-500 border rounded text-Form text-center w-48"
                    type="text"
                  />
                </div>
              </td>
            </tr>

            <!-- Subnet Mask -->
            <tr class=" text-center">
              <td class="text-Body font-bold py-1">Subnet Mask:</td>
              <td>
                <div class="flex justify-center">
                  <input
                    v-model="networkSettings.subnet_mask"
                    class="border-gray-500 border rounded text-Form text-center w-48"
                    type="text"
                  />
                </div>
              </td>
            </tr>

            <!-- Gateway -->
            <tr class="text-center">
              <td class="text-Body font-bold py-1">Gateway:</td>
              <td>
                <div class="flex justify-center">
                  <input
                    v-model="networkSettings.gateway"
                    class="border-gray-500 border rounded text-Form text-center w-48" 
                    type="text"
                  />
                </div>
              </td>
            </tr>

            <!-- Use DHCP -->
            <tr class="text-center">
              <td class="text-Body font-bold py-1">Use DHCP:</td>
              <td>
                <div class="flex justify-center">
                  <div class="flex rounded-md w-max overflow-hidden border border-gray-500 font-bold">
                    <button
                      :class="[
                        'py-0.5 px-3 text-FormButton transition-colors',
                        networkSettings.dhcp_enabled
                          ? 'bg-primaryMed text-white'
                          : 'bg-buttonUnselected text-textColor hover:bg-buttonHover hover:text-white',
                      ]"
                      @click="networkSettings.dhcp_enabled = true"
                    >
                      Yes
                    </button>
                    <button
                      :class="[
                        'py-0.5 px-3 text-FormButton transition-colors font-bold',
                        !networkSettings.dhcp_enabled
                          ? 'bg-primaryMed text-white'
                          : 'bg-buttonUnselected text-textColor hover:bg-buttonHover hover:text-white',
                      ]"
                      @click="networkSettings.dhcp_enabled = false"
                    >
                      No
                    </button>
                  </div>
                </div>
              </td>
            </tr>

            <!-- Preferred DNS -->
            <tr class="text-center">
              <td class="text-Body font-bold py-1">Preferred DNS:</td>
              <td >
                <div class="flex justify-center">
                  <input
                    v-model="networkSettings.perfered_dns"
                    class="border-gray-500 border rounded text-Form text-center w-48"
                    type="text"
                  />
                </div>
              </td>
            </tr>

            <!-- Alternate DNS -->
            <tr class="text-center">
              <td class="text-Body font-bold py-1">Alternate DNS:</td>
              <td>
                <div class="flex justify-center">
                  <input
                    v-model="networkSettings.alternate_dns"
                    class="border-gray-500 border rounded text-Form text-center w-48"
                    type="text"
                  />
                </div>
              </td>
            </tr>

            <!-- HTTPS Port -->
            <tr class="text-center">
              <td class="text-Body font-bold py-1">HTTPS Port:</td>
              <td>
                <div class="flex justify-center">
                  <input
                    v-model="networkSettings.https_port"
                    class="border-gray-500 border rounded text-Form text-center w-48"
                    type="number"
                  />
                </div>
              </td>
            </tr>

            <!-- Submit and Clear Buttons -->
            <tr>
              <td class="pt-2 pb-1.5 text-center" colspan="2">
                <div class="flex justify-center gap-2">
                  <button
                    class="bg-primaryMed hover:bg-primaryLight text-white text-FormSubmit py-1 flex justify-center rounded-md border border-gray-500 w-24"
                    @click="submitSettings"
                  >
                    Submit
                  </button>
                  <button
                    class="bg-grayDark hover:bg-gray-700 text-white text-FormSubmit py-1 flex justify-center rounded-md border border-gray-500 w-24"
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
      backupSettings: {},
    };
  },
  methods: {
    fetchNetworkSettings() {
      const response = DummyAPI.get("/api/network");
      if (response.success) {
        this.networkSettings = { ...response.data };
        this.backupSettings = { ...response.data };
      }
    },
    submitSettings() {
      const response = DummyAPI.post("/api/network", this.networkSettings);
      if (response.success) {
        console.log("Settings successfully updated:", response.data);
      }
    },
    clearSettings() {
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
  outline: 0.75px solid #333; /* Change to your desired color */
  border-color: #333; /* Match the border color if desired */
}
select:focus {
  outline: 0.75px solid #333;
  border-color: #333;
}
</style>
