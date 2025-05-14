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
                    v-model="formData.primary_ntp"
                    @input="markTouched('primary_ntp')"
                    class="border-gray-500 border rounded text-Form text-center w-48"
                    type="text"
                    :class="{'border-red-500': validationErrors.primary_ntp && touched.primary_ntp}"
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
                    v-model="formData.secondary_ntp"
                    @input="markTouched('secondary_ntp')"
                    class="border-gray-500 border rounded text-Form text-center w-48"
                    type="text"
                    :class="{'border-red-500': validationErrors.secondary_ntp && touched.secondary_ntp}"
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
                        formData.synchronize
                          ? 'bg-primaryMed text-white'
                          : 'bg-buttonUnselected text-textColor hover:bg-buttonHover hover:text-white'
                      ]"
                      @click="formData.synchronize = true; markTouched('synchronize')"
                    >
                      Yes
                    </button>
                    <button
                      :class="[ 
                        'py-0.5 px-3 text-FormButton transition-colors',
                        !formData.synchronize
                          ? 'bg-primaryMed text-white'
                          : 'bg-buttonUnselected text-textColor hover:bg-buttonHover hover:text-white'
                      ]"
                      @click="formData.synchronize = false; markTouched('synchronize')"
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
                    v-model="formData.timezone"
                    @change="updateUTCOffset(); markTouched('timezone')"
                    class="border-gray-500 border rounded text-Form text-center w-48"
                    :class="{'border-red-500': validationErrors.timezone && touched.timezone}"
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
import { useConfig } from '@/composables/useConfig';

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

// Use the config composable for the date_time section
const { 
  formData, 
  isLoading, 
  error, 
  successMessage, 
  isDirty,
  touched,
  validationErrors,
  markTouched,
  updateSection,
  resetForm
} = useConfig('date_time');

// Update UTC offset when time zone changes
function updateUTCOffset() {
  const selectedZone = formData.value.timezone;
  if (selectedZone && VALID_TIME_ZONES[selectedZone] !== undefined) {
    formData.value.utc_offset = VALID_TIME_ZONES[selectedZone];
    markTouched('utc_offset');
  }
}

// Validate the form
function validateForm() {
  const errors = {};
  
  // Validate time zone
  if (!formData.value.timezone) {
    errors.timezone = "Time zone is required";
  } else if (!Object.keys(VALID_TIME_ZONES).includes(formData.value.timezone)) {
    errors.timezone = "Invalid time zone";
  }
  
  // Validate UTC offset
  if (formData.value.utc_offset === undefined || formData.value.utc_offset === null) {
    errors.utc_offset = "UTC offset is required";
  } else {
    const offsetNum = parseInt(formData.value.utc_offset, 10);
    if (isNaN(offsetNum) || offsetNum < -12 || offsetNum > 14) {
      errors.utc_offset = "UTC offset must be between -12 and +14";
    }
  }
  
  validationErrors.value = errors;
  return Object.keys(errors).length === 0;
}

// Submit the form
async function submitForm() {
  if (!validateForm()) return;
  
  try {
    await updateSection();
  } catch (err) {
    console.error("Failed to update Date/Time settings:", err);
  }
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