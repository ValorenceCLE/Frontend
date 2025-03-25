import { ref } from "vue";
import { defineStore } from "pinia";
import { performSpeedTest } from "@/api/networkService"; 

export const useSpeedTestStore = defineStore("speedTest", () => {
  // Holds the last known speed test data
  const speedTestResults = ref(null);
  // Holds whether a test is currently in progress
  const speedTestLoading = ref(false);

  // This function hits your backend to perform a speed test
  async function fetchSpeedTest() {
    try {
      speedTestLoading.value = true;
      const results = await performSpeedTest();
      speedTestResults.value = results;
    } catch (err) {
      console.error("Speed test error:", err);
    } finally {
      speedTestLoading.value = false;
    }
  }

  // Start polling the speed test in the background
  // e.g. every 10 seconds. Adjust as needed:
  function startSpeedTestPolling() {
    // Immediately fetch once on startup
    fetchSpeedTest();
    // Then fetch every 30 seconds
    setInterval(fetchSpeedTest, 10000);
  }

  return {
    speedTestResults,
    speedTestLoading,
    fetchSpeedTest,
    startSpeedTestPolling,
  };
});
