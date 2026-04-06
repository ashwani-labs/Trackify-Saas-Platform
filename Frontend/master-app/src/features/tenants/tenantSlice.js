import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as tenantApi from '../../services/tenantApi';

export const loadTenants = createAsyncThunk(
  'tenants/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await tenantApi.fetchAllTenants();
      // Ensure we extract the data correctly from the ApiResponse structure
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch tenants');
    }
  }
);

export const toggleTenantStatus = createAsyncThunk(
  'tenants/toggleStatus',
  async ({ id, currentStatus }, { rejectWithValue }) => {
    try {
      const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      const response = await tenantApi.updateTenantStatus(id, newStatus);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update tenant status');
    }
  }
);

const initialState = {
  list: [],
  isLoading: false,
  error: null,
};

const tenantSlice = createSlice({
  name: 'tenants',
  initialState,
  reducers: {
    clearTenantError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadTenants.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadTenants.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = action.payload;
      })
      .addCase(loadTenants.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(toggleTenantStatus.fulfilled, (state, action) => {
        const index = state.list.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      });
  },
});

export const { clearTenantError } = tenantSlice.actions;

// Selectors
export const selectAllTenants = (state) => state.tenants.list;
export const selectTenantLoading = (state) => state.tenants.isLoading;

export default tenantSlice.reducer;
