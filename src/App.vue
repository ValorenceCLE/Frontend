<template>
  <div class="flex flex-col min-h-screen">
    <!-- Header -->
    <Header />

    <!-- Main Content -->
    <div class="flex flex-grow">
      <FixedNestedSidebar />
      <div class="flex-grow p-4 bg-grayLight">
        <router-view />
      </div>
    </div>

    <!-- Footer -->
    <Footer />
  </div>
</template>

<script>
import Header from "./components/Header.vue";
import Footer from "./components/Footer.vue";
import FixedNestedSidebar from "./components/FixedNestedSidebar.vue";

export default {
  name: "App",
  components: {
    Header,
    Footer,
    FixedNestedSidebar,
  },
};
</script>

<style scoped>
/* Optional: Add global styles if needed */
</style>
