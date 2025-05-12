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
                Network Settings
              </th>
            </tr>
          </thead>
          <tbody class="text-textColor">
            <!-- IP Address -->
            <tr class="text-center">
              <td class="text-Body font-bold py-1">IP Address:</td>
              <td>
                <div class="flex justify-center">
                  <input
                    v-model="formData.ip_address"
                    @input="markTouched('ip_address')"
                    class="border-gray-500 border rounded text-Form text-center w-48"
                    type="text"
                    :class="{'border-red-500': validationErrors.ip_address && touched.ip_address}"
                  />
                </div>
              </td>
            </tr>

            <!-- Subnet Mask -->
            <tr class="text-center">
              <td class="text-Body font-bold py-1">Subnet Mask:</td>
              <td>
                <div class="flex justify-center">
                  <input
                    v-model="formData.subnet_mask"
                    @input="markTouched('subnet_mask')"
                    class="border-gray-500 border rounded text-Form text-center w-48"
                    type="text"
                    :class="{'border-red-500': validationErrors.subnet_mask && touched.subnet_mask}"
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
                    v-model="formData.gateway"
                    @input="markTouched('gateway')"
                    class="border-gray-500 border rounded text-Form text-center w-48"
                    type="text"
                    :class="{'border-red-500': validationErrors.gateway && touched.gateway}"
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
                      @click="formData.dhcp = true; markTouched('dhcp')"
                      :class="[
                        'py-0.5 px-3 text-FormButton transition-colors',
                        formData.dhcp
                          ? 'bg-primaryMed text-white'
                          : 'bg-buttonUnselected text-textColor hover:bg-buttonHover hover:text-white'
                      ]"
                    >
                      Yes
                    </button>
                    <button
                      @click="formData.dhcp = false; markTouched('dhcp')"
                      :class="[
                        'py-0.5 px-3 text-FormButton transition-colors font-bold',
                        !formData.dhcp
                          ? 'bg-primaryMed text-white'
                          : 'bg-buttonUnselected text-textColor hover:bg-buttonHover hover:text-white'
                      ]"
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
              <td>
                <div class="flex justify-center">
                  <input
                    v-model="formData.primary_dns"
                    @input="markTouched('primary_dns')"
                    class="border-gray-500 border rounded text-Form text-center w-48"
                    type="text"
                    :class="{'border-red-500': validationErrors.primary_dns && touched.primary_dns}"
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
                    v-model="formData.secondary_dns"
                    @input="markTouched('secondary_dns')"
                    class="border-gray-500 border rounded text-Form text-center w-48"
                    type="text"
                    :class="{'border-red-500': validationErrors.secondary_dns && touched.secondary_dns}"
                  />
                </div>
              </td>
            </tr>

            <!-- Error message row -->
            <tr v-if="submitError" class="text-center">
              <td colspan="2" class="text-red-500 py-1">{{ submitError }}</td>
            </tr>

            <!-- Success message row -->
            <tr v-if="submitSuccess" class="text-center">
              <td colspan="2" class="text-green-600 py-1">Settings updated successfully!</td>
            </tr>

            <!-- Submit and Clear Buttons -->
            <tr>
              <td class="pt-2 pb-1.5 text-center" colspan="2">
                <div class="flex justify-center gap-2">
                  <button
                    class="bg-primaryMed hover:bg-primaryLight text-white text-FormSubmit py-1 flex justify-center rounded-md border border-gray-500 w-24"
                    @click="submitForm"
                    :disabled="isSubmitting || !isDirty"
                  >
                    {{ isSubmitting ? 'Saving...' : 'Submit' }}
                  </button>
                  <button
                    class="bg-grayDark hover:bg-gray-700 text-white text-FormSubmit py-1 flex justify-center rounded-md border border-gray-500 w-24"
                    @click="resetForm"
                    :disabled="isSubmitting || !isDirty"
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
import { computed, watch } from 'vue';
import { useConfigStore } from '@/store/config';
import { useFormHandling } from '@/composables/useFormHandling';
import { validateInput } from '@/utils/validation';

// Get the config store
const configStore = useConfigStore();

// Get initial network settings from the store
const initialNetworkSettings = computed(() => {
  return configStore.configData?.network || {
    ip_address: "",
    subnet_mask: "",
    gateway: "",
    dhcp: false,
    primary_dns: "",
    secondary_dns: "",
  };
});

// Validate network settings
function validateNetworkSettings(data) {
  const errors = {};
  
  // Only validate IP fields if DHCP is disabled
  if (!data.dhcp) {
    // Validate IP Address
    const ipResult = validateInput.ipAddress(data.ip_address, { required: true });
    if (!ipResult.valid) {
      errors.ip_address = ipResult.message;
    }
    
    // Validate Subnet Mask
    const subnetResult = validateInput.ipAddress(data.subnet_mask, { required: true });
    if (!subnetResult.valid) {
      errors.subnet_mask = subnetResult.message;
    }
    
    // Validate Gateway
    const gatewayResult = validateInput.ipAddress(data.gateway, { required: true });
    if (!gatewayResult.valid) {
      errors.gateway = gatewayResult.message;
    }
  }
  
  // DNS servers are optional but must be valid IP addresses if provided
  if (data.primary_dns) {
    const primaryDnsResult = validateInput.ipAddress(data.primary_dns);
    if (!primaryDnsResult.valid) {
      errors.primary_dns = primaryDnsResult.message;
    }
  }
  
  if (data.secondary_dns) {
    const secondaryDnsResult = validateInput.ipAddress(data.secondary_dns);
    if (!secondaryDnsResult.valid) {
      errors.secondary_dns = secondaryDnsResult.message;
    }
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

// Submit handler function
async function submitNetworkSettings(formData) {
  return await configStore.updateConfigSection('network', formData);
}

// Use the form handling composable
const {
  formData,
  isSubmitting,
  submitError,
  submitSuccess,
  validationErrors,
  touched,
  isDirty,
  submitForm,
  resetForm,
  markTouched
} = useFormHandling({
  initialData: initialNetworkSettings.value,
  onSubmit: submitNetworkSettings,
  validate: validateNetworkSettings,
  onSuccess: () => {
    // Success notification handled via submitSuccess flag
    // Clear success message after 3 seconds
    setTimeout(() => {
      submitSuccess.value = false;
    }, 3000);
  },
  onError: (error) => {
    console.error("Failed to update network settings:", error);
  }
});

// Watch for changes in the store's network settings
watch(
  () => configStore.configData?.network,
  (newNetworkSettings) => {
    if (newNetworkSettings && !isDirty.value) {
      // Update the form with new settings from the store
      Object.assign(formData, newNetworkSettings);
    }
  },
  { deep: true }
);
</script>

<style scoped>
/* Customize the focus ring color */
input:focus {
  outline: 0.75px solid #333;
  border-color: #333;
}
select:focus {
  outline: 0.75px solid #333;
  border-color: #333;
}
</style>