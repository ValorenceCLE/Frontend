import { getMemoryConfig, logMemoryConfig, mockResponse } from "./api.js";

// Fetch the entire configuration
export async function getConfiguration() {
    const config = getMemoryConfig();
    return mockResponse(config);
}

// Fetch general settings
export async function getGeneralSettings() {
    const general = getMemoryConfig().general;
    return mockResponse(general);
}

// Fetch network settings
export async function getNetworkSettings() {
    const network = getMemoryConfig().network;
    return mockResponse(network);
}

// Fetch date/time settings
export async function getDateTimeSettings() {
    const dateTime = getMemoryConfig().date_time;
    return mockResponse(dateTime);
}

// Fetch email settings
export async function getEmailSettings() {
    const email = getMemoryConfig().email;
    return mockResponse(email);
}

// Fetch all relays
export async function getRelays() {
    const relays = getMemoryConfig().relays;
    return mockResponse(relays);
}

// Fetch all enabled relays
export async function getEnabledRelays() {
    const relays = getMemoryConfig().relays;
    const enabledRelays = Object.values(relays).filter((relay) => relay.enabled);
    return mockResponse(enabledRelays);
}

// Fetch a specific relay by ID
export async function getRelay(id) {
    const relay = getMemoryConfig().relays[id];
    return relay ? mockResponse(relay) : mockResponse({ error: "Relay not found" }, 404);
}

// Fetch all tasks
export async function getTasks() {
    const tasks = getMemoryConfig().tasks;
    return mockResponse(tasks);
}

// Fetch a specific task by ID
export async function getTask(id) {
    const task = getMemoryConfig().tasks[id];
    return task ? mockResponse(task) : mockResponse({ error: "Task not found" }, 404);
}
