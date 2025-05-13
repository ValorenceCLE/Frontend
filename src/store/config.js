// src/store/config.js - REPLACEMENT VERSION
import { defineStore } from 'pinia';
import axios from '@/axios';

/**
 * Configuration store that ensures data is always fresh
 * This is a complete replacement for the existing config store
 */
export const useConfigStore = defineStore('config', {
  state: () => ({
    configData: null,
    loading: false,
    error: null,
  }),
  
  getters: {
    // Compatibility with existing code
    isConfigLoaded: (state) => state.configData !== null,
  },
  
  actions: {
    /**
     * Fetch configuration without any changes to your existing API endpoints
     */
    async fetchConfig() {
      this.loading = true;
      this.error = null;
      
      try {
        console.log("✅ Fetching fresh configuration data");
        
        // Standard API call, matching your existing endpoint
        const response = await axios.get('/config/');
        
        this.configData = response.data;
        console.log("✅ Configuration data refreshed successfully");
        
        return this.configData;
      } catch (err) {
        this.error = err.response?.data?.message || err.message;
        console.error("❌ Error fetching configuration:", this.error);
        throw err;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Update the full configuration
     */
    async updateConfig(newConfig) {
      this.loading = true;
      this.error = null;
      
      try {
        console.log("🔄 Updating full configuration...");
        
        // Step 1: Update the configuration on the backend
        const response = await axios.post('/config/', newConfig);
        
        // Step 2: ALWAYS fetch the latest config to ensure consistency
        await this.fetchConfig();
        
        console.log("✅ Full configuration updated and refreshed");
        return response.data;
      } catch (err) {
        this.error = err.response?.data?.message || err.message;
        console.error("❌ Error updating configuration:", this.error);
        throw err;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Update a specific configuration section
     */
    async updateConfigSection(section, newData) {
      this.loading = true;
      this.error = null;
      
      try {
        console.log(`🔄 Updating ${section} configuration...`);
        
        // Step 1: Update the configuration on the backend
        const response = await axios.post(`/config/${section}`, newData);
        
        // Step 2: ALWAYS fetch the latest config to ensure consistency
        await this.fetchConfig();
        
        console.log(`✅ Configuration section ${section} updated and refreshed`);
        return response.data;
      } catch (err) {
        this.error = err.response?.data?.message || err.message;
        console.error(`❌ Error updating ${section} configuration:`, this.error);
        throw err;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Revert to default configuration
     */
    async revertToDefaults() {
      this.loading = true;
      this.error = null;
      
      try {
        console.log("🔄 Reverting to default configuration...");
        
        // Step 1: Call the revert API
        const response = await axios.post('/config/revert');
        
        // Step 2: ALWAYS fetch the latest config to ensure consistency
        await this.fetchConfig();
        
        console.log("✅ Configuration reverted to defaults and refreshed");
        return response.data;
      } catch (err) {
        this.error = err.response?.data?.message || err.message;
        console.error("❌ Error reverting to defaults:", this.error);
        throw err;
      } finally {
        this.loading = false;
      }
    }
  },
});