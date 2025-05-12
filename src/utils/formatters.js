// formatters.js
export function formatTrigger(task, relays = {}) {
  console.log("Received task in formatTrigger:", task);
  console.log("Available relays:", relays);

  const { source, field, operator, value } = task;
  if (!source || !field || !operator || value === undefined) {
    console.warn("Task is missing required trigger properties:", task);
    return "Invalid Trigger";
  }

  let sourceName = source; // fallback name
  
  // Handle special sources
  if (source === 'environmental') {
    sourceName = 'Environment';
  } else if (source === 'main') {
    sourceName = 'Main Power';
  } else {
    // Handle relay sources
    // We look for a numeric key whose .id matches "relay_1", "relay_2", etc.
    const foundKey = Object.keys(relays).find((k) => relays[k].id === source);
    if (foundKey) {
      console.log(`Relay found for source ${source}:`, relays[foundKey]);
      sourceName = relays[foundKey].name;
    } else {
      console.warn(`Relay not found for source ${source}.`);
    }
  }

  return `${sourceName} ${field} ${operator} ${value}`;
}

/**
 * Formats an array of actions into human-readable text.
 * @param {Array} actions - The actions array from the task.
 * @param {Object} relays - numeric store keys -> relay objects
 * @returns {Array} - An array of formatted action strings.
 */
export function formatActions(actions = [], relays = {}) {
  if (!actions.length) return ["No actions defined"];
  return actions.map((action) => displayAction(action, relays));
}

function displayAction(action, relays) {
  if (!action || typeof action.type !== "string") {
    return "Unknown Action";
  }

  switch (action.type) {
    case "io":
      // action.target might be "relay_2", etc.
      const foundKey = Object.keys(relays).find(
        (k) => relays[k].id === action.target
      );
      if (!foundKey) {
        return `Unknown Relay: ${action.target}`;
      }
      const rName = relays[foundKey].name;
      return `${rName}: ${action.state.toUpperCase()}`;
    case "reboot":
      return "Reboot";
    case "log":
      return "Log";
    default:
      return action.type.charAt(0).toUpperCase() + action.type.slice(1);
  }
}