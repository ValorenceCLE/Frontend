// src/store/config.js
import { defineStore } from 'pinia';
import {
  fetchConfig as apiFetchConfig,
  updateConfig as apiUpdateConfig,
  updateConfigSection as apiUpdateConfigSection,
  revertToDefaults as apiRevertToDefaults,
} from '@/api/configService';
import configUtils from '@/utils/configUtils';

/**
 * Config store for managing application configuration
 */
export const useConfigStore = defineStore('config', {
  state: () => ({
    configData: null,
    loading: false,
    error: null,
    lastUpdate: null,
  }),
  
  getters: {
    /**
     * Get a specific section of configuration
     * @param {string} section - The section name
     * @returns {Object|null} The section data or null
     */
    getSection: (state) => (section) => {
      if (!state.configData || !section) return null;
      return state.configData[section] || null;
    },
    
    /**
     * Get a value from the configuration
     * Uses the configUtils to safely access nested properties
     * @param {string} path - Path to the value using dot notation
     * @param {any} defaultValue - Default value if not found
     * @returns {any} The value or default
     */
    getValue: (state) => (path, defaultValue) => {
      if (!state.configData) return defaultValue;
      
      // Use the configUtils.get method for safe access
      return configUtils.get(path, defaultValue);
    },
    
    /**
     * Get system name (convenience getter)
     * @returns {string} System name
     */
    systemName: (state) => {
      return state.configData?.general?.system_name || 'Unnamed System';
    },
    
    /**
     * Get enabled relays (convenience getter)
     * @returns {Array} Array of enabled relay objects
     */
    enabledRelays: (state) => {
      if (!state.configData?.relays) return [];
      
      return Object.values(state.configData.relays)
        .filter(relay => relay.enabled)
        .map(relay => ({
          ...relay,
          // Convert string state to numeric if needed
          state: typeof relay.state === 'string' ? 
            (relay.state.toLowerCase() === 'on' ? 1 : 0) : relay.state
        }));
    },
    
    /**
     * Check if configuration is loaded
     * @returns {boolean} True if config is loaded
     */
    isLoaded: (state) => {
      return !!state.configData;
    }
  },
  
  actions: {
    /**
     * Fetch the full configuration from the backend
     * @returns {Promise<void>}
     */
    async fetchConfig() {
      this.loading = true;
      this.error = null;
      
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.warn("No token found, redirecting to login.");
          window.location.href = "/login";
          return;
        }
        
        const data = await apiFetchConfig();
        this.configData = data;
        this.lastUpdate = new Date();
        
        // Update localStorage after a successful fetch
        localStorage.setItem('config', JSON.stringify(data));
      } catch (err) {
        this.error = err.response?.data?.message || err.message;
        console.error('Error fetching config:', this.error);
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Manually refresh the configuration
     * @returns {Promise<void>}
     */
    async refreshConfig() {
      await this.fetchConfig();
    },
    
    /**
     * Update a specific configuration section
     * @param {string} section - The section to update
     * @param {Object} newData - The new data for that section
     * @returns {Promise<Object>} API response
     */
    async updateConfigSection(section, newData) {
      this.loading = true;
      this.error = null;
      
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No token found. Please log in.");
        }
        
        // Call the API to update the specific section
        const response = await apiUpdateConfigSection(section, newData);
        
        // Update the specific section in the in-memory state
        if (this.configData) {
          this.configData[section] = newData;
          this.lastUpdate = new Date();
        } else {
          // If configData is not yet loaded, fetch the full config
          await this.fetchConfig();
        }
        
        // Update localStorage with the new state
        localStorage.setItem('config', JSON.stringify(this.configData));
        
        return response;
      } catch (err) {
        this.error = err.response?.data?.message || err.message;
        console.error('Error updating config section:', this.error);
        throw err;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Update the full configuration
     * @param {Object} newConfig - The full configuration object
     * @returns {Promise<Object>} API response
     */
    async updateConfig(newConfig) {
      this.loading = true;
      this.error = null;
      
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No token found. Please log in.");
        }
        
        const response = await apiUpdateConfig(newConfig);
        this.configData = newConfig;
        this.lastUpdate = new Date();
        
        localStorage.setItem('config', JSON.stringify(newConfig));
        
        return response;
      } catch (err) {
        this.error = err.response?.data?.message || err.message;
        console.error('Error updating config:', this.error);
        throw err;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Revert to default configuration
     * @returns {Promise<Object>} API response
     */
    async revertToDefaults() {
      this.loading = true;
      this.error = null;
      
      try {
        await apiRevertToDefaults();
        // After reverting, fetch the updated configuration
        await this.fetchConfig();
        return { success: true };
      } catch (err) {
        console.error("Error in revertToDefaults:", err);
        this.error = err.message || "Unknown error";
        throw err;
      } finally {
        this.loading = false;
      }
    }
  },
});