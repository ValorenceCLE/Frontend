<template>
  <div class="flex flex-col min-h-screen">
    <Header />

    <div class="flex-grow flex">
      <SideBar />
      <!-- Main content area -->
      <div
        class="flex-grow bg-crosshatch-pattern bg-background p-4 flex items-center justify-center"
      >
        <Network />
      </div>
    </div>

    <Footer />
  </div>
</template>

<script>
import Header from "@/components/Header.vue";
import Footer from "@/components/Footer.vue";
import SideBar from "@/components/SideBar.vue";
import Network from "@/components/settings/Network.vue";

export default {
  name: "TestingView",
  components: {
    Header,
    Footer,
    SideBar,
    Network,
  },
};
</script>
