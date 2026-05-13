import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5001",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (error) => Promise.reject(error));

API.interceptors.response.use((res) => res, (err) => {
  // optional global error handling
  if (err.response && err.response.status === 401) {
    // token expired/invalid: clear and redirect
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    // optionally location.href = "/login";
  }
  return Promise.reject(err);
});

export default API;
