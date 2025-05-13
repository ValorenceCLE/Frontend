// src/utils/inputUtils.js - CONSOLIDATED from validation.js and security.js
/**
 * Utilities for input validation and security
 */
export const validator = {
  // String validation with XSS prevention
  string(value, { min = 0, max = 255, required = false } = {}) {
    if (!value && required) {
      return { valid: false, message: 'This field is required' };
    }
    
    if (!value && !required) {
      return { valid: true, value: '' };
    }
    
    // Sanitize input
    const sanitized = this.sanitizeHTML(String(value).trim());
    
    if (sanitized.length < min) {
      return { valid: false, message: `Must be at least ${min} characters` };
    }
    
    if (sanitized.length > max) {
      return { valid: false, message: `Must be no more than ${max} characters` };
    }
    
    return { valid: true, value: sanitized };
  },
  
  // Number validation
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
  
  // Email validation
  email(value, { required = false } = {}) {
    if (!value && !required) {
      return { valid: true, value: '' };
    }
    
    if (!value && required) {
      return { valid: false, message: 'Email address is required' };
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return { valid: false, message: 'Must be a valid email address' };
    }
    
    return { valid: true, value: value.trim() };
  },
  
  // IP address validation
  ipAddress(value, { required = false } = {}) {
    if (!value && !required) {
      return { valid: true, value: '' };
    }
    
    if (!value && required) {
      return { valid: false, message: 'IP address is required' };
    }
    
    const ipv4Regex = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!ipv4Regex.test(value)) {
      return { valid: false, message: 'Must be a valid IPv4 address' };
    }
    
    return { valid: true, value: value.trim() };
  }
};

/**
 * Security utilities for XSS prevention
 */
export const security = {
  /**
   * Sanitize HTML to prevent XSS attacks
   * @param {string} html - Input string to sanitize
   * @returns {string} Sanitized string
   */
  sanitizeHTML(html) {
    if (!html) return '';
    
    return String(html)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/\//g, '&#x2F;');
  },
  
  /**
   * Create safe HTML for v-html directive
   * @param {string} content - Content to make safe
   * @returns {string} Safe HTML
   */
  safeHTML(content) {
    return this.sanitizeHTML(content);
  },
  
  /**
   * Sanitize a URL to prevent javascript: protocol exploits
   * @param {string} url - URL to sanitize
   * @returns {string} Safe URL
   */
  sanitizeURL(url) {
    if (!url) return '';
    
    // Remove dangerous protocols
    const sanitized = String(url).replace(/^(javascript|data|vbscript|file):/i, '');
    
    // Check if URL is safe
    if (/^(https?:\/\/|\/|\.\/|\.\.\/)/i.test(sanitized)) {
      return sanitized;
    }
    
    return '';
  },
  
  /**
   * Render content with line breaks
   * @param {string} text - Text to render
   * @returns {string} HTML with breaks
   */
  renderWithLineBreaks(text) {
    if (!text) return '';
    const sanitized = this.sanitizeHTML(text);
    return sanitized.replace(/\n/g, '<br>');
  }
};