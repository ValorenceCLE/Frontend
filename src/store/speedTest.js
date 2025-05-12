import { ref } from "vue";
import { defineStore } from "pinia";
import { performSpeedTest } from "@/api/networkService"; 
import { usePolling } from "@/composables/usePolling";

export const useSpeedTestStore = defineStore("speedTest", () => {
  // State
  const speedTestResults = ref(null);
  const lastTestTime = ref(null);
  
  // Use the polling composable for speed tests
  const { 
    data, 
    loading: speedTestLoading, 
    startPolling, 
    stopPolling, 
    setPollingInterval 
  } = usePolling(fetchSpeedTest, {
    interval: 30000, // Default 30s interval
    immediate: false, // Don't start automatically
    onSuccess: (results) => {
      // Only update state if we have valid results with upload and download properties
      if (results && (results.download !== undefined && results.upload !== undefined)) {
        speedTestResults.value = results;
        lastTestTime.value = new Date();
      }
    }
  });
  
  /**
   * Fetch speed test results from the API
   * @param {boolean} force - Whether to force a new test instead of using cached results
   */
  async function fetchSpeedTest(force = false) {
    return await performSpeedTest(force);
  }

  /**
   * Start polling for speed test results at regular intervals
   * @param {number} intervalMs - Polling interval in milliseconds
   */
  function startSpeedTestPolling(intervalMs = 30000) {
    setPollingInterval(intervalMs);
    startPolling();
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