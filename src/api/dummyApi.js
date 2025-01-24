// dummyApi.js
import relaysData from "./data/relays.json";
import timezoneData from "./data/timezone.js";
import networkData from "./data/network.js";
import emailData from "./data/emails.js";
import relaySetup from "./data/relay_setup.json";
import conditionalTasksData from "./data/conditionalTasks.json";

// Helper function to find the smallest unused positive integer
function getNextTaskId(tasks) {
  const ids = Object.keys(tasks).map(id => Number(id)).sort((a, b) => a - b);
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
  // Initialize as object
  const initialTasksArray = conditionalTasksData.conditionalTasks || [];
  const initialTasksObject = {};
  initialTasksArray.forEach(task => {
    initialTasksObject[task.id] = {
      name: task.name,
      source: task.trigger.source,
      field: task.trigger.field,
      operator: task.trigger.operator,
      value: task.trigger.value,
      actions: task.actions.map(action => {
        const { type, target, state, message } = action;
        const newAction = { type };
        if (type === "io") {
          newAction.target = target;
          newAction.state = state;
        }
        if (type === "email") {
          newAction.message = message;
        }
        return newAction;
      }),
    };
  });
  localStorage.setItem("conditionalTasks", JSON.stringify(initialTasksObject));
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
      const storedTasks = JSON.parse(localStorage.getItem("conditionalTasks")) || {};
      return { success: true, data: { tasks: storedTasks } };
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
      const storedTasks = JSON.parse(localStorage.getItem("conditionalTasks")) || {};
      const newId = getNextTaskId(storedTasks);
      const task = payload.tasks.new; // payload is { tasks: { new: task } }
      // Assign the new task ID and flatten the structure
      storedTasks[newId] = {
        name: task.name,
        source: task.source,
        field: task.field,
        operator: task.operator,
        value: task.value,
        actions: task.actions.map(action => {
          const { type, target, state, message } = action;
          const newAction = { type };
          if (type === "io") {
            newAction.target = target;
            newAction.state = state;
          }
          if (type === "email") {
            newAction.message = message;
          }
          return newAction;
        }),
      };
      localStorage.setItem("conditionalTasks", JSON.stringify(storedTasks));
      return { success: true, data: { tasks: { [newId]: storedTasks[newId] } } };
    }
    return { success: false, error: "Endpoint not found." };
  },

  // Handle PUT requests
  put: (endpoint, payload) => {
    const taskIdMatch = endpoint.match(/^\/api\/conditionalTasks\/(\d+)$/);
    if (taskIdMatch) {
      const taskId = taskIdMatch[1]; // string
      let storedTasks = JSON.parse(localStorage.getItem("conditionalTasks")) || {};
      if (storedTasks[taskId]) {
        const updatedTask = payload.tasks[taskId];
        storedTasks[taskId] = {
          name: updatedTask.name,
          source: updatedTask.source,
          field: updatedTask.field,
          operator: updatedTask.operator,
          value: updatedTask.value,
          actions: updatedTask.actions.map(action => {
            const { type, target, state, message } = action;
            const newAction = { type };
            if (type === "io") {
              newAction.target = target;
              newAction.state = state;
            }
            if (type === "email") {
              newAction.message = message;
            }
            return newAction;
          }),
        };
        localStorage.setItem("conditionalTasks", JSON.stringify(storedTasks));
        return { success: true, data: { tasks: { [taskId]: storedTasks[taskId] } } };
      }
      return { success: false, error: "Task not found." };
    }
    return { success: false, error: "Endpoint not found." };
  },

  // Handle DELETE requests
  delete: (endpoint) => {
    const taskIdMatch = endpoint.match(/^\/api\/conditionalTasks\/(\d+)$/);
    if (taskIdMatch) {
      const taskId = taskIdMatch[1];
      let storedTasks = JSON.parse(localStorage.getItem("conditionalTasks")) || {};
      if (storedTasks[taskId]) {
        delete storedTasks[taskId];
        localStorage.setItem("conditionalTasks", JSON.stringify(storedTasks));
        return { success: true };
      }
      return { success: false, error: "Task not found." };
    }
    return { success: false, error: "Endpoint not found." };
  },
};

export default DummyAPI;
