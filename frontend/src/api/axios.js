import axios from 'axios';

const BASE_URL =
  import.meta.env?.VITE_API_URL ||
  process.env?.REACT_APP_API_URL ||
  'http://localhost:5001/api';

const api = axios.create({
  baseURL: BASE_URL.endsWith('/api') ? BASE_URL : `${BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically attach the JWT token to every request, if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;