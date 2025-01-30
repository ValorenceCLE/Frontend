import { getMemoryConfig, updateMemoryConfig, logMemoryConfig, mockResponse } from "./api.js";

// Update a specific field in general settings
export async function putGeneralSetting(key, value) {
  const memoryConfig = getMemoryConfig();
  const updatedGeneral = { ...memoryConfig.general, [key]: value };

  updateMemoryConfig({ ...memoryConfig, general: updatedGeneral });
  logMemoryConfig();
  return mockResponse(updatedGeneral);
}

// Update a specific relay
export async function putRelay(id, updatedFields) {
  const memoryConfig = getMemoryConfig();
  const relay = memoryConfig.relays[id];

  if (!relay) {
    return mockResponse({ error: "Relay not found" }, 404);
  }

  const updatedRelays = { ...memoryConfig.relays, [id]: { ...relay, ...updatedFields } };
  updateMemoryConfig({ ...memoryConfig, relays: updatedRelays });
  logMemoryConfig();
  return mockResponse(updatedRelays[id]);
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

// Update an action in a task
export async function putAction(taskId, actionIndex, updatedAction) {
  const memoryConfig = getMemoryConfig();
  const task = memoryConfig.tasks[taskId];

  if (!task) {
    return mockResponse({ error: "Task not found" }, 404);
  }

  if (!task.actions[actionIndex]) {
    return mockResponse({ error: "Action not found" }, 404);
  }

  task.actions[actionIndex] = updatedAction;

  const updatedTasks = { ...memoryConfig.tasks, [taskId]: task };
  updateMemoryConfig({ ...memoryConfig, tasks: updatedTasks });
  logMemoryConfig();
  return mockResponse(task.actions);
}
