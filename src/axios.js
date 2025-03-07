import axios from 'axios';

const baseURL = window.location.hostname === 'localhost'
  ? 'http://localhost:8000/api'
  : '/api';

const instance = axios.create({
  baseURL,
  withCredentials: true,
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized access - Redirecting to login.");
      localStorage.removeItem("token");
      localStorage.removeItem("token_exp");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default instance;
