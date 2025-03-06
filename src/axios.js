import axios from 'axios';

// Determine the base URL depending on where the frontend is running.
const baseURL = window.location.hostname === 'localhost'
  ? 'http://localhost:8000/api'  // Development: full URL to backend API
  : '/api';                      // Production (or Docker with Nginx): use relative path

const instance = axios.create({
  baseURL,
  withCredentials: true,
});

// Global request interceptor to attach the JWT token if available.
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global response interceptor to handle errors, e.g., unauthorized responses.
instance.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      console.warn("🔒 Unauthorized access - Redirecting to login.");
      localStorage.removeItem("token");
      localStorage.removeItem("token_exp");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default instance;
