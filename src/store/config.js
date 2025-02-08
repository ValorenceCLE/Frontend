import { defineStore } from 'pinia'
import axios from 'axios' // Axios for HTTP requests

export const useConfigStore = defineStore('config', {
    state: () => ({
        configData: null,
        loading: false,
        error: null
    }),
    actions: {
        async fetchConfig() {
            this.loading = true
            try {
                const response = await axios.get('/api/config')
                this.configData = response.data
            } catch (err) {
                this.error = err.message
            } finally {
                this.loading = false
            }
        },
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
        async updateConfig(newConfig){
            try {
                await axios.post('/api/config', newConfig)
                this.configData = newConfig
            } catch (err) {
                this.error = err.message
            } finally {
                this.loading = false
            }
        }
    }
})