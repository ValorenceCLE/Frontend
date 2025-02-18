<template>
  <div class="flex justify-center items-center w-full h-full">
    <!-- Card Container -->
    <div
      class="bg-gray-200 rounded-md shadow shadow-gray-400 overflow-hidden w-full max-w-lg"
    >
      <!-- Header Section -->
      <div class="bg-primaryDark text-white py-2 text-center rounded-t-md">
        <h1 class="text-Header">Sign In</h1>
      </div>

      <!-- Form Section -->
      <div class="px-3 py-3">
        <!-- Username Input -->
        <div class="mb-3">
          <input
            type="text"
            placeholder="Username"
            class="w-full py-1 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-grayLight text-textColor text-Input text-center"
          />
        </div>

        <!-- Password Input -->
        <div class="mb-3">
          <input
            type="password"
            placeholder="Password"
            class="w-full py-1 border border-gray-400 rounded-lg focus:outline-none focus:ring-1 focus:ring-grayLight text-textColor text-Input text-center"
          />
        </div>

        <!-- Login Button -->
        <div>
          <button
            class="bg-primaryDark text-white py-1.5 rounded-lg w-full hover:bg-primaryMed text-FormSubmit text-center"
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
