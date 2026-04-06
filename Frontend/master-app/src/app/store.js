import { configureStore } from '@reduxjs/toolkit';
import { authApi } from '../services/authApi';
import authReducer from '../features/auth/authSlice';
import tenantReducer from '../features/tenants/tenantSlice';

export const store = configureStore({
  reducer: {
    // Feature slices
    auth: authReducer,
    tenants: tenantReducer,

    // RTK Query API reducers
    [authApi.reducerPath]: authApi.reducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware),

  devTools: import.meta.env.DEV,
});
