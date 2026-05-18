import toast from 'react-hot-toast';
import { createApiClient } from '@trackify/shared';
import { API_BASE_URL } from '../config/api';
import { clearTenantSession } from './session';

const isPublicAuthRequest = (url = '') =>
  /\/auth\/(login|forgot-password|reset-password)/.test(url) ||
  url.includes('/tenants/users/register');

const api = createApiClient({
  baseURL: API_BASE_URL,
  getToken: () => localStorage.getItem('tenantToken'),
  clearSession: clearTenantSession,
  isPublicRequest: isPublicAuthRequest,
  loginPath: '/login',
  onErrorNotify: (message) => toast.error(message),
});

export default api;
