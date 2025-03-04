// Updating Config Option 1:
// This may need to be broken out into several actions, one for each section of the config object (JSON)
// This may make it easier to update only the necessary parts of the config

// Updating Config Option 2:
// The other option would be to have the component only pass the changed fields of the config
// Then the function will search for the field in the config and update only that field

// Updating Config Option 3:
// The other option would be to have the component only pass the changed object
// For example anytime network settings are changed, the entire network object is passed
// then all this function needs to do is map to the correct object in the config

import axios from 'axios';
import { defineStore } from 'pinia';

axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      // Optionally, check for a specific message or error code here.
      alert("Your session has expired. Please log in again.");
      localStorage.removeItem("token");
      localStorage.removeItem("token_exp");
      // Redirect to login page (or clear state, etc.)
      window.location.href = "/"; // Adjust as needed for your router setup
    }
    return Promise.reject(error);
  }
);

export const useConfigStore = defineStore('config', {
  state: () => ({
    configData: null,
    loading: false,
    error: null
  }),
  actions: {
    async fetchConfig() {
      this.loading = true;
      this.error = null;
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.warn("No token found, redirecting to login.");
          window.location.href = "/login";
        }
        const response = await axios.get("http://localhost:8000/api/config/", {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.configData = response.data;
      } catch (err) {
        this.error = err.response?.data?.message || err.message;
      } finally {
        this.loading = false;
      }
    },
    async updateConfig(newConfig) {
      this.loading = true;
      this.error = null;
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No token found. Please log in.");
        }
        await axios.post("http://localhost:8000/api/config/", newConfig, {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.configData = newConfig;
      } catch (err) {
        this.error = err.response?.data?.message || err.message;
      } finally {
        this.loading = false;
      }
    }
  }
});

