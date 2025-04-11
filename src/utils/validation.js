// src/utils/validation.js
export const validateInput = {
    // Validate strings (prevent XSS)
    string(value, { min = 0, max = 255, required = false } = {}) {
      if (!value && required) {
        return { valid: false, message: 'This field is required' };
      }
      
      if (!value && !required) {
        return { valid: true, value: '' };
      }
      
      // Convert to string and sanitize
      const sanitized = String(value)
        .trim()
        // Replace potentially dangerous characters
        .replace(/[<>"'&]/g, (char) => {
          switch (char) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '"': return '&quot;';
            case "'": return '&#39;';
            case '&': return '&amp;';
            default: return char;
          }
        });
      
      if (sanitized.length < min) {
        return { valid: false, message: `Must be at least ${min} characters` };
      }
      
      if (sanitized.length > max) {
        return { valid: false, message: `Must be no more than ${max} characters` };
      }
      
      return { valid: true, value: sanitized };
    },
    
    // Validate numeric values
    number(value, { min, max, required = false } = {}) {
      if (value === '' && !required) {
        return { valid: true, value: null };
      }
      
      const num = Number(value);
      
      if (isNaN(num)) {
        return { valid: false, message: 'Must be a valid number' };
      }
      
      if (min !== undefined && num < min) {
        return { valid: false, message: `Must be at least ${min}` };
      }
      
      if (max !== undefined && num > max) {
        return { valid: false, message: `Must be no more than ${max}` };
      }
      
      return { valid: true, value: num };
    },
    
    // Validate email addresses
    email(value, { required = false } = {}) {
      if (!value && !required) {
        return { valid: true, value: '' };
      }
      
      if (!value && required) {
        return { valid: false, message: 'Email address is required' };
      }
      
      // Basic email validation regex
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return { valid: false, message: 'Must be a valid email address' };
      }
      
      return { valid: true, value: value.trim() };
    },
    
    // Validate IP addresses
    ipAddress(value, { required = false } = {}) {
      if (!value && !required) {
        return { valid: true, value: '' };
      }
      
      if (!value && required) {
        return { valid: false, message: 'IP address is required' };
      }
      
      // IPv4 validation regex
      const ipv4Regex = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
      if (!ipv4Regex.test(value)) {
        return { valid: false, message: 'Must be a valid IPv4 address' };
      }
      
      return { valid: true, value: value.trim() };
    }
};