<template>
  <!-- 
    Overall page is a vertical flex container
    that fills the screen (min-h-screen):
      - One “row” for Header
      - One “row” for the main area (Sidebar + Content)
      - One “row” for Footer
  -->
  <div class="flex flex-col min-h-screen">
    <!-- Header at the top -->
    <Header />

    <!-- Middle row: Sidebar + Main content side by side -->
    <!-- flex-grow so it expands to fill space between header & footer -->
    <div class="flex flex-grow">
      <!-- Sidebar on the left -->
      <SideBar />

      <!-- Main content on the right -->
      <div class="flex-grow flex flex-col">
        <!-- Body content can go here -->
        <div class="flex-grow flex justify-center items-center text-grayDark">
          <h1>Admin Dashboard - Work in Progress</h1>
        </div>
      </div>
    </div>

    <!-- Footer at the bottom -->
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

<style scoped>
/* 
  No more .flex on the root container with SideBar + main
  because we’re nesting that inside the middle “row” 
  (the .flex-grow).
*/
</style>
