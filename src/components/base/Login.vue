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
import axios from 'axios';
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
        const response = await axios.post(
          "http://localhost:8000/auth/login",
          new URLSearchParams({
            username: this.username,
            password: this.password,
          }),
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        );

        const token = response.data.access_token;
        localStorage.setItem("token", token);

        const configStore = useConfigStore();
        configStore.fetchConfig();

        // Decode the token to get expiration time (exp claim is in seconds)
        const decoded = jwtDecode(token);
        const exp = decoded.exp; // expiration time in seconds
        localStorage.setItem("token_exp", exp);

        // Calculate time left and warn the user (e.g., 60 seconds before expiry)
        const currentTime = Math.floor(Date.now() / 1000);
        const ttl = exp - currentTime;
        if (ttl > 60) {
          setTimeout(() => {
            alert("Your session is about to expire. Please log in again.");
          }, (ttl - 60) * 1000);
        } else {
          alert("Your session is about to expire soon. Please log in again.");
        }

        const decodedToken = jwtDecode(token);
        const userRole = decodedToken.role;
        this.$router.push(userRole === "admin" ? "/admin" : "/user");
      } catch (error) {
        this.errorMessage =
          error.response?.data?.message || "Login failed. Please try again.";
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
