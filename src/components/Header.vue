<template>
  <header class="flex items-center justify-between px-3 text-white shadow-md" style="height: 4rem">
    <div class="flex items-center">
      <img src="@/assets/cle.png" alt="CLE Logo" class="h-full max-h-[3rem] object-contain" />
    </div>
    <nav class="flex items-center space-x-3 text-Navbar">
      <router-link :to="`${basePath}/help`" class="hover:text-primaryLight">Help</router-link>
      <router-link :to="`${basePath}/contact`" class="hover:text-primaryLight">Contact</router-link>
      <a href="#" @click.prevent="logout" class="hover:text-primaryLight">Logout</a>
    </nav>
  </header>
</template>

<script>
export default {
  name: "Header",
  computed: {
    basePath() {
      return this.$route.path.startsWith("/admin") ? "/admin" : "/user";
    },
  },
  methods: {
    logout() {
      console.log("🔒 Logging out user...");
      localStorage.removeItem("token");
      this.$router.push("/");
    },
  },
};
</script>


<style>
header {
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
}
</style>
