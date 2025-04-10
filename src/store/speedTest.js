import { ref, onBeforeUnmount } from "vue";
import { defineStore } from "pinia";
import { performSpeedTest } from "@/api/networkService"; 

export const useSpeedTestStore = defineStore("speedTest", () => {
  // State
  const speedTestResults = ref(null);
  const speedTestLoading = ref(false);
  const lastTestTime = ref(null);
  const pollingInterval = ref(null);

  /**
   * Fetch speed test results from the API
   * @param {boolean} force - Whether to force a new test instead of using cached results
   */
  async function fetchSpeedTest(force = false) {
    try {
      speedTestLoading.value = true;
      const results = await performSpeedTest(force);
      
      // Only update state if we have valid results with upload and download properties
      if (results && (results.download !== undefined && results.upload !== undefined)) {
        speedTestResults.value = results;
        lastTestTime.value = new Date();
      }
    } catch (err) {
      console.error("Speed test error:", err);
    } finally {
      speedTestLoading.value = false;
    }
  }

  /**
   * Start polling for speed test results at regular intervals
   * @param {number} intervalMs - Polling interval in milliseconds
   */
  function startSpeedTestPolling(intervalMs = 30000) {
    // Clear any existing interval
    if (pollingInterval.value) {
      clearInterval(pollingInterval.value);
    }
    
    // Immediately fetch once on startup
    fetchSpeedTest();
    
    // Then set up regular polling - 30 seconds is more reasonable
    // than 10 seconds given your 5-minute cache period
    pollingInterval.value = setInterval(() => fetchSpeedTest(), intervalMs);
  }

  /**
   * Stop the polling interval
   */
  function stopPolling() {
    if (pollingInterval.value) {
      clearInterval(pollingInterval.value);
      pollingInterval.value = null;
    }
  }

  return {
    speedTestResults,
    speedTestLoading,
    lastTestTime,
    fetchSpeedTest,
    startSpeedTestPolling,
    stopPolling
  };
});