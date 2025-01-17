<template>
  <div class="flex items-center justify-center w-full h-full relative">
    <div class="w-full mx-auto rounded-md" style="max-width: 40rem">
      <div class="bg-gray-200 shadow-lg rounded-lg my-3 border border-gray-500 relative">
        <table class="text-left w-full border-collapse">
          <thead>
            <tr>
              <th
                class="py-3 text-center text-textColor text-FormHeader border-b border-gray-500"
                colspan="2"
              >
                Date/Time Settings
              </th>
            </tr>
          </thead>
          <tbody class="text-textColor">
            <!-- Input Fields -->
            <tr>
              <td class="py-2 px-5 text-Body font-bold">Primary NTP Server:</td>
              <td class="py-2 px-2">
                <input
                  v-model="timezoneSettings.primary_ntp_server"
                  class="border-grayMed border rounded w-3/4 px-2 text-Form"
                  type="text"
                />
              </td>
            </tr>
            <tr>
              <td class="py-2 px-5 text-Body font-bold">Secondary NTP Server:</td>
              <td class="py-2 px-2">
                <input
                  v-model="timezoneSettings.secondary_ntp_server"
                  class="border-grayMed border rounded w-3/4 px-2 text-Form"
                  type="text"
                />
              </td>
            </tr>
            <tr>
              <td class="py-2 px-5 text-Body font-bold">Sync on Boot:</td>
              <td class="py-2 px-2">
                <div class="flex rounded-md w-max overflow-hidden border border-grayMed">
                  <button
                    :class="[
                      'py-1 px-4  text-FormButton transition-colors',
                      timezoneSettings.sync_on_boot
                        ? 'bg-primaryMed text-white'
                        : 'bg-buttonUnselected text-textColor hover:bg-buttonHover hover:text-white',
                    ]"
                    @click="timezoneSettings.sync_on_boot = true"
                  >
                    Yes
                  </button>
                  <button
                    :class="[
                      'py-1 px-4 text-FormButton transition-colors',
                      !timezoneSettings.sync_on_boot
                        ? 'bg-primaryMed text-white'
                        : 'bg-buttonUnselected text-textColor hover:bg-buttonHover hover:text-white',
                    ]"
                    @click="timezoneSettings.sync_on_boot = false"
                  >
                    No
                  </button>
                </div>
              </td>
            </tr>
            <tr>
              <td class="py-2 px-5 text-Body font-bold">Time Zone:</td>
              <td class="py-2 px-2">
                <input
                  v-model="timezoneSettings.time_zone"
                  class="border-grayMed border rounded w-3/4 px-2 text-Form"
                  type="text"
                />
              </td>
            </tr>
            <tr>
              <td class="py-2 px-5 text-Body font-bold">UTC Offset:</td>
              <td class="py-2 px-2">
                <input
                  v-model="timezoneSettings.utc_offset"
                  class="border-grayMed border rounded w-3/4 px-2 text-Form"
                  type="text"
                />
              </td>
            </tr>
            <!-- Submit & Clear Buttons -->
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
import DummyAPI from "@/api/DummyAPI";

export default {
  name: "DateTime",
  data() {
    return {
      timezoneSettings: {
        primary_ntp_server: "",
        secondary_ntp_server: "",
        sync_on_boot: true,
        time_zone: "",
        utc_offset: "",
      },
      backupSettings: {},
    };
  },
  methods: {
    fetchTimezoneSettings() {
      const response = DummyAPI.get("/api/timezone");
      if (response.success) {
        this.timezoneSettings = { ...response.data };
        this.backupSettings = { ...response.data };
      }
    },
    submitSettings() {
      const response = DummyAPI.post("/api/timezone", this.timezoneSettings);
      if (response.success) {
        console.log("Settings successfully updated:", response.data);
      }
    },
    clearSettings() {
      this.timezoneSettings = { ...this.backupSettings };
    },
  },
  mounted() {
    this.fetchTimezoneSettings();
  },
};
</script>
