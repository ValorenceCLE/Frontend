<template>
  <div class="flex flex-col min-h-screen">
    <Header />

    <div class="flex-grow flex">
      <!-- Main content area without sidebar -->
      <div class="flex-grow bg-crosshatch-pattern bg-background p-4">
        <router-view />
      </div>
    </div>

    <Footer />
  </div>
</template>

<script>
import Header from "@/components/Header.vue";
import Footer from "@/components/Footer.vue";

export default {
  name: "UserView",
  components: {
    Header,
    Footer,
  },
};
</script>
