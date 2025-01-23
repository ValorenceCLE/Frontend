<template>
  <!-- Outer container, similar styling to Contact.vue -->
  <div class="flex items-center justify-center w-full h-full p-6">
    <!-- Main Card Container -->
    <div class="w-full max-w-3xl bg-gray-200 shadow-lg rounded-md border border-gray-500">
      <!-- Header -->
      <div class="border-b border-gray-500 p-3">
        <h1 class="text-textColor text-Header font-bold text-center">FAQ</h1>
      </div>

      <!-- FAQ List -->
      <div class="p-6">
        <p class="text-textColor text-Body mb-4 text-center">
          Click any topic below to see more information
        </p>

        <!-- Loop through each FAQ item and display a clickable button -->
        <div v-for="(faq, index) in faqItems" :key="index" class="mb-2">
          <button
            class="w-full text-center py-2 px-3 bg-white border border-gray-300 rounded-md hover:bg-gray-100 hover:shadow-sm focus:outline-none cursor-pointer flex items-center justify-center"
            @click="openFAQ(faq)"
          >
            <strong class="text-textColor">{{ faq.title }}</strong>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <Modal :show="showModal" :title="selectedTitle" @close="closeModal">
      <!-- Modal content left-aligned -->
      <div v-html="selectedContent"></div>
    </Modal>
  </div>
</template>

<script>
import Modal from "@/components/etc/Modal.vue";

