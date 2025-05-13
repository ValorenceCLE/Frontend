// src/utils/dataUtils.js
/**
 * Data formatting and transformation utilities
 */
export default {
  /**
   * Format a date for display
   * @param {Date|string} date - Date to format
   * @param {Object} options - Format options
   * @returns {string} Formatted date string
   */
  formatDate(date, { includeTime = false, includeSeconds = false } = {}) {
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
      
      if (includeSeconds) {
        const seconds = String(d.getSeconds()).padStart(2, '0');
        result += `:${seconds}`;
      }
    }
    
    return result;
  },
  
  /**
   * Format bytes to human readable size
   * @param {number} bytes - Bytes to format
   * @param {number} decimals - Decimal places
   * @returns {string} Formatted size
   */
  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
  },
  
  /**
   * Create a download for a blob
   * @param {Blob} blob - The blob to download
   * @param {string} filename - The download filename
   */
  downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  }
};