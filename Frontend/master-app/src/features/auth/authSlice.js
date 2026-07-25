import { createSlice } from '@reduxjs/toolkit';
import { saveToken, saveRole, clearToken, getToken, getRole } from '../../utils/tokenUtils';

const initialState = {
  token: getToken() || null,
  role: getRole() || null,
  tenantId: null,
  isAuthenticated: !!getToken(),
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action) {
      const { token, role, tenant_id } = action.payload;
      state.token = token;
      state.role = role;
      state.tenantId = tenant_id;
      state.isAuthenticated = true;
      state.error = null;
      saveToken(token);
      saveRole(role);
    },

    logout(state) {
      state.token = null;
      state.role = null;
      state.tenantId = null;
      state.isAuthenticated = false;
      state.error = null;
      clearToken();
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;

// Selectors
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthRole = (state) => state.auth.role;
export const selectAuthToken = (state) => state.auth.token;
export const selectAuthError = (state) => state.auth.error;

export default authSlice.reducer;
