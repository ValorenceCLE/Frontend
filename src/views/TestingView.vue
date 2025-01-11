<template>
  <div class="flex flex-col min-h-screen">
    <Header />

    <div class="flex-grow flex">
      <SideBar />
      <!-- Main content area -->
      <div class="flex-grow bg-crosshatch-pattern bg-background p-4">
        <Dashboard />
      </div>
    </div>

    <Footer />
  </div>
</template>

<script>
import Header from "@/components/Header.vue";
import Footer from "@/components/Footer.vue";
import SideBar from "@/components/SideBar.vue";
import Dashboard from "@/components/etc/Dashboard.vue";

export default {
  name: "TestingView",
  components: {
    Header,
    Footer,
    SideBar,
    Dashboard,
  },
};
</script>
