import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../utils/axios';

const API_BASE_URL = 'http://localhost:8080'; // API Gateway

export const fetchPendingUsers = createAsyncThunk(
  'users/fetchPending',
  async ({ tenantId, page = 0, size = 10 }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('tenantToken');
      const response = await axios.get(`${API_BASE_URL}/tenants/${tenantId}/users/pending?page=${page}&size=${size}`, {
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
  currentPage: 0,
  totalPages: 0,
  totalElements: 0,
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
        if (action.payload && action.payload.content !== undefined) {
          state.pendingUsers = action.payload.content;
          state.currentPage = action.payload.number;
          state.totalPages = action.payload.totalPages;
          state.totalElements = action.payload.totalElements;
        } else {
          state.pendingUsers = action.payload || [];
        }
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
