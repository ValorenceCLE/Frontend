import relaysData from "./data/relays.json";
import timezoneData from "./data/timezone.js";
import networkData from "./data/network.js";

// Load the initial network data into localStorage (if not already present)
if (!localStorage.getItem("networkSettings")) {
  localStorage.setItem("networkSettings", JSON.stringify(networkData.network_settings.custom));
}
if (!localStorage.getItem("timezoneSettings")) {
  localStorage.setItem("timezoneSettings", JSON.stringify(timezoneData.date_time_settings.custom));
}

const DummyAPI = {
  // Handle GET requests
  get: (endpoint) => {
    if (endpoint === "/api/relays") {
      return { success: true, data: relaysData.relays }; // Read relays from JSON
    }
    if (endpoint === "/api/timezone") {
      const storedTimezoneSettings = JSON.parse(localStorage.getItem("timezoneSettings"));
      return { success: true, data: storedTimezoneSettings };
    }
    if (endpoint === "/api/network") {
      // Fetch network settings from localStorage
      const storedNetworkSettings = JSON.parse(localStorage.getItem("networkSettings"));
      return { success: true, data: storedNetworkSettings };
    }
    return { success: false, error: "Endpoint not found." };
  },

  // Handle POST requests
  post: (endpoint, payload) => {
    if (endpoint === "/api/network") {
      // Save the updated network settings to localStorage
      localStorage.setItem("networkSettings", JSON.stringify(payload));
      return { success: true, data: payload };
    }
    if (endpoint === "/api/timezone") {
      // Save the updated timezone settings to localStorage
      localStorage.setItem("timezoneSettings", JSON.stringify(payload));
      return { success: true, data: payload };
    }
    return { success: false, error: "Endpoint not found." };

  },
};

export default DummyAPI;
