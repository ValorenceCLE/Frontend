// src/store/config.js
import { defineStore } from 'pinia';
import { fetchConfig, updateConfig, updateConfigSection, revertToDefaults } from '@/api/configService';

export const useConfigStore = defineStore('config', {
  state: () => ({
    configData: null,
    loading: false,
    error: null,
    updateCounter: 0, // Tracks updates for reactivity
    lastUpdated: null,
  }),
  
  getters: {
    isConfigLoaded: (state) => state.configData !== null,
    
    // Section getters
    general: (state) => state.configData?.general || {},
    network: (state) => state.configData?.network || {},
    dateTime: (state) => state.configData?.date_time || {},
    email: (state) => state.configData?.email || {},
    
    // Relays - with array and object access
    relays: (state) => state.configData?.relays || [],
    relaysObject: (state) => {
      if (!state.configData?.relays) return {};
      return state.configData.relays.reduce((acc, relay) => {
        if (relay.id) acc[relay.id] = relay;
        return acc;
      }, {});
    },
    enabledRelays: (state) => (state.configData?.relays || [])
      .filter(relay => relay.enabled),
    getRelayById: (state) => (id) => {
      const relays = state.configData?.relays || [];
      return relays.find(relay => relay.id === id);
    },
    
    // Tasks
    tasks: (state) => state.configData?.tasks || [],
    getTaskById: (state) => (id) => {
      const tasks = state.configData?.tasks || [];
      return tasks.find(task => task.id === id);
    },
  },
  
  actions: {
    /**
     * Fetch the full configuration from the server
     * @param {boolean} force - Whether to force refresh with cache busting
     */
    async fetchConfig(force = false) {
      this.loading = true;
      this.error = null;
      
      try {
        console.log("📥 Fetching configuration data...");
        const cacheBuster = force ? Date.now() : null;
        const response = await fetchConfig(cacheBuster);
        
        // Update store with new data
        this.configData = response;
        this.lastUpdated = new Date();
        this.updateCounter++; // Increment to trigger reactivity
        
        console.log("✅ Configuration updated successfully");
        return this.configData;
      } catch (err) {
        this.error = err.message || "Failed to fetch configuration";
        console.error("❌ Error fetching configuration:", err);
        throw err;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Update the entire configuration
     * @param {Object} newConfig - New configuration data
     */
    async updateConfig(newConfig) {
      this.loading = true;
      this.error = null;
      
      try {
        console.log("📤 Updating full configuration...");
        
        // Send to backend - will receive updated config in response
        const response = await updateConfig(newConfig);
        
        // Update store with returned config
        if (response.config) {
          this.configData = response.config;
          this.updateCounter++;
        }
        
        console.log("✅ Full configuration updated successfully");
        return response;
      } catch (err) {
        this.error = err.message || "Failed to update configuration";
        console.error("❌ Error updating configuration:", err);
        throw err;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Update a specific section of the configuration
     * @param {string} section - Section name
     * @param {Object} data - New section data
     */
    async updateConfigSection(section, data) {
      this.loading = true;
      this.error = null;
      
      try {
        console.log(`📤 Updating configuration section: ${section}`);
        
        // Send to backend - will receive updated section in response
        const response = await updateConfigSection(section, data);
        
        // Update store with returned section
        if (response.section && this.configData) {
          this.configData = {
            ...this.configData,
            [section]: response.section
          };
          this.updateCounter++;
        }
        
        console.log(`✅ Configuration section ${section} updated successfully`);
        return response;
      } catch (err) {
        this.error = err.message || `Failed to update ${section} configuration`;
        console.error(`❌ Error updating ${section} configuration:`, err);
        throw err;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Revert configuration to defaults
     */
    async revertToDefaults() {
      this.loading = true;
      this.error = null;
      
      try {
        console.log("🔄 Reverting to default configuration...");
        
        // Send to backend - will receive default config in response
        const response = await revertToDefaults();
        
        // Update store with returned default config
        if (response.config) {
          this.configData = response.config;
          this.updateCounter++;
        }
        
        console.log("✅ Configuration reverted to defaults");
        return response;
      } catch (err) {
        this.error = err.message || "Failed to revert to defaults";
        console.error("❌ Error reverting to defaults:", err);
        throw err;
      } finally {
        this.loading = false;
      }
    }
  },
});