<template>
  <div class="flex flex-col min-h-screen">
    <Header />

    <div class="flex-grow flex">
      <SideBar />
      <!-- Main content area -->
      <div
        class="flex-grow bg-crosshatch-pattern bg-background p-4 flex items-center justify-center"
      >
        <router-view />
      </div>
    </div>

    <Footer />
  </div>
</template>

<script>
import Header from "@/components/base/Header.vue";
import Footer from "@/components/base/Footer.vue";
import SideBar from "@/components/base/SideBar.vue";

export default {
  name: "AdminView",
  components: {
    Header,
    Footer,
    SideBar,
  },
};
</script>
