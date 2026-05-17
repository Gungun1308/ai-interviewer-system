import axios from "axios";
import toast from 'react-hot-toast';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
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
    // redirect to login on auth failure
    try { window.location.href = '/login'; } catch(e){}
  }
  const msg = err.response?.data?.msg || err.response?.data?.error || err.message || 'API Error';
  try { toast.error(msg); } catch (e) {}
  return Promise.reject(err);
});

export default API;
