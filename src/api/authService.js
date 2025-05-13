// src/api/authService.js - REFACTORED
import apiClient from './apiClient';
import { jwtDecode } from "jwt-decode";

/**
 * Logs in the user and stores the token in localStorage.
 * @param {string} username 
 * @param {string} password 
 * @returns {Promise<Object>} The token response.
 */
export async function login(username, password) {
  const formData = new URLSearchParams({ username, password });
  
  const response = await apiClient.post(
    '/auth/login',
    formData,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );
  
  const token = response.access_token;
  localStorage.setItem("token", token);
  const decoded = jwtDecode(token);
  localStorage.setItem("token_exp", decoded.exp);
  
  return response;
}

/**
 * Logs out the current user.
 * @returns {Promise<Object>} The logout response.
 */
export async function logout() {
  const response = await apiClient.post('/auth/logout');
  
  // Clear local storage tokens
  localStorage.removeItem("token");
  localStorage.removeItem("token_exp");
  
  return response;
}