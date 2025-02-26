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
                    v-model="emailSettings.smtp_server"
                    class="border-gray-500 border rounded text-Form text-center w-52"
                    type="text"
                    autocomplete="off"
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
                    v-model.number="emailSettings.smtp_port"
                    class="border-gray-500 border rounded text-Form text-center w-52"
                    type="number"
                    autocomplete="off"
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
                    v-model="emailSettings.smtp_user"
                    class="border-gray-500 border rounded text-Form text-center w-52"
                    type="text"
                    autocomplete="off"
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
                    v-model="emailSettings.smtp_password"
                    class="border-gray-500 border rounded text-Form text-center w-52"
                    type="password"
                    autocomplete="off"
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
                    v-model="emailSettings.smtp_secure"
                    class="border-gray-500 border rounded text-Form text-center w-52"
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
                    v-model="emailSettings.return_email"
                    class="border-gray-500 border rounded text-Form text-center w-52"
                    type="email"
                    autocomplete="off"
                  />
                </div>
              </td>
            </tr>

            <!-- Dynamic Optional Emails -->
            <tr
              v-for="(email, index) in emailSettings.emails"
              :key="index"
              class="text-center"
            >
              <td class="text-Body font-bold py-1">
                Email {{ index + 1 }}:
              </td>
              <td>
                <div class="flex items-center justify-center gap-2">
                  <input
                    v-model="emailSettings.emails[index]"
                    class="border-gray-500 border rounded text-Form text-center w-44"
                    type="email"
                    autocomplete="off"
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
                    :disabled="emailSettings.emails.length >= maxEmails"
                    @click="addNewEmail"
                  >
                    Add Email
                  </button>
                </div>
              </td>
            </tr>

            <!-- Submit & Clear Buttons -->
            <tr>
              <td class="pt-4 pb-2 text-center" colspan="2">
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
import { useConfigStore } from '@/store/config';

export default {
  name: "Emails",
  data() {
    return {
      // Local copy for editing email settings
      emailSettings: {
        smtp_server: "",
        smtp_port: 587,
        smtp_user: "",
        smtp_password: "",
        smtp_secure: "tls",
        return_email: "",
        emails: [],
      },
      // Backup copy for reverting changes
      backupSettings: {},
      maxEmails: 5,
    };
  },
  computed: {
    // Access the global configuration store
    configStore() {
      return useConfigStore();
    }
  },
  methods: {
    loadEmailSettings() {
      if (this.configStore.configData && this.configStore.configData.email) {
        // Copy email settings from the global config into the local editable copy
        this.emailSettings = { ...this.configStore.configData.email };
        if (!Array.isArray(this.emailSettings.emails)) {
          this.emailSettings.emails = [];
        }
        // Deep copy for backup
        this.backupSettings = JSON.parse(JSON.stringify(this.emailSettings));
      }
    },
    addNewEmail() {
      if (this.emailSettings.emails.length < this.maxEmails) {
        this.emailSettings.emails.push("");
      }
    },
    removeEmail(index) {
      this.emailSettings.emails.splice(index, 1);
    },
    submitSettings() {
      // Merge the updated email settings into the full configuration
      const updatedConfig = {
        ...this.configStore.configData,
        email: { ...this.emailSettings }
      };
      // Use the store action to update the configuration via the API
      this.configStore.updateConfig(updatedConfig)
        .then(() => {
          // On success, update the backup copy
          this.backupSettings = JSON.parse(JSON.stringify(this.emailSettings));
        })
        .catch((error) => {
          console.error("Failed to update email settings:", error);
        });
    },
    clearSettings() {
      // Revert local changes using the backup copy
      this.emailSettings = JSON.parse(JSON.stringify(this.backupSettings));
    }
  },
  mounted() {
    if (this.configStore.configData) {
      this.loadEmailSettings();
    } else {
      const unwatch = this.$watch(
        () => this.configStore.configData,
        (newVal) => {
          if (newVal) {
            this.loadEmailSettings();
            unwatch();
          }
        }
      );
    }
  }
};
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
