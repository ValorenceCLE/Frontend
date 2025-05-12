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
                Email Settings
              </th>
            </tr>
          </thead>
          <!-- Tiny spacer below header -->
          <tbody class="text-textColor">
            <!-- SMTP Server -->
            <tr class="text-center">
              <td class="text-Body font-bold py-1">SMTP Server:</td>
              <td>
                <div class="flex justify-center">
                  <input
                    v-model="formData.smtp_server"
                    @input="markTouched('smtp_server')"
                    class="border-gray-500 border rounded text-Form text-center w-52"
                    type="text"
                    autocomplete="off"
                    :class="{'border-red-500': validationErrors.smtp_server && touched.smtp_server}"
                  />
                </div>
              </td>
            </tr>

            <!-- SMTP Port -->
            <tr class="text-center">
              <td class="text-Body font-bold py-1">SMTP Port:</td>
              <td>
                <div class="flex justify-center">
                  <input
                    v-model.number="formData.smtp_port"
                    @input="markTouched('smtp_port')"
                    class="border-gray-500 border rounded text-Form text-center w-52"
                    type="number"
                    autocomplete="off"
                    :class="{'border-red-500': validationErrors.smtp_port && touched.smtp_port}"
                  />
                </div>
              </td>
            </tr>

            <!-- SMTP User -->
            <tr class="text-center">
              <td class="text-Body font-bold py-1">SMTP User:</td>
              <td>
                <div class="flex justify-center">
                  <input
                    v-model="formData.smtp_user"
                    @input="markTouched('smtp_user')"
                    class="border-gray-500 border rounded text-Form text-center w-52"
                    type="text"
                    autocomplete="off"
                    :class="{'border-red-500': validationErrors.smtp_user && touched.smtp_user}"
                  />
                </div>
              </td>
            </tr>

            <!-- SMTP Password -->
            <tr class="text-center">
              <td class="text-Body font-bold py-1">SMTP Password:</td>
              <td>
                <div class="flex justify-center">
                  <input
                    v-model="formData.smtp_password"
                    @input="markTouched('smtp_password')"
                    class="border-gray-500 border rounded text-Form text-center w-52"
                    type="password"
                    autocomplete="off"
                    :class="{'border-red-500': validationErrors.smtp_password && touched.smtp_password}"
                  />
                </div>
              </td>
            </tr>

            <!-- SMTP Secure -->
            <tr class="text-center">
              <td class="text-Body font-bold py-1">SMTP Secure:</td>
              <td>
                <div class="flex justify-center">
                  <select
                    v-model="formData.smtp_secure"
                    @change="markTouched('smtp_secure')"
                    class="border-gray-500 border rounded text-Form text-center w-52"
                    :class="{'border-red-500': validationErrors.smtp_secure && touched.smtp_secure}"
                  >
                    <option value="tls">TLS</option>
                    <option value="ssl">SSL</option>
                  </select>
                </div>
              </td>
            </tr>

            <!-- Return Email -->
            <tr class="text-center">
              <td class="text-Body font-bold py-1">Return Email:</td>
              <td>
                <div class="flex justify-center">
                  <input
                    v-model="formData.return_email"
                    @input="markTouched('return_email')"
                    class="border-gray-500 border rounded text-Form text-center w-52"
                    type="email"
                    autocomplete="off"
                    :class="{'border-red-500': validationErrors.return_email && touched.return_email}"
                  />
                </div>
              </td>
            </tr>

            <!-- Dynamic Optional Emails -->
            <tr
              v-for="(email, index) in formData.emails"
              :key="index"
              class="text-center"
            >
              <td class="text-Body font-bold py-1">
                Email {{ index + 1 }}:
              </td>
              <td>
                <div class="flex items-center justify-center gap-2">
                  <input
                    v-model="formData.emails[index]"
                    @input="markTouched(`emails.${index}`)"
                    class="border-gray-500 border rounded text-Form text-center w-44"
                    type="email"
                    autocomplete="off"
                    :class="{'border-red-500': validationErrors[`emails.${index}`] && touched[`emails.${index}`]}"
                  />
                  <button
                    class="bg-red-500 hover:bg-red-700 text-white p-1 rounded"
                    @click="removeEmail(index)"
                  >
                    <img src="@/assets/icons/trash.svg" alt="Delete" class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>

            <!-- Add Email Button -->
            <tr class="text-center">
              <td colspan="2" class="pt-1.5">
                <div class="flex justify-center">
                  <button
                    class="bg-textColor text-white text-ModalLabel py-1 px-5 justify-center rounded border border-gray-500"
                    :disabled="formData.emails.length >= maxEmails"
                    @click="addNewEmail"
                  >
                    Add Email
                  </button>
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

            <!-- Submit & Clear Buttons -->
            <tr>
              <td class="pt-4 pb-2 text-center" colspan="2">
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
import { ref, computed, watch } from 'vue';
import { useConfigStore } from '@/store/config';
import { useFormHandling } from '@/composables/useFormHandling';
import { validateInput } from '@/utils/validation';

