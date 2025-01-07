<template>
  <div class="min-h-screen flex flex-col">
    <Header />

    <!-- Main content area -->
    <div
      class="flex-grow flex flex-col items-center justify-center bg-crosshatch-pattern bg-background p-4"
    >
      <!-- 
          Container for RelayCards:
          - w-full so it can span full width of this section
          - max-w-3xl (for example) to limit extreme stretching on very wide screens
          - space-y-4 to stack each relay vertically with spacing
        -->
      <div class="w-full max-w-3xl space-y-4">
        <RelayCard
          v-for="(relay, index) in relays"
          :key="index"
          :initialName="relay.name"
          :initialStatus="relay.status"
          :initialButtons="relay.buttons"
        />
      </div>
    </div>

    <Footer />
  </div>
</template>

<script>
import Header from "../components/Header.vue";
import Footer from "../components/Footer.vue";
import RelayCard from "../components/RelayCard.vue";

export default {
  name: "UserView",
  components: {
    Header,
    Footer,
    RelayCard,
  },
  data() {
    return {
      // Sample relay data; add as many as you like
      relays: [
        {
          name: "Router",
          status: "On",
          buttons: {
            // on: "Enable",
            // off: "Disable",
            pulse: "Restart",
          },
        },
        {
          name: "Camera",
          status: "Off",
          buttons: {
            on: "Turn On",
            off: "Turn Off",
            // pulse: "Restart",
          },
        },
        {
          name: "Fan",
          status: "Off",
          buttons: {
            on: "On",
            off: "Off",
            pulse: "Run 5 Min.",
          },
        },
        {
          name: "IR Light",
          status: "Off",
          buttons: {
            on: "On",
            off: "Off",
            pulse: "Run 5 Min.",
          },
        },
      ],
    };
  },
};
</script>

<style scoped>
/* 
    The .space-y-4 in the container stacks each relay with 1rem gaps.
    We removed the grid approach to make them fill 100% width in a vertical list.
  */
</style>
