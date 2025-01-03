<template>
  <div class="min-h-screen flex flex-col">
    <Header />
    <div class="flex-grow bg-grayLight p-6 grid grid-cols-3 gap-6">
      <!-- Single Relay Card for testing -->
      <RelayCard
        relayName="Router"
        status="On"
        onLabel="Enable"
        offLabel="Disable"
        pulseLabel="Restart"
      />
    </div>
    <Footer />
  </div>
</template>

<script>
import Header from "../components/Header.vue";
import Footer from "../components/Footer.vue";
import RelayCard from "../components/RelayCard.vue";

export default {
  components: {
    Header,
    Footer,
    RelayCard,
  },
};
</script>
