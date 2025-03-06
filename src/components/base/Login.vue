<template>
  <div class="flex justify-center items-center w-full h-full">
    <div class="bg-gray-200 rounded-lg shadow shadow-gray-400 sha overflow-hidden w-full max-w-md border border-gray-400">
      <div class="bg-primaryDark text-white py-2 text-center rounded-t-md">
        <h1 class="text-Header">Sign In</h1>
      </div>

      <div class="px-3 py-3">
        <div class="mb-3">
          <input
            v-model="username"
            type="text"
            placeholder="Username"
            class="w-full py-1 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-grayLight text-textColor text-Input text-center"
          />
        </div>

        <div class="mb-3">
          <input
            v-model="password"
            type="password"
            placeholder="Password"
            class="w-full py-1 border border-gray-400 rounded-lg focus:outline-none focus:ring-1 focus:ring-grayLight text-textColor text-Input text-center"
          />
        </div>

        <div>
          <button
            @click="login"
            class="bg-primaryDark text-white py-1.5 rounded-lg w-full hover:bg-primaryMed text-FormSubmit text-center"
          >
            Login
          </button>
          <p v-if="errorMessage" class="text-red-500 text-center mt-2">{{ errorMessage }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { login as authLogin } from "@/api/authService";
import { jwtDecode } from "jwt-decode";
import { useConfigStore } from "@/store/config";

export default {
  name: "Login",
  data() {
    return {
      username: "",
      password: "",
      errorMessage: "",
    };
  },
  methods: {
    async login() {
      try {
        // Call the auth service for login
        const tokenData = await authLogin(this.username, this.password);
        const token = tokenData.access_token;
        
        // Fetch configuration after login
        const configStore = useConfigStore();
        configStore.fetchConfig();
        
        // Decode token for role and expiration details
        const decoded = jwtDecode(token);
        const exp = decoded.exp; // expiration time in seconds
        const currentTime = Math.floor(Date.now() / 1000);
        const ttl = exp - currentTime;
        
        // Set up a warning for session expiration
        if (ttl > 60) {
          setTimeout(() => {
            alert("Your session is about to expire. Please log in again.");
          }, (ttl - 60) * 1000);
        } else {
          alert("Your session is about to expire soon. Please log in again.");
        }
        
        // Route based on the user role
        const userRole = decoded.role;
        this.$router.push(userRole === "admin" ? "/admin" : "/user");
      } catch (error) {
        this.errorMessage = error.message || "Login failed. Please try again.";
      }
    },
  },
};
</script>

<style>
.error {
  color: red;
}
</style>
