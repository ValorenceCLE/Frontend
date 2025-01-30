import { getMemoryConfig, updateMemoryConfig, logMemoryConfig, mockResponse } from "./api.js";

// Delete a task
export async function deleteTask(id) {
  const memoryConfig = getMemoryConfig();
  const tasks = memoryConfig.tasks;

  if (!tasks[id]) {
    return mockResponse({ error: "Task not found" }, 404);
  }

  delete tasks[id];
  updateMemoryConfig({ ...memoryConfig, tasks });
  logMemoryConfig();
  return mockResponse(tasks);
}

// Delete an email
export async function deleteEmail(index) {
  const memoryConfig = getMemoryConfig();
  const emails = memoryConfig.email.emails;

  if (index < 0 || index >= emails.length) {
    return mockResponse({ error: "Invalid email index" }, 400);
  }

  emails.splice(index, 1);
  updateMemoryConfig({ ...memoryConfig, email: { ...memoryConfig.email, emails } });
  logMemoryConfig();
  return mockResponse(emails);
}
