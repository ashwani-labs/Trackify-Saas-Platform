import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as tenantApi from '../../services/tenantApi';

export const loadTenants = createAsyncThunk(
  'tenants/fetchAll',
  async ({ page = 0, size = 10 } = {}, { rejectWithValue }) => {
    try {
      const response = await tenantApi.fetchAllTenants(page, size);
      // Ensure we extract the data correctly from the ApiResponse structure
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch tenants');
    }
  }
);

export const loadDashboardStats = createAsyncThunk(
  'tenants/fetchDashboardStats',
  async ({ months = 6 } = {}, { rejectWithValue }) => {
    try {
      const response = await tenantApi.fetchDashboardStats(months);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard stats');
    }
  }
);

export const createTenantAsync = createAsyncThunk(
  'tenants/create',
  async (tenantData, { rejectWithValue }) => {
    try {
      const response = await tenantApi.createTenant(tenantData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create tenant');
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

export const deleteTenantAsync = createAsyncThunk(
  'tenants/delete',
  async (id, { rejectWithValue }) => {
    try {
      await tenantApi.deleteTenant(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete tenant');
    }
  }
);

const initialState = {
  list: [],
  currentPage: 0,
  totalPages: 0,
  totalElements: 0,
  dashboardStats: null,
  isStatsLoading: false,
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
        if (action.payload && action.payload.content !== undefined) {
          state.list = action.payload.content;
          state.currentPage = action.payload.number;
          state.totalPages = action.payload.totalPages;
          state.totalElements = action.payload.totalElements;
        } else {
          state.list = action.payload || [];
        }
      })
      .addCase(loadTenants.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(loadDashboardStats.pending, (state) => {
        state.isStatsLoading = true;
      })
      .addCase(loadDashboardStats.fulfilled, (state, action) => {
        state.isStatsLoading = false;
        state.dashboardStats = action.payload;
      })
      .addCase(loadDashboardStats.rejected, (state, action) => {
        state.isStatsLoading = false;
        state.error = action.payload;
      })
      .addCase(toggleTenantStatus.fulfilled, (state, action) => {
        const index = state.list.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })
      .addCase(createTenantAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createTenantAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list.push(action.payload);
      })
      .addCase(createTenantAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(deleteTenantAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteTenantAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = state.list.filter((t) => t.id !== action.payload);
      })
      .addCase(deleteTenantAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearTenantError } = tenantSlice.actions;

// Selectors
export const selectAllTenants = (state) => state.tenants.list;
export const selectTenantLoading = (state) => state.tenants.isLoading;
export const selectTenantStatsLoading = (state) => state.tenants.isStatsLoading;
export const selectDashboardStats = (state) => state.tenants.dashboardStats;
export const selectTenantCurrentPage = (state) => state.tenants.currentPage;
export const selectTenantTotalPages = (state) => state.tenants.totalPages;

export default tenantSlice.reducer;
