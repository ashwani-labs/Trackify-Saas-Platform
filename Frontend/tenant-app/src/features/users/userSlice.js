import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../utils/axios';

const API_BASE_URL = 'http://localhost:8080';

const getAuthHeader = () => {
  const token = localStorage.getItem('tenantToken');
  return { Authorization: `Bearer ${token}` };
};

export const fetchPendingUsers = createAsyncThunk(
  'users/fetchPending',
  async ({ tenantId, page = 0, size = 10 }, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/tenants/${tenantId}/users/pending?page=${page}&size=${size}`,
        { headers: getAuthHeader() }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch pending users');
    }
  }
);

export const fetchAllUsers = createAsyncThunk(
  'users/fetchAll',
  async ({ tenantId, page = 0, size = 10 }, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/tenants/${tenantId}/users?page=${page}&size=${size}`,
        { headers: getAuthHeader() }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
    }
  }
);

export const updateUserStatus = createAsyncThunk(
  'users/updateStatus',
  async ({ tenantId, userId, status }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/tenants/${tenantId}/users/${userId}/status?status=${status}`,
        {},
        { headers: getAuthHeader() }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update user status');
    }
  }
);

const initialState = {
  // Pending users (approval page)
  pendingUsers: [],
  currentPage: 0,
  totalPages: 0,
  totalElements: 0,
  // All users (team page)
  allUsers: [],
  allUsersPage: 0,
  allUsersTotalPages: 0,
  allUsersTotalElements: 0,
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
      // fetchPendingUsers
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

      // fetchAllUsers
      .addCase(fetchAllUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload && action.payload.content !== undefined) {
          state.allUsers = action.payload.content;
          state.allUsersPage = action.payload.number;
          state.allUsersTotalPages = action.payload.totalPages;
          state.allUsersTotalElements = action.payload.totalElements;
        } else {
          state.allUsers = action.payload || [];
        }
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // updateUserStatus
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        // Remove from pending list if it was pending
        state.pendingUsers = state.pendingUsers.filter((u) => u.id !== action.payload.id);
        // Update in allUsers list if present
        const idx = state.allUsers.findIndex((u) => u.id === action.payload.id);
        if (idx !== -1) state.allUsers[idx] = action.payload;
      });
  },
});

export const { clearUserError } = userSlice.actions;
export default userSlice.reducer;
