<template>
  <div class="flex items-center justify-center w-full h-full p-6">
    <div class="w-full max-w-2xl bg-gray-200 shadow rounded-md border border-gray-500">
      <!-- Form Header with Full-Width Border -->
      <div class="border-b border-gray-500 px-4 py-2">
        <h1 class="text-textColor text-Header font-bold text-center">Contact Us</h1>
      </div>
      <!-- Contact Form -->
      <form @submit.prevent="sendMessage" class="px-4 py-2">
        <!-- Name -->
        <div class="m-2">
          <label for="name" class="block text-Body text-textColor mb-1">Name:</label>
          <input
            v-model="form.name"
            id="name"
            type="text"
            class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your name"
            required
          />
        </div>
        <!-- Email -->
        <div class="m-2">
          <label for="email" class="block text-Body text-textColor mb-1">Email:</label>
          <input
            v-model="form.email"
            id="email"
            type="email"
            class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your email"
            required
          />
        </div>
        <!-- Phone Number -->
        <div class="m-2">
          <label for="phone" class="block text-Body text-textColor mb-1"
            >Phone Number:</label
          >
          <input
            v-model="form.phone"
            id="phone"
            type="tel"
            class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your phone number"
          />
        </div>
        <!-- Agency -->
        <div class="m-2">
          <label for="agency" class="block text-Body text-textColor mb-1">Agency:</label>
          <input
            v-model="form.agency"
            id="agency"
            type="text"
            class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your agency name"
          />
        </div>
        <!-- Subject -->
        <div class="m-2">
          <label for="subject" class="block text-Body text-textColor mb-1"
            >Subject:</label
          >
          <input
            v-model="form.subject"
            id="subject"
            type="text"
            class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter the subject of your message"
            required
          />
        </div>
        <!-- Message Body -->
        <div class="m-2">
          <label for="message" class="block text-Body text-textColor mb-1"
            >Message:</label
          >
          <textarea
            v-model="form.message"
            id="message"
            class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your message"
            rows="4"
            required
          ></textarea>
        </div>
        <!-- Buttons -->
        <div class="flex justify-center space-x-2">
          <!-- Send Message Button -->
          <button
            type="submit"
            class="bg-primaryMed hover:bg-primaryLight text-white text-FormSubmit py-1 px-4 rounded w-24"
          >
            Send
          </button>
          <!-- Cancel Button -->
          <button
            type="button"
            class="bg-grayDark hover:bg-gray-700 text-white text-FormSubmit py-1 px-4 rounded w-24"
            @click="clearForm"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
    <!-- Toast Notification -->
    <ToastNotification v-if="showToast" :visible="showToast" :message="toastMessage" />
  </div>
</template>

<script>
import ToastNotification from "@/components/etc/ToastNotification.vue";

export default {
  name: "Contact",
  components: { ToastNotification },
  data() {
    return {
      form: {
        name: "",
        email: "",
        phone: "",
        agency: "",
        subject: "",
        message: "",
      },
      showToast: false, // State for showing the toast notification
      toastMessage: "", // The message to display in the toast notification
    };
  },
  methods: {
    sendMessage() {
      if (this.form.name && this.form.email && this.form.subject && this.form.message) {
        console.log("Message Sent:", this.form);
        this.toastMessage = "Your message has been sent successfully!";
        this.showToastNotification();
        this.clearForm();
      } else {
        this.toastMessage = "Please fill out all required fields.";
        this.showToastNotification();
      }
    },
    clearForm() {
      this.form = {
        name: "",
        email: "",
        phone: "",
        agency: "",
        subject: "",
        message: "",
      };
    },
    showToastNotification() {
      this.showToast = true;
      setTimeout(() => {
        this.showToast = false;
      }, 1500); // Hide the toast after 3 seconds
    },
  },
};
</script>
