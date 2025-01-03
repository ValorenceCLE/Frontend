<template>
  <header
    class="flex items-center justify-between px-6 bg-gradient-to-b from-primaryDark to-grayDark text-white shadow-md"
    style="height: 4rem"
  >
    <!-- Logo Section -->
    <div class="flex items-center">
      <img
        src="@/assets/cle.png"
        alt="CLE Logo"
        class="h-full max-h-[3rem] object-contain"
      />
    </div>

    <!-- Unit Name Section -->

    <!-- <div
      class="absolute left-1/2 transform -translate-x-1/2 text-center font-medium"
      style="font-size: 1.75rem; line-height: 4rem; color: inherit"
    >
      Demo DPM #1
    </div> -->

    <!-- Navigation Section -->
    <nav class="flex items-center space-x-4">
      <a
        href="/user"
        class="font-semibold hover:text-primaryLight"
        style="font-size: 1.4rem"
        >User</a
      >
      <a
        href="/admin"
        class="font-semibold hover:text-primaryLight"
        style="font-size: 1.4rem"
        >Admin</a
      >
      <a href="/" class="font-semibold hover:text-primaryLight" style="font-size: 1.4rem"
        >Logout</a
      >
    </nav>
  </header>
</template>

<script>
export default {
  name: "Header",
};
</script>

<style>
header {
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
}
</style>
