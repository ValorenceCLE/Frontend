import { ref, onMounted, onBeforeUnmount, watch } from 'vue';

/**
 * Composable for automatic polling of data
 * @param {Function} fetchFunction - The function to call for fetching data
 * @param {Object} options - Configuration options
 * @param {number} options.interval - Polling interval in milliseconds (default: 5000)
 * @param {boolean} options.immediate - Whether to fetch immediately on mount (default: true)
 * @param {boolean} options.enabled - Whether polling is initially enabled (default: true)
 * @param {Function} options.onSuccess - Callback on successful fetch
 * @param {Function} options.onError - Callback on fetch error
 * @param {Array} options.dependencies - Dependencies that should trigger a new fetch when changed
 * @returns {Object} Polling state and control functions
 */
export function usePolling(fetchFunction, options = {}) {
  const {
    immediate = true,
    enabled = true,
    onSuccess = () => { },
    onError = (error) => { },
    dependencies = []
  } = options;

  // Store interval in a ref so it can be changed
  const pollingInterval = ref(options.interval || 5000);

  // Polling state
  const isPolling = ref(enabled);
  const data = ref(null);
  const error = ref(null);
  const loading = ref(false);
  const lastFetchTime = ref(null);
  let timerId = null;

  // Fetch data and handle response
  const fetchData = async () => {
    if (!isPolling.value) return;

    loading.value = true;
    error.value = null;

    try {
      const result = await fetchFunction();
      data.value = result;
      lastFetchTime.value = new Date();
      onSuccess(result);
    } catch (err) {
      error.value = err;
      onError(err);
    } finally {
      loading.value = false;
    }
  };

  // Start polling
  const startPolling = () => {
    if (isPolling.value) return;

    isPolling.value = true;

    // Fetch immediately when starting
    fetchData();

    // Set up the polling interval
    scheduleNextPoll();
  };

  // Schedule the next poll
  const scheduleNextPoll = () => {
    if (!isPolling.value) return;

    // Clear any existing timer
    if (timerId) {
      clearTimeout(timerId);
    }

    // Set up new timer
    timerId = setTimeout(() => {
      fetchData();
      // After fetch completes, schedule the next one
      scheduleNextPoll();
    }, pollingInterval.value);
  };

  // Stop polling
  const stopPolling = () => {
    isPolling.value = false;

    if (timerId) {
      clearTimeout(timerId);
      timerId = null;
    }
  };

  // Fetch once without affecting the polling state
  const fetchOnce = async () => {
    loading.value = true;
    error.value = null;

    try {
      const result = await fetchFunction();
      data.value = result;
      lastFetchTime.value = new Date();
      onSuccess(result);
      return result;
    } catch (err) {
      error.value = err;
      onError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Change polling interval
  const setPollingInterval = (newInterval) => {
    if (newInterval <= 0) {
      return;
    }

    // Update the interval
    pollingInterval.value = newInterval;

    // If already polling, restart with new interval
    if (isPolling.value) {
      stopPolling();
      startPolling();
    }
  };

  // Lifecycle hooks
  onMounted(() => {
    if (immediate && enabled) {
      startPolling();
    }
  });

  onBeforeUnmount(() => {
    stopPolling();
  });

  // Watch dependencies for changes
  if (dependencies.length > 0) {
    watch(dependencies, () => {
      if (isPolling.value) {
        // Trigger an immediate fetch when dependencies change
        fetchData();
      }
    });
  }

  return {
    isPolling,
    data,
    error,
    loading,
    lastFetchTime,
    startPolling,
    stopPolling,
    fetchOnce,
    setPollingInterval
  };
}