<template>
  <div class="flex flex-col min-h-screen">
    <Header />

    <div class="flex-grow flex">
      <!-- Main content area without sidebar -->
      <div
        class="flex-grow bg-crosshatch-pattern bg-background p-4 flex items-center justify-center"
      >
        <Dashboard />
      </div>
    </div>

    <Footer />
  </div>
</template>

<script>
import Header from "@/components/Header.vue";
import Footer from "@/components/Footer.vue";
import Dashboard from "@/components/etc/Dashboard.vue";

export default {
  name: "TestingViewNoSidebar", // Updated component name
  components: {
    Header,
    Footer,
    Dashboard,
  },
};
</script>
