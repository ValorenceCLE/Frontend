<template>
  <div class="flex flex-col min-h-screen">
    <Header />
    <div class="flex flex-grow">
      <!-- Sidebar on the left -->
      <SideBar />

      <!-- Main content on the right -->
      <div class="flex-grow flex flex-col bg-crosshatch-pattern bg-background">
        <!-- Body content can go here -->
        <div class="flex-grow flex justify-center items-center text-grayDark">
          <h1>Testing</h1>
        </div>
      </div>
    </div>
    <Footer />
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
