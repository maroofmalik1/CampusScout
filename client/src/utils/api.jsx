import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';

console.log('🔗 API connecting to:', BASE_URL); // shows in browser console

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error('❌ API Error:', err.response?.status, err.config?.url, err.message);
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
