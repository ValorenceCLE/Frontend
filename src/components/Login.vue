<template>
  <div class="flex justify-center items-center w-full h-full">
    <!-- Card Container -->
    <div class="bg-white rounded-xl shadow-lg overflow-hidden w-full max-w-md">
      <!-- Header Section -->
      <div
        class="bg-gradient-to-b from-primaryDark to-grayDark text-white shadow-md py-3 text-center rounded-t-xl"
      >
        <h1 class="text-3xl font-semibold">Sign In</h1>
      </div>

      <!-- Form Section -->
      <div class="p-6">
        <!-- Username Input -->
        <div class="mb-4">
          <input
            type="text"
            placeholder="Username"
            class="w-full px-4 py-1.5 border text-center text-xl border-gray-300 rounded-lg text-gray-600 focus:outline-none focus:ring-2 focus:ring-primaryMed"
          />
        </div>

        <!-- Password Input -->
        <div class="mb-4">
          <input
            type="password"
            placeholder="Password"
            class="w-full px-4 py-1.5 border text-center text-xl border-gray-300 rounded-lg text-gray-600 focus:outline-none focus:ring-2 focus:ring-primaryMed"
          />
        </div>

        <!-- Login Button -->
        <div>
          <button
            class="bg-primaryDark text-white font-semibold text-2xl py-2 rounded-lg w-full hover:bg-grayDark"
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
};
</script>
