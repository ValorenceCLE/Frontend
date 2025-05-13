<!-- src/components/settings/Network.vue -->
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
                    :disabled="formData.dhcp"
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
                    :disabled="formData.dhcp"
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
                    :disabled="formData.dhcp"
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

            <!-- Submit and Clear Buttons -->
            <tr>
              <td class="pt-2 pb-1.5 text-center" colspan="2">
                <div class="flex justify-center gap-2">
                  <button
                    class="bg-primaryMed hover:bg-primaryLight text-white text-FormSubmit py-1 flex justify-center rounded-md border border-gray-500 w-24"
                    @click="submitForm"
                    :disabled="isLoading || !isDirty"
                  >
                    {{ isLoading ? 'Saving...' : 'Submit' }}
                  </button>
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
import { reactive, ref, computed, watch } from 'vue';
import { useConfig } from '@/composables/useConfig';
import { validateInput } from '@/utils/validation';

// Use our new config composable for the 'network' section
const { 
  sectionData: networkConfig, 
  isConfigLoaded,
  isLoading,
  error,
  successMessage,
  updateSection
} = useConfig('network');

// Form data states
const formData = reactive({
  ip_address: "",
  subnet_mask: "",
  gateway: "",
  dhcp: false,
  primary_dns: "",
  secondary_dns: "",
});

const validationErrors = ref({});
const touched = ref({});

// Flag to track if form has been modified
const isDirty = ref(false);

// Load the network config into the form when it becomes available
watch(networkConfig, (newConfig) => {
  if (newConfig && !isDirty.value) {
    // Copy all properties from the config
    Object.assign(formData, newConfig);
    // Reset validation and touched states
    validationErrors.value = {};
    touched.value = {};
    isDirty.value = false;
  }
}, { immediate: true });

// Mark fields as touched when they're modified
const markTouched = (field) => {
  touched.value[field] = true;
  isDirty.value = true;
};

// Validate the form data
const validateForm = () => {
  const errors = {};
  
  // Only validate IP fields if DHCP is disabled
  if (!formData.dhcp) {
    // Validate IP Address
    const ipResult = validateInput.ipAddress(formData.ip_address, { required: true });
    if (!ipResult.valid) {
      errors.ip_address = ipResult.message;
    }
    
    // Validate Subnet Mask
    const subnetResult = validateInput.ipAddress(formData.subnet_mask, { required: true });
    if (!subnetResult.valid) {
      errors.subnet_mask = subnetResult.message;
    }
    
    // Validate Gateway
    const gatewayResult = validateInput.ipAddress(formData.gateway, { required: true });
    if (!gatewayResult.valid) {
      errors.gateway = gatewayResult.message;
    }
  }
  
  // DNS servers are optional but must be valid IP addresses if provided
  if (formData.primary_dns) {
    const primaryDnsResult = validateInput.ipAddress(formData.primary_dns);
    if (!primaryDnsResult.valid) {
      errors.primary_dns = primaryDnsResult.message;
    }
  }
  
  if (formData.secondary_dns) {
    const secondaryDnsResult = validateInput.ipAddress(formData.secondary_dns);
    if (!secondaryDnsResult.valid) {
      errors.secondary_dns = secondaryDnsResult.message;
    }
  }
  
  validationErrors.value = errors;
  return Object.keys(errors).length === 0;
};

// Submit form changes to the backend
const submitForm = async () => {
  if (!validateForm()) return;
  
  try {
    await updateSection(formData);
    isDirty.value = false;
    // Validation and success messages are handled by the composable
  } catch (err) {
    // Error handling is done by the composable
    console.error("Submit failed:", err);
  }
};

// Reset the form to the current config
const resetForm = () => {
  if (networkConfig.value) {
    Object.assign(formData, networkConfig.value);
  }
  validationErrors.value = {};
  touched.value = {};
  isDirty.value = false;
};
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