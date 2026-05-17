import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getToken } from '../utils/tokenUtils';
import { API_BASE_URL } from '../config/api';

// Base API definition — all master app API calls go through here
export const authApi = createApi({
  reducerPath: 'authApi',

  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      const token = getToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),

  endpoints: (builder) => ({
    // POST /auth/login
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
        // credentials: { email, password }
      }),
    }),

    // POST /auth/logout  (future)
    logoutApi: builder.mutation({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
    }),

    // GET /auth/me — fetch current master user profile (future)
    getProfile: builder.query({
      query: () => '/auth/me',
    }),
  }),
});

export const { useLoginMutation, useLogoutApiMutation, useGetProfileQuery } = authApi;
