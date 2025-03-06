<template>
  <div class="flex items-center justify-center w-full h-full relative">
    <div class="w-full mx-auto rounded-md" style="max-width: 40rem">
      <div class="bg-gray-200 shadow rounded border-gray-500 border relative">
        <table class="w-full border-collapse">
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
            <!-- Primary NTP Server -->
            <tr class="text-center">
              <td class="text-Body font-bold py-1">Primary NTP Server:</td>
              <td>
                <div class="flex justify-center">
                  <input
                    v-model="timezoneSettings.primary_ntp_server"
                    class="border-gray-500 border rounded text-Form text-center w-48"
                    type="text"
                  />
                </div>
              </td>
            </tr>

            <!-- Secondary NTP Server -->
            <tr class="text-center">
              <td class="text-Body font-bold py-1">Secondary NTP Server:</td>
              <td>
                <div class="flex justify-center">
                  <input
                    v-model="timezoneSettings.secondary_ntp_server"
                    class="border-gray-500 border rounded text-Form text-center w-48"
                    type="text"
                  />
                </div>
              </td>
            </tr>

            <!-- Sync on Boot (Yes/No) -->
            <tr class="text-center">
              <td class="text-Body font-bold py-1">Sync on Boot:</td>
              <td>
                <div class="flex justify-center">
                  <div class="flex rounded-md w-max overflow-hidden border border-gray-500 font-bold">
                    <button
                      :class="[ 
                        'py-0.5 px-3 text-FormButton transition-colors',
                        timezoneSettings.sync_on_boot
                          ? 'bg-primaryMed text-white'
                          : 'bg-buttonUnselected text-textColor hover:bg-buttonHover hover:text-white'
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
                          : 'bg-buttonUnselected text-textColor hover:bg-buttonHover hover:text-white'
                      ]"
                      @click="timezoneSettings.sync_on_boot = false"
                    >
                      No
                    </button>
                  </div>
                </div>
              </td>
            </tr>

            <!-- Time Zone (Select) -->
            <tr class="text-center">
              <td class="text-Body font-bold py-1">Time Zone:</td>
              <td>
                <div class="flex justify-center">
                  <select
                    v-model="timezoneSettings.time_zone"
                    @change="updateUTCOffset"
                    class="border-gray-500 border rounded text-Form text-center w-48"
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
                </div>
              </td>
            </tr>

            <!-- UTC Offset -->
            <tr class="text-center">
              <td class="text-Body font-bold py-1">UTC Offset:</td>
              <td>
                <div class="flex justify-center">
                  <input
                    v-model="timezoneSettings.utc_offset"
                    class="border-gray-500 border rounded text-Form text-center w-48"
                    type="text"
                  />
                </div>
              </td>
            </tr>

            <!-- Submit & Clear Buttons -->
            <tr>
              <td class="pt-2 pb-1.5 text-center" colspan="2">
                <div class="flex justify-center gap-2">
                  <!-- Submit Button -->
                  <button
                    class="bg-primaryMed hover:bg-primaryLight text-white text-FormSubmit py-1 flex justify-center rounded-md border border-gray-500 w-24"
                    @click="submitSettings"
                  >
                    Submit
                  </button>
                  <!-- Clear Button -->
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
import { useConfigStore } from '@/store/config';

export default {
  name: "DateTime",
  data() {
    return {
      // Local editable copy of the date/time settings
      timezoneSettings: {
        primary_ntp_server: "",
        secondary_ntp_server: "",
        sync_on_boot: true,
        time_zone: "",
        utc_offset: "",
      },
      // Backup copy for reverting changes
      backupSettings: {},
      // Mapping of time zones to UTC offsets
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
  computed: {
    // Access the global config store
    configStore() {
      return useConfigStore();
    }
  },
  methods: {
    loadTimezoneSettings() {
      if (this.configStore.configData && this.configStore.configData.date_time) {
        const dt = this.configStore.configData.date_time;
        // Map the global keys to our local naming convention
        this.timezoneSettings = {
          primary_ntp_server: dt.primary_ntp || "",
          secondary_ntp_server: dt.secondary_ntp || "",
          sync_on_boot: dt.synchronize,
          time_zone: dt.timezone || "",
          utc_offset: dt.utc_offset !== undefined ? dt.utc_offset.toString() : "",
        };
        this.backupSettings = { ...this.timezoneSettings };
      }
    },
    submitSettings() {
      // Map local fields back to the global configuration structure for date_time.
      const updatedDateTime = {
        primary_ntp: this.timezoneSettings.primary_ntp_server,
        secondary_ntp: this.timezoneSettings.secondary_ntp_server,
        synchronize: this.timezoneSettings.sync_on_boot,
        timezone: this.timezoneSettings.time_zone,
        utc_offset: parseInt(this.timezoneSettings.utc_offset, 10)
      };
      // Use the store action to update just the "date_time" section.
      this.configStore.updateConfigSection('date_time', updatedDateTime)
        .then(() => {
          // On success, update the backup copy with the latest confirmed settings.
          this.backupSettings = { ...this.timezoneSettings };
        })
        .catch((error) => {
          console.error("Failed to update Date/Time settings:", error);
        });
    },
    clearSettings() {
      // Revert local changes using the backup copy.
      this.timezoneSettings = { ...this.backupSettings };
    },
    updateUTCOffset() {
      // Update the UTC offset based on the selected time zone.
      const selectedZone = this.timezoneSettings.time_zone;
      this.timezoneSettings.utc_offset = this.VALID_TIME_ZONES[selectedZone]?.toString() || "";
    }
  },
  mounted() {
    if (this.configStore.configData) {
      this.loadTimezoneSettings();
    } else {
      // Watch for when the global config becomes available.
      const unwatch = this.$watch(
        () => this.configStore.configData,
        (newVal) => {
          if (newVal) {
            this.loadTimezoneSettings();
            unwatch(); // Remove watcher once loaded.
          }
        }
      );
    }
  }
};
</script>

<style scoped>
/* Match the focus ring color & border style from other components */
input:focus {
  outline: 0.75px solid #333;
  border-color: #333;
}
select:focus {
  outline: 0.75px solid #333;
  border-color: #333;
}
</style>
