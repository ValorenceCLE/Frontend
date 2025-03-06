// src/store/config.js
import { defineStore } from 'pinia';
import {
  fetchConfig as apiFetchConfig,
  updateConfig as apiUpdateConfig,
  updateConfigSection as apiUpdateConfigSection,
} from '@/api/configService';

export const useConfigStore = defineStore('config', {
  state: () => ({
    configData: null,
    loading: false,
    error: null,
  }),
  actions: {
    /**
     * Fetch the full configuration from the backend.
     * Updates the in-memory state and localStorage on success.
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
        // Update localStorage after a successful fetch
        localStorage.setItem('config', JSON.stringify(data));
      } catch (err) {
        this.error = err.response?.data?.message || err.message;
      } finally {
        this.loading = false;
      }
    },
    /**
     * Manually refresh the configuration.
     * Can be bound to a UI control (like a Refresh button) to update config without a full reload.
     */
    async refreshConfig() {
      await this.fetchConfig();
    },
    /**
     * Update a specific configuration section.
     * Only updates localStorage and state after a successful backend response.
     * @param {string} section - The section to update.
     * @param {Object} newData - The new data for that section.
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
        const updatedSection = await apiUpdateConfigSection(section, newData);
        // Update the specific section in the in-memory state
        if (this.configData) {
          this.configData[section] = updatedSection;
        } else {
          // If configData is not yet loaded, fetch the full config
          await this.fetchConfig();
        }
        // Update localStorage with the new state
        localStorage.setItem('config', JSON.stringify(this.configData));
      } catch (err) {
        this.error = err.response?.data?.message || err.message;
      } finally {
        this.loading = false;
      }
    },
    /**
     * Update the full configuration.
     * Maintains backward compatibility with the full update approach.
     * @param {Object} newConfig - The full configuration object.
     */
    async updateConfig(newConfig) {
      this.loading = true;
      this.error = null;
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No token found. Please log in.");
        }
        await apiUpdateConfig(newConfig);
        this.configData = newConfig;
        localStorage.setItem('config', JSON.stringify(newConfig));
      } catch (err) {
        this.error = err.response?.data?.message || err.message;
      } finally {
        this.loading = false;
      }
    },
  },
});
