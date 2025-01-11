<template>
  <div class="min-h-screen flex flex-col">
    <Header />

    <!-- Main content area -->
    <div
      class="flex-grow flex flex-col items-center justify-center bg-crosshatch-pattern bg-background p-4"
    >
      <div class="w-full max-w-4xl space-y-4">
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
import RelayCard from "../components/relays/RelayCard.vue";
import RelayApi from "@/api/dummyApi";

export default {
  name: "UserView",
  components: {
    Header,
    Footer,
    RelayCard,
  },
  data() {
    return {
      relays: [], // Initialize empty array for relays
    };
  },
  async mounted() {
    const response = RelayApi.get("/api/relays"); // Fetch data from dummy API
    if (response.success) {
      this.relays = response.data; // Update the relays data
    } else {
      console.error(response.error); // Log error if the request fails
    }
  },
};
</script>
