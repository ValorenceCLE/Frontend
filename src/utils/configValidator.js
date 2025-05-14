// src/utils/configValidator.js
/**
 * Config section validators
 */
const validators = {
  // Network configuration validation
  network: (data) => {
    const errors = {};
    
    // Validate required fields when DHCP is disabled
    if (!data.dhcp) {
      if (!data.ip_address) {
        errors.ip_address = "IP address is required";
      } else if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(data.ip_address)) {
        errors.ip_address = "Invalid IP address format";
      }
      
      if (!data.subnet_mask) {
        errors.subnet_mask = "Subnet mask is required";
      } else if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(data.subnet_mask)) {
        errors.subnet_mask = "Invalid subnet mask format";
      }
      
      if (!data.gateway) {
        errors.gateway = "Gateway is required";
      } else if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(data.gateway)) {
        errors.gateway = "Invalid gateway format";
      }
    }
    
    return {
      valid: Object.keys(errors).length === 0,
      errors
    };
  },
  
  // Date/time configuration validation
  date_time: (data) => {
    const errors = {};
    
    if (!data.timezone) {
      errors.timezone = "Time zone is required";
    }
    
    return {
      valid: Object.keys(errors).length === 0,
      errors
    };
  },
  
  // General configuration validation
  general: (data) => {
    const errors = {};
    
    if (!data.system_name) {
      errors.system_name = "System name is required";
    }
    
    return {
      valid: Object.keys(errors).length === 0,
      errors
    };
  },
  
  // Email configuration validation
  email: (data) => {
    const errors = {};
    
    if (data.smtp_server && !data.smtp_port) {
      errors.smtp_port = "SMTP port is required when server is specified";
    }
    
    if (data.return_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.return_email)) {
      errors.return_email = "Invalid email format";
    }
    
    if (data.emails) {
      data.emails.forEach((email, index) => {
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          errors[`emails.${index}`] = "Invalid email format";
        }
      });
    }
    
    return {
      valid: Object.keys(errors).length === 0,
      errors
    };
  },
};

/**
 * Validate a configuration section
 * @param {string} section - Section name
 * @param {Object} data - Configuration data to validate
 * @returns {Object} Validation result with errors
 */
export function validateSection(section, data) {
  // If no validator exists for this section, assume valid
  if (!validators[section]) {
    return { valid: true, errors: {} };
  }
  
  return validators[section](data);
}

/**
 * Validate the entire configuration
 * @param {Object} config - Full configuration
 * @returns {Object} Validation result with section-specific errors
 */
export function validateConfig(config) {
  const result = {
    valid: true,
    sectionErrors: {}
  };
  
  // Validate each section that has a validator
  Object.keys(validators).forEach(section => {
    if (config[section]) {
      const sectionResult = validateSection(section, config[section]);
      
      if (!sectionResult.valid) {
        result.valid = false;
        result.sectionErrors[section] = sectionResult.errors;
      }
    }
  });
  
  return result;
}