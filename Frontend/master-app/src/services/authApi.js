import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { unwrapApiData } from '@trackify/shared';
import { getToken } from '../utils/tokenUtils';
import { API_BASE_URL } from '../config/api';

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
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      transformResponse: (response) => unwrapApiData({ data: response }),
    }),
  }),
});

export const { useLoginMutation } = authApi;
