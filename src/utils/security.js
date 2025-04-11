// src/utils/security.js
/**
 * Security utility functions for XSS protection and input sanitation
 */
export const security = {
    /**
     * Sanitize HTML content to prevent XSS attacks
     * @param {string} html - The HTML string to sanitize
     * @returns {string} Sanitized HTML
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
     * Create a safe display directive for dynamic content
     * To be used as: v-html="security.safeHTML(userContent)"
     */
    safeHTML(content) {
      return this.sanitizeHTML(content);
    },
    
    /**
     * Sanitize a URL to prevent javascript: protocol and similar exploits
     * @param {string} url - URL to sanitize
     * @returns {string} Sanitized URL or empty string if dangerous
     */
    sanitizeURL(url) {
      if (!url) return '';
      
      // Strip javascript: and other potentially dangerous protocols
      const sanitized = String(url).replace(/^(javascript|data|vbscript|file):/i, '');
      
      // Check if the URL starts with http/https or is relative
      if (/^(https?:\/\/|\/|\.\/|\.\.\/)/i.test(sanitized)) {
        return sanitized;
      }
      
      // If not a safe URL format, return empty
      return '';
    },
    
    /**
     * Render content safely with line breaks converted to <br> tags
     * @param {string} text - Plain text to render with line breaks
     * @returns {string} HTML with <br> tags and sanitized content
     */
    renderWithLineBreaks(text) {
      if (!text) return '';
      const sanitized = this.sanitizeHTML(text);
      return sanitized.replace(/\n/g, '<br>');
    }
};