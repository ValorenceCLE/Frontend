<!-- src/components/settings/DateTime.vue -->
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
                    v-model="formData.primary_ntp_server"
                    @input="markTouched('primary_ntp_server')"
                    class="border-gray-500 border rounded text-Form text-center w-48"
                    type="text"
                    :class="{'border-red-500': validationErrors.primary_ntp_server && touched.primary_ntp_server}"
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
                    v-model="formData.secondary_ntp_server"
                    @input="markTouched('secondary_ntp_server')"
                    class="border-gray-500 border rounded text-Form text-center w-48"
                    type="text"
                    :class="{'border-red-500': validationErrors.secondary_ntp_server && touched.secondary_ntp_server}"
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
                        formData.sync_on_boot
                          ? 'bg-primaryMed text-white'
                          : 'bg-buttonUnselected text-textColor hover:bg-buttonHover hover:text-white'
                      ]"
                      @click="formData.sync_on_boot = true; markTouched('sync_on_boot')"
                    >
                      Yes
                    </button>
                    <button
                      :class="[ 
                        'py-0.5 px-3 text-FormButton transition-colors',
                        !formData.sync_on_boot
                          ? 'bg-primaryMed text-white'
                          : 'bg-buttonUnselected text-textColor hover:bg-buttonHover hover:text-white'
                      ]"
                      @click="formData.sync_on_boot = false; markTouched('sync_on_boot')"
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
                    v-model="formData.time_zone"
                    @change="updateUTCOffset(); markTouched('time_zone')"
                    class="border-gray-500 border rounded text-Form text-center w-48"
                    :class="{'border-red-500': validationErrors.time_zone && touched.time_zone}"
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
                    v-model="formData.utc_offset"
                    @input="markTouched('utc_offset')"
                    class="border-gray-500 border rounded text-Form text-center w-48"
                    type="text"
                    :class="{'border-red-500': validationErrors.utc_offset && touched.utc_offset}"
                    :disabled="true"
                  />
                </div>
              </td>
            </tr>

            <!-- Error message row -->
            <tr v-if="error" class="text-center">
              <td colspan="2" class="text-red-500 py-1">{{ error }}</td>
            </tr>

            <!-- Success message row -->
            <tr v-if="successMessage" class="text-center">
              <td colspan="2" class="text-green-600 py-1">{{ successMessage }}</td>
            </tr>
            
            <!-- Loading indicator -->
            <tr v-if="isLoading" class="text-center">
              <td colspan="2" class="py-1">
                <div class="flex justify-center items-center">
                  <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-primaryMed"></div>
                  <span class="ml-2 text-sm text-gray-600">Loading...</span>
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
                    @click="submitForm"
                    :disabled="isLoading || !isDirty"
                  >
                    {{ isLoading ? 'Saving...' : 'Submit' }}
                  </button>
                  <!-- Clear Button -->
                  <button
                    class="bg-grayDark hover:bg-gray-700 text-white text-FormSubmit py-1 flex justify-center rounded-md border border-gray-500 w-24"
                    @click="resetForm"
                    :disabled="isLoading || !isDirty"
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

<script setup>
import { ref, reactive, watch } from 'vue';
import { useConfig } from '@/composables/useConfig';
import { validateInput } from '@/utils/validation';

// Use the config composable for the date_time section
const { 
  sectionData: dateTimeConfig, 
  isLoading, 
  error, 
  successMessage, 
  updateSection 
} = useConfig('date_time');

// Valid time zones mapping
const VALID_TIME_ZONES = {
  "America/New_York": -5,
  "America/Chicago": -6,
  "America/Denver": -7,
  "America/Phoenix": -7, // No DST
  "America/Los_Angeles": -8,
  "America/Adak": -10,
  "Pacific/Honolulu": -10, // No DST
};

// Form data and validation state
const formData = reactive({
  primary_ntp_server: "",
  secondary_ntp_server: "",
  sync_on_boot: true,
  time_zone: "",
  utc_offset: "",
});

