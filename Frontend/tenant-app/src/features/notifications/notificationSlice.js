import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../utils/axios';
import { getApiErrorPayload } from '@trackify/shared';

export const fetchNotifications = createAsyncThunk(
  'notifications/fetch',
  async ({ unreadOnly = false, page = 0, size = 20 } = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/notifications', {
        params: { unreadOnly, page, size },
      });
      return response.data?.data;
    } catch (error) {
      return rejectWithValue(getApiErrorPayload(error, 'Failed to load notifications'));
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  'notifications/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/notifications/unread-count');
      return response.data?.data?.count ?? 0;
    } catch (error) {
      return rejectWithValue(getApiErrorPayload(error, 'Failed to load unread count'));
    }
  }
);

export const markNotificationRead = createAsyncThunk(
  'notifications/markRead',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/notifications/${id}/read`);
      return response.data?.data;
    } catch (error) {
      return rejectWithValue(getApiErrorPayload(error, 'Failed to mark notification read'));
    }
  }
);

export const markAllNotificationsRead = createAsyncThunk(
  'notifications/markAllRead',
  async (_, { rejectWithValue }) => {
    try {
      await api.patch('/notifications/read-all');
      return null;
    } catch (error) {
      return rejectWithValue(getApiErrorPayload(error, 'Failed to mark all read'));
    }
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: [],
    unreadCount: 0,
    loading: false,
    error: null,
    totalPages: 0,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload?.content ?? [];
        state.totalPages = action.payload?.totalPages ?? 0;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message ?? 'Failed to load notifications';
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const updated = action.payload;
        const idx = state.items.findIndex((n) => n.id === updated?.id);
        if (idx >= 0) {
          state.items[idx] = updated;
        }
        if (state.unreadCount > 0) {
          state.unreadCount -= 1;
        }
      })
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.items = state.items.map((n) => ({ ...n, read: true }));
        state.unreadCount = 0;
      });
  },
});

export default notificationSlice.reducer;
