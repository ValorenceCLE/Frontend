// src/utils/configUtils.js
import config from '@/config';

/**
 * Configuration utility functions
 * These functions help safely access configuration values with fallbacks
 */
export const configUtils = {
  /**
   * Get a value from the configuration with a default fallback
   * Supports nested paths using dot notation (e.g., 'api.timeout')
   * 
   * @param {string} path - Path to the configuration value
   * @param {any} defaultValue - Fallback value if not found
   * @returns {any} The configuration value or default
   */
  get(path, defaultValue = undefined) {
    if (!path) return defaultValue;
    
    // Split the path by dots (e.g., 'api.timeout' -> ['api', 'timeout'])
    const keys = path.split('.');
    let result = config;
    
    // Traverse the path
    for (const key of keys) {
      if (result && typeof result === 'object' && key in result) {
        result = result[key];
      } else {
        return defaultValue;
      }
    }
    
    return result;
  },
  
  /**
   * Get field mappings for a specific source
   * 
   * @param {string} source - Source name (e.g., 'environmental', 'main')
   * @returns {string[]} Array of available fields for the source
   */
  getSourceFields(source) {
    if (!source) return [];
    
    // Try to get source fields from config
    const fields = this.get(`fieldMappings.sources.${source}`, []);
    
    // Special case for relay sources
    if (!fields.length && source.startsWith('relay_')) {
      return this.get('fieldMappings.sources.relay', []);
    }
    
    return fields;
  },
  
  /**
   * Map a display field name to its API field name
   * 
   * @param {string} displayField - Display field name (e.g., 'Volts')
   * @returns {string} API field name (e.g., 'voltage')
   */
  mapFieldName(displayField) {
    return this.get(`fieldMappings.display.${displayField}`, displayField.toLowerCase());
  },
  
  /**
   * Get chart color for a field
   * 
   * @param {string} field - Field name
   * @param {string} defaultColor - Default color if not found
   * @returns {string} Color code
   */
  getChartColor(field, defaultColor = '#000000') {
    return this.get(`charts.colors.${field}`, defaultColor);
  },
  
  /**
   * Format a date according to configuration
   * 
   * @param {Date|string} date - Date to format
   * @param {boolean} includeTime - Whether to include time
   * @returns {string} Formatted date string
   */
  formatDate(date, includeTime = false) {
    if (!date) return '';
    
    const d = date instanceof Date ? date : new Date(date);
    
    // Check if date is valid
    if (isNaN(d.getTime())) return '';
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    
    let result = `${year}-${month}-${day}`;
    
    if (includeTime) {
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      
      result += ` ${hours}:${minutes}`;
    }
    
    return result;
  },
  
  /**
   * Get timezone offset from name
   * 
   * @param {string} timezone - Timezone name
   * @returns {number} UTC offset in hours
   */
  getTimezoneOffset(timezone) {
    return this.get(`timeZones.${timezone}`, 0);
  }
};

export default configUtils;