<template>
  <div class="min-h-screen flex flex-col">
    <Header />
    <div
      class="flex-grow flex justify-center items-center bg-crosshatch-pattern bg-background"
    >
      <Login />
    </div>
    <Footer />
  </div>
</template>

<script>
import Header from "@/components/base/Header.vue";
import Footer from "@/components/base/Footer.vue";
import Login from "@/components/base/Login.vue";

export default {
  components: {
    Header,
    Footer,
    Login,
  },
};
</script>
