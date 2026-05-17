import axios from 'axios';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../config/api';
import { clearTenantSession } from './session';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('tenantToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const isPublicAuthRequest = (url = '') =>
  /\/auth\/(login|forgot-password|reset-password)/.test(url) ||
  url.includes('/tenants/users/register');

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const url = error.config?.url || '';

      if (error.response.status === 401) {
        if (!isPublicAuthRequest(url)) {
          clearTenantSession();
          if (!window.location.pathname.match(/^\/(login|register|forgot-password|reset-password)/)) {
            window.location.href = '/login';
          }
        }
        if (!isPublicAuthRequest(url)) {
          toast.error('Session expired or unauthorized. Please log in again.');
        }
      } else if (error.response.status === 403) {
        toast.error('You do not have permission to perform this action.');
      } else if (error.response.status >= 500) {
        toast.error('Server error. Please try again later.');
      }
    } else {
      toast.error('Network error. Please check your connection.');
    }
    return Promise.reject(error);
  }
);

export default api;
