// src/axios.js - Production-ready version with enhanced security

import axios from 'axios';
import { errorService } from '@/services/errorService';

// Determine base URL based on current hostname
const baseURL = '/api'; // In production, always use relative path

// Track if we're already refreshing to prevent multiple refreshes
let isRefreshing = false;
// Store pending requests that should be retried after token refresh
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Helper function to securely store token with expiry
const securelyStoreToken = (token, expiryTime) => {
  if (!token || !expiryTime) return;
  
  try {
    // Store token with expiry info
    const tokenData = {
      value: token,
      expiry: expiryTime,
      created: Date.now()
    };
    localStorage.setItem("token", JSON.stringify(tokenData));
  } catch (error) {
    console.error('Error storing token:', error);
  }
};

// Helper function to get token, checking expiry
const getStoredToken = () => {
  try {
    // Try to get the token data from storage
    const tokenStr = localStorage.getItem("token");
    
    // Handle legacy format (direct token string)
    if (tokenStr && tokenStr.startsWith('ey')) {
      return tokenStr;
    }
    
    // Parse the JSON token data
    const tokenData = JSON.parse(tokenStr);
    if (!tokenData) return null;
    
    // Check if token is expired or about to expire (within 5 minutes)
    const now = Date.now();
    const expiryTime = tokenData.expiry * 1000; // Convert to milliseconds
    const fiveMinutes = 5 * 60 * 1000;
    
    if (expiryTime - now < fiveMinutes) {
      // Token is expired or about to expire
      return null;
    }
    
    return tokenData.value;
  } catch (error) {
    // If there's an error parsing (e.g., not JSON), try the raw value
    const rawToken = localStorage.getItem("token");
    if (rawToken && typeof rawToken === 'string') {
      return rawToken;
    }
    
    console.error('Error retrieving token:', error);
    return null;
  }
};

const instance = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 30000, // 30 second timeout
});

instance.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If we can't reach the server at all, handle it gracefully
    if (!error.response) {
      // Network error or server not reachable
      errorService.addError(error);
      
      // If this is a POST/PUT/DELETE operation, save for later retry
      if (['post', 'put', 'delete'].includes(originalRequest.method.toLowerCase())) {
        errorService.addPendingOperation(() => instance(originalRequest));
      }
      
      return Promise.reject(
        new Error('Network error: Unable to reach the server. Please check your connection.')
      );
    }
    
    // If error is 401 and we haven't tried to refresh the token yet
    if (error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If we're already refreshing, add this request to queue
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return instance(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }
      
      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        // Try to refresh the token
        const response = await instance.post('/auth/refresh');
        const newToken = response.data.access_token;
        const decodedToken = response.data.decoded || {}; 
        const exp = decodedToken.exp || (Math.floor(Date.now() / 1000) + 3600); // Default 1hr expiry
        
        if (newToken) {
          // Store token securely with expiry
          securelyStoreToken(newToken, exp);
          
          // Update auth header for the original request
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          
          // Process any requests that came in while refreshing
          processQueue(null, newToken);
          
          return instance(originalRequest);
        } else {
          // No token in response - this is unexpected
          processQueue(error, null);
          localStorage.removeItem("token");
          localStorage.removeItem("token_exp");
          window.location.href = "/";
          return Promise.reject(new Error('Authentication failed'));
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem("token");
        localStorage.removeItem("token_exp");
        window.location.href = "/";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    // For 403 errors (Forbidden)
    if (error.response.status === 403) {
      errorService.addError('Access denied: You do not have permission to perform this action');
      // User is authenticated but doesn't have permission
      return Promise.reject(
        new Error('Access denied: You do not have permission to perform this action')
      );
    }
    
    // Handle 500 errors more gracefully
    if (error.response.status >= 500) {
      errorService.addError('Server error: The server encountered an unexpected condition');
      return Promise.reject(
        new Error('Server error: The server encountered an unexpected condition')
      );
    }
    
    errorService.addError(error);
    // For all other errors, just reject with the error
    return Promise.reject(error);
  }
);

// Export secure token functions for use in auth service
export { securelyStoreToken, getStoredToken };
export default instance;