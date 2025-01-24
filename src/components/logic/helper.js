// helper.js

/**
 * Formats the trigger object into a readable string.
 * @param {Object} trigger - The trigger object.
 * @param {Object} relays - The relays data object.
 * @param {Function} isRelayAction - Function to determine if source is a relay.
 * @returns {String} - Formatted trigger string.
 */
export function formatTrigger(trigger, relays, isRelayAction) {
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
    // Capitalize first letter
    sourceDisplay =
      trigger.source.charAt(0).toUpperCase() + trigger.source.slice(1);
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

  if (isRelayAction(action.type)) {
    const relay = relays[action.type];
    if (relay && relay.name && action.state) {
      return `${relay.name} Set To: ${action.state.toUpperCase()}`;
    }
    if (action.state) {
      return `${action.type} Set To: ${action.state.toUpperCase()}`;
    }
    return `${action.type} Set To: Unknown`;
  } else if (action.type === "sendEmail") {
    return `Email`;
  } else {
    // Ensure action.type has at least one character
    if (action.type.length === 0) {
      return "Invalid Action Type";
    }
    return (
      action.type.charAt(0).toUpperCase() + action.type.slice(1)
    );
  }
}
