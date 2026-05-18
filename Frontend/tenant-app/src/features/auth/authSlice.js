import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getApiErrorPayload, unwrapApiData } from '@trackify/shared';
import api from '../../utils/axios';

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const login = unwrapApiData(response);
      const {
        token,
        role,
        tenant_id: tenantId,
        domain,
        profile_photo_url: profilePhotoUrl,
        company_name: companyName,
        logo_url: logoUrl,
        primary_color: primaryColor,
      } = login;

      localStorage.setItem('tenantToken', token);
      localStorage.setItem('tenantId', tenantId);
      localStorage.setItem('tenantDomain', domain);
      localStorage.setItem('tenantLogo', logoUrl || '');
      localStorage.setItem('tenantColor', primaryColor || '#6366f1');
      localStorage.setItem('tenantUserEmail', email || '');
      localStorage.setItem('tenantUserRole', role || '');
      localStorage.setItem('tenantUserProfilePhoto', profilePhotoUrl || '');

      return {
        token,
        role,
        tenantId,
        domain,
        email,
        profilePhotoUrl,
        companyName,
        logoUrl,
        primaryColor,
      };
    } catch (error) {
      return rejectWithValue(getApiErrorPayload(error, 'Login failed'));
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async ({ email, password, fullName, tenantId, status }, { rejectWithValue }) => {
    try {
      const response = await api.post('/tenants/users/register', {
        email,
        password,
        fullName,
        tenantId,
        status,
      });
      return unwrapApiData(response);
    } catch (error) {
      return rejectWithValue(getApiErrorPayload(error, 'Registration failed'));
    }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async ({ email, currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/change-password', {
        email,
        currentPassword,
        newPassword,
      });
      return unwrapApiData(response);
    } catch (error) {
      return rejectWithValue(getApiErrorPayload(error, 'Failed to change password'));
    }
  }
);

const initialState = {
  user: localStorage.getItem('tenantToken')
    ? {
        email: localStorage.getItem('tenantUserEmail'),
        role: localStorage.getItem('tenantUserRole'),
        profilePhotoUrl: localStorage.getItem('tenantUserProfilePhoto'),
      }
    : null,
  token: localStorage.getItem('tenantToken'),
  tenantId: localStorage.getItem('tenantId'),
  tenantDomain: localStorage.getItem('tenantDomain'),
  tenantLogo: localStorage.getItem('tenantLogo'),
  primaryColor: localStorage.getItem('tenantColor') || '#6366f1',
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
      localStorage.removeItem('tenantDomain');
      localStorage.removeItem('tenantLogo');
      localStorage.removeItem('tenantColor');
      localStorage.removeItem('tenantUserEmail');
      localStorage.removeItem('tenantUserRole');
      localStorage.removeItem('tenantUserProfilePhoto');
    },
    clearError: (state) => {
      state.error = null;
    },
    updateProfilePhoto: (state, action) => {
      if (state.user) {
        state.user.profilePhotoUrl = action.payload;
        localStorage.setItem('tenantUserProfilePhoto', action.payload);
      }
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
        state.tenantLogo = action.payload.logoUrl;
        state.primaryColor = action.payload.primaryColor || '#6366f1';
        state.user = {
          email: action.payload.email,
          role: action.payload.role,
          profilePhotoUrl: action.payload.profilePhotoUrl,
        };
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

export const { logout, clearError, updateProfilePhoto } = authSlice.actions;
export default authSlice.reducer;
