import axios from 'axios';

const envUrl = import.meta.env.VITE_API_URL;

const BASE_URL = envUrl 
  ? (envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`)
  : 'http://localhost:5001/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;