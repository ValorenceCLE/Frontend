<template>
  <footer
    class="relative bg-gradient-to-b from-primaryDark to-grayDark text-white"
    style="height: 2.25rem"
  >
    <div
      class="container mx-auto text-center font-semibold"
      style="font-size: 1rem; line-height: 2rem"
    >
      © 2024 Covert Law Enforcement. All Rights Reserved | Support: (435)-565-6018
    </div>
    <div
      class="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-b from-transparent to-primaryMed"
    ></div>
  </footer>
</template>

<script>
export default {
  name: "Footer",
};
</script>

<style>
footer {
  border-top: 2px solid rgba(255, 255, 255, 0.1);
}
</style>
