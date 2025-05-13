// src/composables/useConfig.js
import { ref, computed, watch } from 'vue';
import { useConfigStore } from '@/store/config';

/**
 * Composable for consistent config interaction across components
 * @param {string} section - The config section to work with (optional)
 * @param {Object} options - Additional options
 * @returns {Object} Config utilities
 */
export function useConfig(section = null, options = {}) {
  const {
    autoFetch = true,       // Automatically fetch config if not loaded
    watchSection = true,    // Watch for changes in the section
    forceRefresh = false,   // Whether to force a refresh on mount
  } = options;
  
  const configStore = useConfigStore();
  
  // Track loading and error states locally
  const isLoading = ref(false);
  const error = ref(null);
  const successMessage = ref('');
  const lastUpdateCounter = ref(configStore.updateCounter); // Track store updates
  
  // Get the section data from the store
  const sectionData = computed(() => {
    if (!section) return configStore.configData;
    return configStore.configData?.[section] || null;
  });
  
  // Get the full config data
  const configData = computed(() => configStore.configData);
  
  // Check if config is loaded
  const isConfigLoaded = computed(() => configStore.isConfigLoaded);
  
  /**
   * Fetch the configuration if not already loaded
   * @returns {Promise<Object>} The configuration data
   */
  const ensureConfigLoaded = async () => {
    if (!configStore.isConfigLoaded || forceRefresh) {
      isLoading.value = true;
      error.value = null;
      
      try {
        await configStore.fetchConfig(forceRefresh);
        return configStore.configData;
      } catch (err) {
        error.value = err.message;
        return null;
      } finally {
        isLoading.value = false;
      }
    }
    
    return configStore.configData;
  };
  
  /**
   * Fetch the full configuration from the backend
   * @param {boolean} force - Whether to force a refresh
   * @returns {Promise<Object>} The configuration data
   */
  const fetchConfig = async (force = false) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      await configStore.fetchConfig(force);
      lastUpdateCounter.value = configStore.updateCounter;
      return configStore.configData;
    } catch (err) {
      error.value = err.message;
      return null;
    } finally {
      isLoading.value = false;
    }
  };
  
  /**
   * Update a configuration section
   * @param {Object} data - New section data
   * @param {string} targetSection - Section to update (defaults to constructor param)
   * @returns {Promise<Object>} The API response
   */
  const updateSection = async (data, targetSection = section) => {
    if (!targetSection) {
      throw new Error('No section specified for update');
    }
    
    isLoading.value = true;
    error.value = null;
    successMessage.value = '';
    
    try {
      const response = await configStore.updateConfigSection(targetSection, data);
      lastUpdateCounter.value = configStore.updateCounter;
      successMessage.value = `${targetSection} settings updated successfully`;
      setTimeout(() => {
        successMessage.value = '';
      }, 3000);
      return response;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };
  
  /**
   * Update the full configuration
   * @param {Object} config - New configuration
   * @returns {Promise<Object>} The API response
   */
  const updateConfig = async (config) => {
    isLoading.value = true;
    error.value = null;
    successMessage.value = '';
    
    try {
      const response = await configStore.updateConfig(config);
      lastUpdateCounter.value = configStore.updateCounter;
      successMessage.value = 'Configuration updated successfully';
      setTimeout(() => {
        successMessage.value = '';
      }, 3000);
      return response;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };
  
  /**
   * Revert to default configuration
   * @returns {Promise<Object>} The API response
   */
  const revertToDefaults = async () => {
    isLoading.value = true;
    error.value = null;
    successMessage.value = '';
    
    try {
      const response = await configStore.revertToDefaults();
      lastUpdateCounter.value = configStore.updateCounter;
      successMessage.value = 'Configuration reverted to defaults';
      setTimeout(() => {
        successMessage.value = '';
      }, 3000);
      return response;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };
  
  // Watch for changes in the store's update counter
  watch(() => configStore.updateCounter, (newCounter) => {
    if (newCounter !== lastUpdateCounter.value) {
      console.log(`Detected configStore update: ${lastUpdateCounter.value} -> ${newCounter}`);
      lastUpdateCounter.value = newCounter;
      
      // Can trigger a refresh here if needed
      if (forceRefresh) {
        fetchConfig(true);
      }
    }
  });
  
  // Watch for changes in the store's section data if requested
  if (section && watchSection) {
    watch(
      () => configStore.configData?.[section],
      (newValue) => {
        // The section data changed in the store
        console.log(`Section ${section} updated in store:`, newValue);
      },
      { deep: true }
    );
  }
  
  // Auto-fetch config if requested and not loaded
  if (autoFetch && (!configStore.isConfigLoaded || forceRefresh)) {
    ensureConfigLoaded();
  }
  
  return {
    // State
    configData,
    sectionData,
    isConfigLoaded,
    isLoading,
    error,
    successMessage,
    updateCounter: computed(() => configStore.updateCounter),
    
    // Methods
    fetchConfig,
    ensureConfigLoaded,
    updateSection,
    updateConfig,
    revertToDefaults,
  };
}