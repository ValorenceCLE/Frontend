<template>
  <div class="flex items-center justify-center w-full h-full relative">
    <div class="w-full mx-auto rounded-md" style="max-width: 40rem">
      <div class="bg-gray-200 shadow-lg rounded-md my-3 border border-gray-500 relative">
        <table class="text-left w-full border-collapse">
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
          <tbody class="text-textColor">
            <!-- SMTP Server -->
            <tr>
              <td class="py-2 px-5 text-Body font-bold">SMTP Server:</td>
              <td class="py-2 px-2">
                <input
                  v-model="emailSettings.smtp_server"
                  class="border-grayMed border rounded w-3/4 px-2 text-Form"
                  type="text"
                  autocomplete="off"
                />
              </td>
            </tr>
            <!-- SMTP Port -->
            <tr>
              <td class="py-2 px-5 text-Body font-bold">SMTP Port:</td>
              <td class="py-2 px-2">
                <input
                  v-model="emailSettings.smtp_port"
                  class="border-grayMed border rounded w-3/4 px-2 text-Form"
                  type="number"
                  autocomplete="off"
                />
              </td>
            </tr>
            <!-- SMTP User -->
            <tr>
              <td class="py-2 px-5 text-Body font-bold">SMTP User:</td>
              <td class="py-2 px-2">
                <input
                  v-model="emailSettings.smtp_user"
                  class="border-grayMed border rounded w-3/4 px-2 text-Form"
                  type="text"
                  autocomplete="off"
                />
              </td>
            </tr>
            <!-- SMTP Password -->
            <tr>
              <td class="py-2 px-5 text-Body font-bold">SMTP Password:</td>
              <td class="py-2 px-2">
                <input
                  v-model="emailSettings.smtp_password"
                  class="border-grayMed border rounded w-3/4 px-2 text-Form"
                  type="password"
                  autocomplete="off"
                />
              </td>
            </tr>
            <!-- SMTP Secure -->
            <tr>
              <td class="py-2 px-5 text-Body font-bold">SMTP Secure:</td>
              <td class="py-2 px-2">
                <select
                  v-model="emailSettings.smtp_secure"
                  class="border-grayMed border rounded w-3/4 px-2 text-Form"
                >
                  <option value="tls">TLS</option>
                  <option value="ssl">SSL</option>
                </select>
              </td>
            </tr>
            <!-- Return Email -->
            <tr>
              <td class="py-2 px-5 text-Body font-bold">Return Email:</td>
              <td class="py-2 px-2">
                <input
                  v-model="emailSettings.return_email"
                  class="border-grayMed border rounded w-3/4 px-2 text-Form"
                  type="email"
                  autocomplete="off"
                />
              </td>
            </tr>
            <!-- Email Addresses -->
            <tr v-for="(email, index) in emailSettings.emails" :key="index">
              <td class="py-2 px-5 text-Body font-bold">Email {{ index + 1 }}:</td>
              <td class="py-2 px-2">
                <input
                  v-model="emailSettings.emails[index]"
                  class="border-grayMed border rounded w-3/4 px-2 text-Form"
                  type="email"
                  autocomplete="off"
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
                    @click="clearUnsavedEmails"
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
  name: "Emails",
  data() {
    return {
      emailSettings: {
        smtp_server: "",
        smtp_port: 587,
        smtp_user: "",
        smtp_password: "",
        smtp_secure: "tls",
        return_email: "",
        emails: Array(6).fill(""), // Always six email fields
      },
      backupSettings: {}, // For resetting to saved settings
    };
  },
  methods: {
    fetchEmailSettings() {
      const response = DummyAPI.get("/api/emails");
      if (response.success) {
        const emails = response.data.emails || [];
        // Ensure exactly six fields, filling with blanks as needed
        this.emailSettings = {
          ...response.data,
          emails: [...emails, ...Array(6 - emails.length).fill("")].slice(0, 6),
        };
        this.backupSettings = JSON.parse(JSON.stringify(this.emailSettings));
      }
    },
    submitSettings() {
      const response = DummyAPI.post("/api/emails", this.emailSettings);
      if (response.success) {
        console.log("Settings successfully updated:", response.data);
        // Update backup after successful save
        this.backupSettings = JSON.parse(JSON.stringify(this.emailSettings));
      }
    },
    clearUnsavedEmails() {
      // Reset only the unsaved email fields
      this.emailSettings.emails = this.emailSettings.emails.map((email, index) => {
        return this.backupSettings.emails[index] || "";
      });
    },
  },
  mounted() {
    this.fetchEmailSettings();
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
