import { resolveApiBaseUrl } from '@trackify/shared';

export const API_BASE_URL = resolveApiBaseUrl(import.meta.env.VITE_API_BASE_URL);
