// dummyApi.js
import relaysData from "./data/relays.json";
import timezoneData from "./data/timezone.js";
import networkData from "./data/network.js";
import emailData from "./data/emails.js";
import relaySetup from "./data/relay_setup.json";
import conditionalTasksData from "./data/conditionalTasks.json";

// Helper function to find the smallest unused positive integer
function getNextTaskId(tasks) {
  const ids = tasks.map(task => task.id).sort((a, b) => a - b);
  let nextId = 1;
  for (let id of ids) {
    if (id === nextId) {
      nextId++;
    } else if (id > nextId) {
      break;
    }
  }
  return nextId;
}

// Load the initial data into localStorage (if not already present)
if (!localStorage.getItem("networkSettings")) {
  localStorage.setItem(
    "networkSettings",
    JSON.stringify(networkData.network_settings.custom)
  );
}
if (!localStorage.getItem("timezoneSettings")) {
  localStorage.setItem(
    "timezoneSettings",
    JSON.stringify(timezoneData.date_time_settings.custom)
  );
}
if (!localStorage.getItem("emailSettings")) {
  localStorage.setItem(
    "emailSettings",
    JSON.stringify(emailData.email_settings)
  );
}
if (!localStorage.getItem("relaySetup")) {
  localStorage.setItem("relaySetup", JSON.stringify(relaySetup.relays));
}
if (!localStorage.getItem("conditionalTasks")) {
  localStorage.setItem(
    "conditionalTasks",
    JSON.stringify(conditionalTasksData.conditionalTasks)
  );
}

const DummyAPI = {
  // Handle GET requests
  get: (endpoint) => {
    if (endpoint === "/api/relays") {
      return { success: true, data: relaysData.relays }; // Read relays from JSON
    }
    if (endpoint === "/api/relaySetup") {
      const storedRelaySetup = JSON.parse(localStorage.getItem("relaySetup"));
      return { success: true, data: storedRelaySetup };
    }
    if (endpoint === "/api/timezone") {
      const storedTimezoneSettings = JSON.parse(
        localStorage.getItem("timezoneSettings")
      );
      return { success: true, data: storedTimezoneSettings };
    }
    if (endpoint === "/api/network") {
      const storedNetworkSettings = JSON.parse(
        localStorage.getItem("networkSettings")
      );
      return { success: true, data: storedNetworkSettings };
    }
    if (endpoint === "/api/emails") {
      const storedEmailSettings = JSON.parse(
        localStorage.getItem("emailSettings")
      );
      return { success: true, data: storedEmailSettings };
    }
    if (endpoint === "/api/conditionalTasks") {
      const storedTasks = JSON.parse(localStorage.getItem("conditionalTasks")) || [];
      return { success: true, data: storedTasks };
    }
    return { success: false, error: "Endpoint not found." };
  },

  // Handle POST requests
  post: (endpoint, payload) => {
    if (endpoint === "/api/relaySetup") {
      localStorage.setItem("relaySetup", JSON.stringify(payload));
      return { success: true, data: payload };
    }
    if (endpoint === "/api/network") {
      localStorage.setItem("networkSettings", JSON.stringify(payload));
      return { success: true, data: payload };
    }
    if (endpoint === "/api/timezone") {
      localStorage.setItem("timezoneSettings", JSON.stringify(payload));
      return { success: true, data: payload };
    }
    if (endpoint === "/api/emails") {
      localStorage.setItem("emailSettings", JSON.stringify(payload));
      return { success: true, data: payload };
    }
    if (endpoint === "/api/conditionalTasks") {
      const storedTasks = JSON.parse(localStorage.getItem("conditionalTasks")) || [];
      const newId = getNextTaskId(storedTasks);
      payload.id = newId; // Assign incremental ID
      storedTasks.push(payload);
      localStorage.setItem("conditionalTasks", JSON.stringify(storedTasks));
      return { success: true, data: payload };
    }
    return { success: false, error: "Endpoint not found." };
  },

  // Handle PUT requests
  put: (endpoint, payload) => {
    const taskIdMatch = endpoint.match(/^\/api\/conditionalTasks\/(\d+)$/);
    if (taskIdMatch) {
      const taskId = Number(taskIdMatch[1]);
      let storedTasks = JSON.parse(localStorage.getItem("conditionalTasks")) || [];
      const taskIndex = storedTasks.findIndex((task) => task.id === taskId);
      if (taskIndex !== -1) {
        storedTasks[taskIndex] = payload;
        localStorage.setItem("conditionalTasks", JSON.stringify(storedTasks));
        return { success: true, data: payload };
      }
      return { success: false, error: "Task not found." };
    }
    return { success: false, error: "Endpoint not found." };
  },

  // Handle DELETE requests
  delete: (endpoint) => {
    const taskIdMatch = endpoint.match(/^\/api\/conditionalTasks\/(\d+)$/);
    if (taskIdMatch) {
      const taskId = Number(taskIdMatch[1]);
      let storedTasks = JSON.parse(localStorage.getItem("conditionalTasks")) || [];
      const taskIndex = storedTasks.findIndex((task) => task.id === taskId);
      if (taskIndex !== -1) {
        storedTasks.splice(taskIndex, 1);
        localStorage.setItem("conditionalTasks", JSON.stringify(storedTasks));
        return { success: true };
      }
      return { success: false, error: "Task not found." };
    }
    return { success: false, error: "Endpoint not found." };
  },
};

export default DummyAPI;
