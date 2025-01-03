import axios from "axios";
import API_BASE_URL from "../config";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add Authorization Token (if applicable)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // Get token from local storage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;