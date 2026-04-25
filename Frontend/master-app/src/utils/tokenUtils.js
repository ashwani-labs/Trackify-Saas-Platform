// JWT token helpers — keep token logic in ONE place
const TOKEN_KEY = 'trackify_master_token';
const ROLE_KEY = 'trackify_master_role';

export const saveToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
};

export const saveRole = (role) => {
  localStorage.setItem(ROLE_KEY, role);
};

export const getRole = () => {
  return localStorage.getItem(ROLE_KEY);
};

export const isTokenValid = () => {
  const token = getToken();
  if (!token) return false;

  try {
    // Decode JWT payload (base64) to check expiry
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};
