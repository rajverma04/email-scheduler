import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle Errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if error is due to 401 Unauthorized
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      toast.error('Session expired. Please log in again.');
    } else if (!error.response?.data?.error && !error.response?.data?.message && !error.response) {
      toast.error('An unexpected network error occurred. Please try again.');
    }
    return Promise.reject(error);
  }
);

export default api;
