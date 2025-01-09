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
import Header from "../components/Header.vue";
import Footer from "../components/Footer.vue";
import Login from "../components/Login.vue";

export default {
  components: {
    Header,
    Footer,
    Login,
  },
};
</script>
