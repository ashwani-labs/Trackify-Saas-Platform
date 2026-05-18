export const DEFAULT_API_BASE_URL = 'http://localhost:8080';

export function resolveApiBaseUrl(envValue, fallback = DEFAULT_API_BASE_URL) {
  const value = envValue?.trim();
  return value || fallback;
}
