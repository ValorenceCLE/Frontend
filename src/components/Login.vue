<template>
  <div class="flex justify-center items-center bg-grayLight" :style="{ height: `calc(100vh - ${headerHeight} - ${footerHeight})` }">
    <!-- Card Container -->
    <div class="bg-white rounded-xl shadow-lg overflow-hidden w-full max-w-md">
      <!-- Header Section -->
      <div class="bg-grayDark py-2 text-white text-center">
        <h1 class="text-3xl font-semibold">Sign In</h1>
      </div>

      <!-- Form Section -->
      <div class="p-6">
        <!-- Username Input -->
        <div class="mb-4">
          <input
            type="text"
            placeholder="Username"
            class="w-full px-4 py-1 border text-center text-xl border-gray-300 rounded-lg text-gray-600 focus:outline-none focus:ring-2 focus:ring-primaryMed"
          />
        </div>

        <!-- Password Input -->
        <div class="mb-4">
          <input
            type="password"
            placeholder="Password"
            class="w-full px-4 py-1 border text-center text-xl border-gray-300 rounded-lg text-gray-600 focus:outline-none focus:ring-2 focus:ring-primaryMed"
          />
        </div>

        <!-- Login Button -->
        <div>
          <button
            class="bg-primaryMed text-white font-semibold text-2xl py-1.5 px-4 rounded-lg w-full hover:bg-primaryDark"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Login",
  data() {
    return {
      headerHeight: "6rem", // Adjust this to match your header height
      footerHeight: "2rem", // Adjust this to match your footer height
    };
  },
};
</script>

<style scoped>
/* Optional CSS tweaks if Tailwind utilities are insufficient */
</style>
