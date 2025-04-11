// src/axios.js - Production-ready version

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

const instance = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 30000, // 30 second timeout
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
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
        
        if (newToken) {
          localStorage.setItem("token", newToken);
          
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
      // User is authenticated but doesn't have permission
      return Promise.reject(
        new Error('Access denied: You do not have permission to perform this action')
      );
    }
    
    // Handle 500 errors more gracefully
    if (error.response.status >= 500) {
      return Promise.reject(
        new Error('Server error: The server encountered an unexpected condition')
      );
    }
    errorService.addError(error);
    // For all other errors, just reject with the error
    return Promise.reject(error);
  }
);

export default instance;