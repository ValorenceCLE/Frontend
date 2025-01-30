import { getMemoryConfig, updateMemoryConfig, logMemoryConfig, mockResponse } from "./api.js";

let maxTaskId = 0;


// Update all configuration settings
export async function postConfiguration(newConfig){
    updateMemoryConfig(newConfig);
    logMemoryConfig();
    return mockResponse(getMemoryConfig());
}

// Update general settings
export async function postGeneralSettings(newGeneral){
    const memoryConfig = getMemoryConfig();
    updateMemoryConfig({ ...memoryConfig, general: newGeneral });
    logMemoryConfig();
    return mockResponse(getMemoryConfig().general);
}

// Update network settings
export async function postNetworkSettings(newNetwork){
    const memoryConfig = getMemoryConfig();
    updateMemoryConfig({ ...memoryConfig, network: newNetwork });
    logMemoryConfig();
    return mockResponse(getMemoryConfig().network);
}

// Update date/time settings
export async function postDateTimeSettings(newDateTime){
    const memoryConfig = getMemoryConfig();
    updateMemoryConfig({ ...memoryConfig, date_time: newDateTime });
    logMemoryConfig();
    return mockResponse(getMemoryConfig().date_time);
}

// Update email settings
export async function postEmailSettings(newEmail){
    const memoryConfig = getMemoryConfig();
    updateMemoryConfig({ ...memoryConfig, email: newEmail });
    logMemoryConfig();
    return mockResponse(getMemoryConfig().email);
}

// Update all relays 
export async function postRelays(newRelays){
    const memoryConfig = getMemoryConfig();
    updateMemoryConfig({ ...memoryConfig, relays: newRelays });
    logMemoryConfig();
    return mockResponse(getMemoryConfig().relays);
}

// Update a specific relay by ID
export async function postRelay(id, newRelay){
    const memoryConfig = getMemoryConfig();
    const relays = { ...memoryConfig.relays, [id]: newRelay };
    updateMemoryConfig({ ...memoryConfig, relays });
    logMemoryConfig();
    return mockResponse(getMemoryConfig().relays[id]);
}

// Update all tasks
export async function postTasks(newTasks){
    const memoryConfig = getMemoryConfig();
    updateMemoryConfig({ ...memoryConfig, tasks: newTasks });
    logMemoryConfig();
    return mockResponse(getMemoryConfig().tasks);
}

// Update a specific task by ID
export async function postTask(newTask) {
    const memoryConfig = getMemoryConfig();
    const tasks = memoryConfig.tasks;
    const newId = ++maxTaskId;
  
    const updatedTasks = { ...memoryConfig.tasks, [newId]: { id: newId, ...newTask } };
    maxTaskId = Math.max(maxTaskId, ...Object.keys(updatedTasks).map(Number));
    updateMemoryConfig({ ...memoryConfig, tasks: updatedTasks });
    logMemoryConfig();
    return mockResponse(updatedTasks);
}

// Add an email to the email list
export async function postEmail(newEmail) {
    const memoryConfig = getMemoryConfig();
    const updatedEmails = [...memoryConfig.email.emails, newEmail];
  
    updateMemoryConfig({ ...memoryConfig, email: { ...memoryConfig.email, emails: updatedEmails } });
    logMemoryConfig();
    return mockResponse(updatedEmails);
}

// Update a specific task
export async function putTask(id, updatedTask) {
    const memoryConfig = getMemoryConfig();
    const task = memoryConfig.tasks[id];
  
    if (!task) {
      return mockResponse({ error: "Task not found" }, 404);
    }
  
    const updatedTasks = { ...memoryConfig.tasks, [id]: { ...task, ...updatedTask } };
    updateMemoryConfig({ ...memoryConfig, tasks: updatedTasks });
    logMemoryConfig();
    return mockResponse(updatedTasks[id]);
  }
  