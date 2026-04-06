import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080'; // API Gateway

export const fetchPendingUsers = createAsyncThunk(
  'users/fetchPending',
  async (tenantId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('tenantToken');
      const response = await axios.get(`${API_BASE_URL}/tenants/${tenantId}/users/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch pending users');
    }
  }
);

export const updateUserStatus = createAsyncThunk(
  'users/updateStatus',
  async ({ tenantId, userId, status }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('tenantToken');
      const response = await axios.patch(
        `${API_BASE_URL}/tenants/${tenantId}/users/${userId}/status?status=${status}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update user status');
    }
  }
);

const initialState = {
  pendingUsers: [],
  isLoading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearUserError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPendingUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPendingUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pendingUsers = action.payload;
      })
      .addCase(fetchPendingUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        state.pendingUsers = state.pendingUsers.filter((u) => u.id !== action.payload.id);
      });
  },
});

export const { clearUserError } = userSlice.actions;
export default userSlice.reducer;
