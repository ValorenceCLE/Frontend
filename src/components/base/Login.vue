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
            required
          />
        </div>

        <div class="mb-3">
          <input
            v-model="password"
            type="password"
            placeholder="Password"
            class="w-full py-1 border border-gray-400 rounded-lg focus:outline-none focus:ring-1 focus:ring-grayLight text-textColor text-Input text-center"
            @keyup.enter="login"
            required
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
import { ref } from 'vue';
import { login as authLogin } from "@/api/authService";
import { jwtDecode } from "jwt-decode";
import { useConfigStore } from "@/store/config";
import { useRouter } from 'vue-router'; // Added this import
import { validateInput } from '@/utils/validation';
import { securelyStoreToken } from '@/axios';

export default {
  name: "Login",
  setup() {
    const username = ref("");
    const password = ref("");
    const errorMessage = ref("");
    const isLoading = ref(false);
    const configStore = useConfigStore();
    const router = useRouter(); // Added this line to define router
    
    // Add validation states
    const usernameError = ref("");
    const passwordError = ref("");
    
    const validateForm = () => {
      let isValid = true;
      
      // Validate username
      const usernameResult = validateInput.string(username.value, { required: true, min: 3 });
      if (!usernameResult.valid) {
        usernameError.value = usernameResult.message;
        isValid = false;
      } else {
        usernameError.value = "";
        username.value = usernameResult.value;
      }
      
      // Validate password
      const passwordResult = validateInput.string(password.value, { required: true, min: 6 });
      if (!passwordResult.valid) {
        passwordError.value = passwordResult.message;
        isValid = false;
      } else {
        passwordError.value = "";
      }
      
      return isValid;
    };
    
    const login = async () => {
      try {
        isLoading.value = true;
        errorMessage.value = "";
        
        // Call the auth service for login
        const tokenData = await authLogin(username.value, password.value);
        const token = tokenData.access_token;
        
        // Decode token for role and expiration details
        const decoded = jwtDecode(token);
        const exp = decoded.exp; // expiration time in seconds
        
        // Store token securely with expiry
        securelyStoreToken(token, exp);
        
        // Fetch configuration after login
        configStore.fetchConfig();
        
        // Set up a warning for session expiration
        const currentTime = Math.floor(Date.now() / 1000);
        const ttl = exp - currentTime;
        
        if (ttl > 60) {
          setTimeout(() => {
            alert("Your session is about to expire. Please log in again.");
          }, (ttl - 60) * 1000);
        } else {
          alert("Your session is about to expire soon. Please log in again.");
        }
        
        // Route based on the user role
        const userRole = decoded.role;
        router.push(userRole === "admin" ? "/admin" : "/user");
      } catch (error) {
        errorMessage.value = error.message || "Login failed. Please try again.";
      } finally {
        isLoading.value = false;
      }
    };
    
    return {
      username,
      password,
      errorMessage,
      isLoading,
      usernameError,
      passwordError,
      login
    };
  }
};
</script>

<style>
.error {
  color: red;
}
</style>