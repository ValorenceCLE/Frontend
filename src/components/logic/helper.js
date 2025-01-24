// helper.js

/**
 * Formats the trigger object into a readable string.
 * @param {Object} task - The task object containing trigger details.
 * @param {Object} relays - The relays data object.
 * @param {Function} isRelayAction - Function to determine if source is a relay.
 * @returns {String} - Formatted trigger string.
 */
export function formatTrigger(task, relays, isRelayAction) {
  const trigger = {
    source: task.trigger.source,
    field: task.trigger.field,
    operator: task.trigger.operator,
    value: task.trigger.value,
  };

  if (
    !trigger ||
    !trigger.source ||
    !trigger.field ||
    !trigger.operator ||
    trigger.value === ""
  ) {
    return "N/A"; // Display 'N/A' if any part is missing
  }
  let sourceDisplay = "";
  if (isRelayAction(trigger.source)) {
    // Display relay name instead of ID
    const relay = relays[trigger.source];
    sourceDisplay = relay ? relay.name : trigger.source;
  } else {
    // Capitalize first letter if source is a general category
    sourceDisplay =
      typeof trigger.source === "string" && trigger.source.length > 0
        ? trigger.source.charAt(0).toUpperCase() + trigger.source.slice(1)
        : trigger.source;
  }
  return `${sourceDisplay} - ${trigger.field} ${trigger.operator} ${trigger.value}`;
}

/**
 * Formats the action object into a readable string.
 * @param {Object} action - The action object.
 * @param {Object} relays - The relays data object.
 * @param {Function} isRelayAction - Function to determine if action is a relay action.
 * @returns {String} - Formatted action string.
 */
export function displayAction(action, relays, isRelayAction) {
  if (!action || typeof action.type !== "string") {
    return "Unknown Action";
  }

  switch(action.type) {
    case "email":
      return `Email`;
    case "io":
      const relay = relays[action.target];
      const relayName = relay ? relay.name : action.target;
      return `${relayName} Set To: ${action.state.toUpperCase()}`;
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
