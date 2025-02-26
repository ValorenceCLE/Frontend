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

// /src/store/config.js
import { defineStore } from 'pinia'
import axios from 'axios'

export const useConfigStore = defineStore('config', {
  state: () => ({
    configData: null,
    loading: false,
    error: null
  }),
  actions: {
    // Fetch configuration with JWT in the header
    async fetchConfig() {
      this.loading = true
      this.error = null
      try {
        // Retrieve JWT token from local storage (set in Login.vue)
        const token = localStorage.getItem("token")
        if (!token) {
          throw new Error("No token found. Please log in.")
        }
        const response = await axios.get("http://localhost:8000/config/", {
          headers: {
            // Attach the token as a Bearer token in the Authorization header
            Authorization: `Bearer ${token}`
          }
        })
        this.configData = response.data
      } catch (err) {
        this.error = err.response?.data?.message || err.message
      } finally {
        this.loading = false
      }
    },

    // Update configuration with JWT in the header
    async updateConfig(newConfig) {
      this.loading = true
      this.error = null
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          throw new Error("No token found. Please log in.")
        }
        await axios.post("http://localhost:8000/config/", newConfig, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        // Update local store after successful POST
        this.configData = newConfig
      } catch (err) {
        this.error = err.response?.data?.message || err.message
      } finally {
        this.loading = false
      }
    }
  }
})
