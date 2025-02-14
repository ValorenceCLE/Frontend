<template>
  <header
    class="flex items-center justify-between px-3 text-white shadow-md"
    style="height: 4rem"
  >
    <!-- Logo Section -->
    <div class="flex items-center">
      <img
        src="@/assets/cle.png"
        alt="CLE Logo"
        class="h-full max-h-[3rem] object-contain"
      />
    </div>

    <!-- Navigation Section -->
    <nav class="flex items-center space-x-3 text-Navbar">
      <!-- Development links to switch between user and admin -->
      <div class="space-x-4 absolute transform left-1/2">
        <router-link to="/user" class="hover:text-primaryLight">User</router-link>
        <router-link to="/admin" class="hover:text-primaryLight">Admin</router-link>
      </div>
      <!-- Use the computed basePath for help and contact so that they load within the current view -->
      <router-link :to="`${basePath}/help`" class="hover:text-primaryLight">Help</router-link>
      <router-link :to="`${basePath}/contact`" class="hover:text-primaryLight">Contact</router-link>
      <router-link to="/" class="hover:text-primaryLight">Logout</router-link>
    </nav>
  </header>
</template>

<script>
export default {
  name: "Header",
  computed: {
    basePath() {
      // Determines if the current route is in the admin or user section.
      return this.$route.path.startsWith("/admin") ? "/admin" : "/user";
    },
  },
};
</script>

<style>
header {
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
}
</style>