// Access the global configuration store
const configStore = useConfigStore();
const maxEmails = ref(5);

// Get initial email settings from the store
const initialEmailSettings = computed(() => {
  const email = configStore.configData?.email || {};
  return {
    smtp_server: email.smtp_server || "",
    smtp_port: email.smtp_port || 587,
    smtp_user: email.smtp_user || "",
    smtp_password: email.smtp_password || "",
    smtp_secure: email.smtp_secure || "tls",
    return_email: email.return_email || "",
    emails: Array.isArray(email.emails) ? [...email.emails] : [],
  };
});

// Validate email settings
function validateEmailSettings(data) {
  const errors = {};
  
  // Validate SMTP Server
  if (!data.smtp_server) {
    errors.smtp_server = "SMTP server is required";
  }
  
  // Validate SMTP Port
  if (!data.smtp_port) {
    errors.smtp_port = "SMTP port is required";
  } else if (isNaN(Number(data.smtp_port)) || Number(data.smtp_port) < 1 || Number(data.smtp_port) > 65535) {
    errors.smtp_port = "Port must be between 1 and 65535";
  }
  
  // Validate Return Email
  if (data.return_email) {
    const emailResult = validateInput.email(data.return_email);
    if (!emailResult.valid) {
      errors.return_email = emailResult.message;
    }
  }
  
  // Validate recipient emails
  data.emails.forEach((email, index) => {
    if (email) {
      const emailResult = validateInput.email(email);
      if (!emailResult.valid) {
        errors[`emails.${index}`] = emailResult.message;
      }
    }
  });
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

// Submit handler function
async function submitEmailSettings(formData) {
  return await configStore.updateConfigSection('email', formData);
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
  initialData: initialEmailSettings.value,
  onSubmit: submitEmailSettings,
  validate: validateEmailSettings,
  onSuccess: () => {
    // Success notification handled via submitSuccess flag
    // Clear success message after 3 seconds
    setTimeout(() => {
      submitSuccess.value = false;
    }, 3000);
  },
  onError: (error) => {
    console.error("Failed to update email settings:", error);
  }
});

// Add a new email to the list
function addNewEmail() {
  if (formData.emails.length < maxEmails.value) {
    formData.emails.push("");
    markTouched(`emails.${formData.emails.length - 1}`);
  }
}

// Remove an email from the list
function removeEmail(index) {
  formData.emails.splice(index, 1);
}

// Watch for changes in the store's email settings
watch(
  () => configStore.configData?.email,
  (newEmailSettings) => {
    if (newEmailSettings && !isDirty.value) {
      // Only update if form hasn't been modified
      formData.smtp_server = newEmailSettings.smtp_server || "";
      formData.smtp_port = newEmailSettings.smtp_port || 587;
      formData.smtp_user = newEmailSettings.smtp_user || "";
      formData.smtp_password = newEmailSettings.smtp_password || "";
      formData.smtp_secure = newEmailSettings.smtp_secure || "tls";
      formData.return_email = newEmailSettings.return_email || "";
      formData.emails = Array.isArray(newEmailSettings.emails) ? [...newEmailSettings.emails] : [];
    }
  },
  { deep: true }
);
</script>

<style scoped>
input:focus {
  outline: 0.75px solid #333;
  border-color: #333;
}
select:focus {
  outline: 0.75px solid #333;
  border-color: #333;
}
</style>