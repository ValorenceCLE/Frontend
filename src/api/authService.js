// src/api/authService.js
import axios from '@/axios';
import { jwtDecode } from "jwt-decode";

/**
 * Logs in the user and stores the token in localStorage.
 * @param {string} username 
 * @param {string} password 
 * @returns {Promise<Object>} The token response.
 */
export async function login(username, password) {
  try {
    const response = await axios.post(
      '/auth/login',
      new URLSearchParams({
        username,
        password,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    const token = response.data.access_token;
    localStorage.setItem("token", token);
    const decoded = jwtDecode(token);
    localStorage.setItem("token_exp", decoded.exp);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || error.message);
  }
}

/**
 * Logs out the current user.
 * @returns {Promise<Object>} The logout response.
 */
export async function logout() {
  try {
    const response = await axios.post('/auth/logout');
    // Clear local storage tokens
    localStorage.removeItem("token");
    localStorage.removeItem("token_exp");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || error.message);
  }
}
