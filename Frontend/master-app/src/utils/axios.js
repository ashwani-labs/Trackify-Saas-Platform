import { createApiClient } from '@trackify/shared';
import { API_BASE_URL } from '../config/api';

const MASTER_TOKEN_KEY = 'trackify_master_token';

const api = createApiClient({
  baseURL: API_BASE_URL,
  getToken: () => localStorage.getItem(MASTER_TOKEN_KEY),
  clearSession: () => localStorage.removeItem(MASTER_TOKEN_KEY),
  isPublicRequest: (url) => url.includes('/auth/login'),
  loginPath: '/login',
  publicPathPattern: /^\/login/,
  onErrorNotify: (message) => {
    if (message) console.error(message);
  },
});

export default api;
