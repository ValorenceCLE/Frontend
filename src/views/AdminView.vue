<template>
  <div class="min-h-screen flex">
    <SideBar />
    <div class="flex-grow flex flex-col">
      <Header />
      <div class="flex-grow bg-grayLight">
        <!-- Placeholder for the Admin View -->
        <div class="flex justify-center items-center h-full text-grayDark">
          <h1>Admin Dashboard - Work in Progress</h1>
        </div>
      </div>
      <Footer />
    </div>
  </div>
</template>

<script>
import Header from "../components/Header.vue";
import Footer from "../components/Footer.vue";
import SideBar from "../components/SideBar.vue";

export default {
  components: {
    Header,
    Footer,
    SideBar,
  },
};
</script>
