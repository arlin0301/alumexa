import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  // Use the main session token, or the temporary registration-upload token if set
  const token = localStorage.getItem('alumexa_token') || localStorage.getItem('alumexa_reg_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