export default {
  name: "Help",
  components: { Modal },
  data() {
    return {
      showModal: false,
      selectedTitle: "",
      selectedContent: "",
      faqItems: [
        {
          title: "Performing a key fob reset/bypass.",
          modalTitle: "Key Fob Reset",
          content: `
            <strong>Instructions:</strong>
            <br><strong>1.</strong> Locate the key fob associated with the system and get within eyesight of the system.
            <br><strong>2.</strong> Press and hold the reset button on the key fob. The external status light should turn red.
            <br><strong>3.</strong> Press and hold the reset button again. The external status light should turn green.
            <br><strong>4.</strong> The system should now be reset. Please wait about five minutes for the system to come back online.
            <br><strong>5.</strong> If the system does not come online after 30 minutes, please contact support.
            <br><strong>Context:</strong>
            <br><strong>A.</strong> Performing a key fob reset is a safe way to power cycle the system. Useful when the system is unresponsive.
            <br><strong>B.</strong> It is recommended to be within 100 feet or eyesight of the system when performing a key fob reset/bypass.
            <br><strong>C.</strong> Performing a key fob reset will not affect the system's configuration or settings.
            <br><strong>D.</strong> The key fob must be clicked twice to perform a reset/bypass. The first click cuts power, and the second click restores power.
          `,
        },
        {
          title: "Adding users to Axis Companion.",
          content: `
            <strong>Instructions:</strong>
            <br><strong>1.</strong> Open the Axis Companion app on your device and sign into your site.
            <br><strong>2.</strong> Navigate to the 'Configuration' tab on Axis Companion.
            <br><strong>3.</strong> Click on the 'Users' tab.
            <br><strong>4.</strong> Select the 'Add...' button and enter the email address of the new user and select the permissions level.
            <br><strong>5.</strong> The new user will receive an email with instructions on how to sign into Axis Companion.
            <br><strong>6.</strong> Open the Axis Companion app and sign in. When signing in for the first time <strong>DO NOT CREATE A NEW SITE</strong>, rather accept the invitation to join the existing site.
            <br><strong>Context:</strong>
            <br><strong>A.</strong> Adding users to Axis Companion allows multiple users to access the system.
            <br><strong>B.</strong> Users need to complete Axis 2FA to access the system. Refer to 'Setting up Axis 2FA' FAQ for more info.
            <br><strong>C.</strong> If any issues arise when adding users, please contact support.
          `,
        },
        {
          title: "Axis 2FA.",
          modalTitle: "Setting up Axis 2FA",
          content: `
            <strong>Instructions:</strong>
            <br><strong>1.</strong> These instructions help set up Axis 2FA for new site users. See 'Adding users to Axis Companion' for more info.
            <br><strong>2.</strong> Once a new user is added, they receive an email to set up Axis 2FA.
            <br><strong>3.</strong> Open the email from Axis and follow instructions to create an Axis account.
            <br><strong>4.</strong> Once created, you'll be prompted to set up 2FA. Follow those instructions.
            <br><strong>5.</strong> You should now be able to login to Axis Companion. If you have issues, contact support.
            <br><strong>Context:</strong>
            <br><strong>A.</strong> If you do not have access to the email associated with the Axis account, contact support.
            <br><strong>B.</strong> Axis 2FA is required to access the system. If you have trouble setting it up, contact support.
          `,
        },
        {
          title: "Connecting to the system locally.",
          modalTitle: "Local Connection Guide",
          content: `
            <strong>Instructions:</strong>
            <br><strong>1.</strong> Bring the system into your office or get as close to it as possible.
            <br><strong>2.</strong> Connect to the system's Wi-Fi network (name begins with 'NWA' + 4 chars).
            <br><strong>3.</strong> Once connected, visit one of the local addresses below.
            <br><strong>Context:</strong>
            <br><strong>A.</strong> The Wi-Fi password was in the initial training email. If you do not have it, contact support.
            <br><strong>B.</strong> Connecting locally makes troubleshooting easier.
            <br><strong>C.</strong> Local Addresses: <a href="https://192.168.1.1:8443">Router</a> | <a href="http://192.168.1.3">Camera</a>
          `,
        },
        {
          title: "Adding cameras to Axis Companion.",
          content: `
            <strong>Instructions:</strong>
            <br><strong>1.</strong> You must be connected locally. See 'Connecting to the system locally' FAQ for more info.
            <br><strong>2.</strong> Open Axis Companion, go to 'Configuration'.
            <br><strong>3.</strong> Click 'Add Devices' and enter the camera's IP and credentials.
            <br><strong>4.</strong> Axis Companion should detect IP '192.168.1.3'. If not, contact support.
            <br><strong>5.</strong> You'll be prompted for the <strong>root</strong> password (different from normal credentials).
            <br><strong>6.</strong> Follow on-screen instructions to add the camera. May take a few minutes.
            <br><strong>Context:</strong>
            <br><strong>A.</strong> See 'Connecting to the system locally' for details.
            <br><strong>B.</strong> If issues arise adding a camera, contact support immediately.
            <br><strong>C.</strong> The root password was in your initial training email. Email support if you don't have it.
          `,
        },
        {
          title: "Removing cameras from Axis Companion.",
          modalTitle: "Remove Cameras",
          content: `
            <strong>Instructions:</strong>
            <br><strong>1.</strong> Open Axis Companion and go to 'Configuration'.
            <br><strong>2.</strong> Find the camera you want to remove and click the three dots on its right side.
            <br><strong>3.</strong> Click 'Remove' and confirm.
            <br><strong>4.</strong> To add a camera again, connect locally (see 'Connecting to the system locally') and go to 'Add Devices'.
            <br><strong>5.</strong> Enter the camera's IP and credentials.
            <br><strong>Context:</strong>
            <br><strong>A.</strong> Removing a camera is destructive and cannot be undone.
            <br><strong>B.</strong> If you have trouble adding a camera, contact support.
          `,
        },
        {
          title: "Setting up preset positions.",
          content: `
            <strong>Instructions:</strong>
            <br><strong>1.</strong> Open Axis Companion, go to 'Configuration'.
            <br><strong>2.</strong> Find your camera, click the three dots, then 'Advanced Settings' (may take a few seconds).
            <br><strong>3.</strong> Sign in with camera's username/password (different from Axis Companion credentials).
            <br><strong>4.</strong> Go to 'PTZ' tab, then 'Preset Positions'.
            <br><strong>5.</strong> Click 'Create preset position'; the current view is saved as the preset.
            <br><strong>Context:</strong>
            <br><strong>A.</strong> If set as 'Home Position', the camera returns here after ~30 mins.
            <br><strong>B.</strong> Unlimited presets possible, but only one Home Position.
            <br><strong>C.</strong> Adjust return-to-home time under 'PTZ' > 'Settings'.
          `,
        },
      ],
    };
  },
  methods: {
    // Open modal with either modalTitle (if present) or fallback to title
    openFAQ(faq) {
      this.selectedTitle = faq.modalTitle || faq.title;
      this.selectedContent = faq.content;
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
      // Clear out state if desired
      this.selectedTitle = "";
      this.selectedContent = "";
    },
  },
};
</script>

<style scoped>
/* Custom styling or Tailwind overrides if needed */
</style>
