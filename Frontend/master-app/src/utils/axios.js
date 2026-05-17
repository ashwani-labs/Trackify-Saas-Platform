import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const MASTER_TOKEN_KEY = 'trackify_master_token';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(MASTER_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        const url = error.config?.url || '';
        const isLogin = url.includes('/auth/login');
        if (!isLogin) {
          localStorage.removeItem(MASTER_TOKEN_KEY);
          if (!window.location.pathname.startsWith('/login')) {
            window.location.href = '/login';
          }
        }
      } else if (error.response.status === 403) {
        console.error('Forbidden:', error.config?.url);
      } else if (error.response.status >= 500) {
        console.error('Server error:', error.config?.url);
      }
    } else {
      console.error('Network error — check API connection');
    }
    return Promise.reject(error);
  }
);

export default api;
