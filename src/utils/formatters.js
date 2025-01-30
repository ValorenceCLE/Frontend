export function formatTrigger(task, relays = {}, fieldOptionsMapping = {}) {
    console.log("Received task in formatTrigger:", task);
    console.log("Available relays:", relays);
    
    const { source, field, operator, value } = task;
  
    if (!source || !field || !operator || value === undefined) {
      console.warn("Task is missing required trigger properties:", task);
      return "Invalid Trigger";
    }
  
    let sourceName = source; // Default to raw source
  
    // 🔹 Check if `source` is inside `relays`
    if (relays[source]) {
      console.log(`Relay found for source ${source}:`, relays[source]);
      sourceName = relays[source].name; // Use the relay name
    } else {
      console.warn(`Relay not found for source ${source}.`);
    }
  
    return `${sourceName} ${field} ${operator} ${value}`;
  }
  
/**
 * Formats an array of actions into human-readable text.
 * @param {Array} actions - The actions array from the task.
 * @param {Object} relays - An object mapping relay IDs to relay metadata (e.g., names).
 * @returns {Array} - An array of formatted action strings.
 */
export function formatActions(actions = [], relays = {}) {
  if (!actions.length) return ["No actions defined"];

  return actions.map(action => displayAction(action, relays));
}

/**
 * Formats a single action into a readable label.
 * @param {Object} action - The action object.
 * @param {Object} relays - An object mapping relay IDs to relay metadata.
 * @returns {string} - Formatted action string.
 */
export function displayAction(action, relays) {
  if (!action || typeof action.type !== "string") {
    return "Unknown Action";
  }

  switch (action.type) {
    case "email":
      return `Email`;
    case "io":
      const relay = relays[action.target];
      const relayName = relay ? relay.name : action.target;
      return `${relayName}: ${action.state.toUpperCase()}`;
    case "reboot":
      return "Reboot";
    case "log":
      return "Log";
    case "awsLog":
      return "AWS Log";
    default:
      return action.type.charAt(0).toUpperCase() + action.type.slice(1);
  }
}
