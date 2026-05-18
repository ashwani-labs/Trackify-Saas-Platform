import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getApiErrorPayload } from '@trackify/shared';
import api from '../../utils/axios';

export const fetchPendingUsers = createAsyncThunk(
  'users/fetchPending',
  async ({ tenantId, page = 0, size = 10 }, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/tenants/${tenantId}/users/pending?page=${page}&size=${size}`
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(getApiErrorPayload(error, 'Failed to fetch pending users'));
    }
  }
);

export const fetchAllUsers = createAsyncThunk(
  'users/fetchAll',
  async ({ tenantId, page = 0, size = 10 }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/tenants/${tenantId}/users?page=${page}&size=${size}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(getApiErrorPayload(error, 'Failed to fetch users'));
    }
  }
);

export const updateUserStatus = createAsyncThunk(
  'users/updateStatus',
  async ({ tenantId, userId, status }, { rejectWithValue }) => {
    try {
      const response = await api.patch(
        `/tenants/${tenantId}/users/${userId}/status?status=${status}`,
        {}
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(getApiErrorPayload(error, 'Failed to update user status'));
    }
  }
);

const initialState = {
  pendingUsers: [],
  currentPage: 0,
  totalPages: 0,
  totalElements: 0,
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
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        state.pendingUsers = state.pendingUsers.filter((u) => u.id !== action.payload.id);
        const idx = state.allUsers.findIndex((u) => u.id === action.payload.id);
        if (idx !== -1) state.allUsers[idx] = action.payload;
      });
  },
});

export const { clearUserError } = userSlice.actions;
export default userSlice.reducer;
