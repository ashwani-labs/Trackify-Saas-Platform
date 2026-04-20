import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../utils/axios';

const API_BASE_URL = 'http://localhost:8080'; // API Gateway

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
      const { token, role, tenant_id: tenantId, domain } = response.data;
      
      // Store token and tenant info in localStorage
      localStorage.setItem('tenantToken', token);
      localStorage.setItem('tenantId', tenantId);
      localStorage.setItem('tenantDomain', domain);
      
      return { token, role, tenantId, domain, email };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async ({ email, password, fullName, tenantId, status }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/tenants/users/register`, {
        email,
        password,
        fullName,
        tenantId,
        status,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async ({ email, currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/change-password`, {
        email,
        currentPassword,
        newPassword,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to change password');
    }
  }
);

const initialState = {
  user: null,
  token: localStorage.getItem('tenantToken'),
  tenantId: localStorage.getItem('tenantId'),
  tenantDomain: localStorage.getItem('tenantDomain'),
  isAuthenticated: !!localStorage.getItem('tenantToken'),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('tenantToken');
      localStorage.removeItem('tenantId');
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.tenantId = action.payload.tenantId;
        state.tenantDomain = action.payload.domain;
        state.user = { email: action.payload.email, role: action.payload.role };
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
