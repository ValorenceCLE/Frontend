<template>
  <div class="flex items-center justify-center w-full h-full relative">
    <div class="w-full mx-auto rounded-md" style="max-width: 40rem">
      <div class="bg-gray-200 shadow rounded my-2 border border-gray-500 relative">
        <table class="text-left w-full border-collapse">
          <thead>
            <tr>
              <th
                class="py-2 text-center text-textColor text-FormHeader border-b border-gray-500"
                colspan="2"
              >
                Date/Time Settings
              </th>
            </tr>
          </thead>
          <tbody class="text-textColor">
            <!-- Input Fields -->
            <tr>
              <td class="py-2 px-4 text-Body font-bold">Primary NTP Server:</td>
              <td class="py-2 px-1">
                <input
                  v-model="timezoneSettings.primary_ntp_server"
                  class="border-grayMed border rounded w-3/4 px-1 text-Form"
                  type="text"
                />
              </td>
            </tr>
            <tr>
              <td class="py-2 px-4 text-Body font-bold">Secondary NTP Server:</td>
              <td class="py-2 px-1">
                <input
                  v-model="timezoneSettings.secondary_ntp_server"
                  class="border-grayMed border rounded w-3/4 px-1 text-Form"
                  type="text"
                />
              </td>
            </tr>
            <tr>
              <td class="py-2 px-4 text-Body font-bold">Sync on Boot:</td>
              <td class="py-2 px-1">
                <div class="flex rounded-md w-max overflow-hidden border border-grayMed">
                  <button
                    :class="[
                      'py-0.5 px-3  text-FormButton transition-colors',
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
                      'py-0.5 px-3 text-FormButton transition-colors',
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
              <td class="py-2 px-4 text-Body font-bold">Time Zone:</td>
              <td class="py-2 px-1">
                <select
                  v-model="timezoneSettings.time_zone"
                  @change="updateUTCOffset"
                  class="border-grayMed border rounded w-3/4 px-1 text-Form"
                >
                  <option value="" disabled>Select Time Zone</option>
                  <option value="America/New_York">New York</option>
                  <option value="America/Chicago">Chicago</option>
                  <option value="America/Denver">Denver</option>
                  <option value="America/Phoenix">Phoenix</option>
                  <option value="America/Los_Angeles">Los Angeles</option>
                  <option value="America/Adak">Adak</option>
                  <option value="Pacific/Honolulu">Honolulu</option>
                </select>
              </td>
            </tr>
            <tr>
              <td class="py-2 px-4 text-Body font-bold">UTC Offset:</td>
              <td class="py-2 px-1">
                <input
                  v-model="timezoneSettings.utc_offset"
                  class="border-grayMed border rounded w-3/4 px-1 text-Form"
                  type="text"
                />
              </td>
            </tr>

            <!-- Submit & Clear Buttons -->
            <tr>
              <td class="py-2 text-center" colspan="2">
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
      VALID_TIME_ZONES: {
        "America/New_York": -5,
        "America/Chicago": -6,
        "America/Denver": -7,
        "America/Phoenix": -7, // No DST
        "America/Los_Angeles": -8,
        "America/Adak": -10,
        "Pacific/Honolulu": -10, // No DST
      },
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
    updateUTCOffset() {
      // Update the UTC offset based on the selected timezone
      const selectedZone = this.timezoneSettings.time_zone;
      this.timezoneSettings.utc_offset =
        this.VALID_TIME_ZONES[selectedZone]?.toString() || "";
    },
  },
  mounted() {
    this.fetchTimezoneSettings();
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
