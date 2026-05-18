import axios from 'axios';
import { getApiErrorMessage } from './errors.js';

/**
 * Factory for app-specific axios instances with auth + error handling.
 */
export function createApiClient({
  baseURL,
  getToken,
  clearSession,
  isPublicRequest = () => false,
  loginPath = '/login',
  publicPathPattern = /^\/(login|register|forgot-password|reset-password)/,
  onErrorNotify = null,
}) {
  const api = axios.create({ baseURL });

  api.interceptors.request.use(
    (config) => {
      const token = getToken?.();
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
      const url = error.config?.url || '';
      const message = getApiErrorMessage(error);

      if (error.response) {
        const { status } = error.response;

        if (status === 401 && !isPublicRequest(url)) {
          clearSession?.();
          if (!publicPathPattern.test(window.location.pathname)) {
            window.location.href = loginPath;
          }
          onErrorNotify?.(message || 'Session expired. Please log in again.');
        } else if (status === 403) {
          onErrorNotify?.(message || 'You do not have permission to perform this action.');
        } else if (status >= 500) {
          onErrorNotify?.(message || 'Server error. Please try again later.');
        } else if (message && onErrorNotify) {
          onErrorNotify(message);
        }
      } else {
        onErrorNotify?.('Network error. Please check your connection.');
      }

      return Promise.reject(error);
    }
  );

  return api;
}