const validationErrors = ref({});
const touched = ref({});
const isDirty = ref(false);

// Initialize form data when date_time config becomes available
watch(dateTimeConfig, (newConfig) => {
  if (newConfig && !isDirty.value) {
    // Map API format to form fields
    formData.primary_ntp_server = newConfig.primary_ntp || "";
    formData.secondary_ntp_server = newConfig.secondary_ntp || "";
    formData.sync_on_boot = newConfig.synchronize ?? true;
    formData.time_zone = newConfig.timezone || "";
    formData.utc_offset = newConfig.utc_offset?.toString() || "";
    
    // Reset validation state
    validationErrors.value = {};
    touched.value = {};
    isDirty.value = false;
  }
}, { immediate: true });

// Watch form data for changes
watch(formData, () => {
  isDirty.value = true;
}, { deep: true });

// Mark a field as touched
const markTouched = (field) => {
  touched.value[field] = true;
};

// Update UTC offset when time zone changes
function updateUTCOffset() {
  const selectedZone = formData.time_zone;
  formData.utc_offset = VALID_TIME_ZONES[selectedZone]?.toString() || "";
  markTouched('utc_offset');
}

// Validate the form
function validateForm() {
  const errors = {};
  
  // Validate time zone
  if (!formData.time_zone) {
    errors.time_zone = "Time zone is required";
  } else if (!Object.keys(VALID_TIME_ZONES).includes(formData.time_zone)) {
    errors.time_zone = "Invalid time zone";
  }
  
  // Validate UTC offset
  if (!formData.utc_offset) {
    errors.utc_offset = "UTC offset is required";
  } else {
    const offsetNum = parseInt(formData.utc_offset, 10);
    if (isNaN(offsetNum) || offsetNum < -12 || offsetNum > 14) {
      errors.utc_offset = "UTC offset must be between -12 and +14";
    }
  }
  
  // NTP servers should be hostnames or IPs - basic validation
  if (formData.primary_ntp_server && !/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.primary_ntp_server)) {
    const ipResult = validateInput.ipAddress(formData.primary_ntp_server);
    if (!ipResult.valid) {
      errors.primary_ntp_server = "Must be a valid hostname or IP address";
    }
  }
  
  if (formData.secondary_ntp_server && !/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.secondary_ntp_server)) {
    const ipResult = validateInput.ipAddress(formData.secondary_ntp_server);
    if (!ipResult.valid) {
      errors.secondary_ntp_server = "Must be a valid hostname or IP address";
    }
  }
  
  validationErrors.value = errors;
  return Object.keys(errors).length === 0;
}

// Submit the form
async function submitForm() {
  if (!validateForm()) return;
  
  // Map form fields back to API format
  const updatedDateTime = {
    primary_ntp: formData.primary_ntp_server,
    secondary_ntp: formData.secondary_ntp_server,
    synchronize: formData.sync_on_boot,
    timezone: formData.time_zone,
    utc_offset: parseInt(formData.utc_offset, 10)
  };
  
  try {
    await updateSection(updatedDateTime);
    isDirty.value = false;
  } catch (err) {
    console.error("Failed to update Date/Time settings:", err);
  }
}

// Reset the form
function resetForm() {
  if (dateTimeConfig.value) {
    formData.primary_ntp_server = dateTimeConfig.value.primary_ntp || "";
    formData.secondary_ntp_server = dateTimeConfig.value.secondary_ntp || "";
    formData.sync_on_boot = dateTimeConfig.value.synchronize ?? true;
    formData.time_zone = dateTimeConfig.value.timezone || "";
    formData.utc_offset = dateTimeConfig.value.utc_offset?.toString() || "";
  } else {
    // Reset to defaults if no config
    formData.primary_ntp_server = "";
    formData.secondary_ntp_server = "";
    formData.sync_on_boot = true;
    formData.time_zone = "";
    formData.utc_offset = "";
  }
  
  validationErrors.value = {};
  touched.value = {};
  isDirty.value = false;
}
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