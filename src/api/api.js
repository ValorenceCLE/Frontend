import baseConfig from "@/api/data/general.json"; // Original JSON file

// Create a deep copy of the base configuration to work with in memory
let memoryConfig = JSON.parse(JSON.stringify(baseConfig));

/**
 * Get the in-memory configuration.
 * @returns {Object} - The current state of the in-memory configuration.
 */
export function getMemoryConfig() {
  return memoryConfig;
}

/**
 * Update the in-memory configuration with new data.
 * @param {Object} updatedConfig - The updated configuration object.
 */
export function updateMemoryConfig(updatedConfig) {
  memoryConfig = { ...memoryConfig, ...updatedConfig };
}

/**
 * Reset the in-memory configuration to the base configuration.
 */
export function resetMemoryConfig() {
  memoryConfig = JSON.parse(JSON.stringify(baseConfig));
  console.log("Memory configuration reset to base configuration.");
}

/**
 * Log the current in-memory configuration to the console.
 */
export function logMemoryConfig() {
  console.log("Current Memory Configuration:", memoryConfig);
}

/**
 * Simulate an API response with a delay.
 * @param {Object} data - The data to return in the response.
 * @param {number} delay - Delay in milliseconds (default: 500ms).
 * @returns {Promise} - A promise resolving to a mock API response.
 */
export function mockResponse(data, delay = 500) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, data });
    }, delay);
  });
}
