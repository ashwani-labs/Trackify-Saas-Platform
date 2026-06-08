/**
 * Extract user-facing message from backend ErrorResponse or ApiResponse error body.
 */
export function getApiErrorMessage(error, fallback = 'Something went wrong') {
  const data = error?.response?.data;
  if (!data) {
    return error?.message === 'Network Error'
      ? 'Network error. Please check your connection.'
      : fallback;
  }
  if (typeof data === 'string') return data;
  if (typeof data.message === 'string' && data.message.length > 0) return data.message;
  if (typeof data.error === 'string' && data.error.length > 0) return data.error;
  return fallback;
}

/** For Redux thunks: rejectWithValue(getApiErrorPayload(error, 'Failed to ...')) */
export function getApiErrorPayload(error, fallback) {
  return getApiErrorMessage(error, fallback);
}

/**
 * Unwrap ApiResponse envelope: { success, message, data } → data
 * Falls through for legacy endpoints that return the payload directly.
 */
export function unwrapApiData(response) {
  const body = response?.data;
  if (body && typeof body === 'object' && 'success' in body && 'data' in body) {
    return body.data;
  }
  return body;
}
