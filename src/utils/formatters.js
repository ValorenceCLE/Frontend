// formatters.js
export function formatTrigger(task, relays = {}) {
  const { source, field, operator, value } = task;
  if (!source || !field || !operator || value === undefined) {
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
      sourceName = relays[foundKey].name;
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
      return `${rName}: ${capitalizeFirst(action.state)}`;
    case "reboot":
      return "Reboot";
    case "log":
      return "Log";
    default:
      return action.type.charAt(0).toUpperCase() + action.type.slice(1);
  }
}

function capitalizeFirst(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}