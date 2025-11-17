import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@/lib/config';

const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  credentials: 'include',
  prepareHeaders: async (headers) => {
    // Get token from AsyncStorage
    const token = await AsyncStorage.getItem('token');

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  },
});

// BaseQuery with automatic retry and 401 error handling
const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  let result = await baseQuery(args, api, extraOptions);

  // If we get a 401 (unauthorized) error
  if (result.error && result.error.status === 401) {
    // Try to refresh the token
    const refreshToken = await AsyncStorage.getItem('refreshToken');

    if (refreshToken) {
      const refreshResult = await baseQuery(
        {
          url: '/api/auth/refresh',
          method: 'POST',
          body: { refreshToken },
        },
        api,
        extraOptions
      );

      if (refreshResult.data) {
        // Save the new token
        await AsyncStorage.setItem('token', (refreshResult.data as any).token);

        // Retry the original request with the new token
        result = await baseQuery(args, api, extraOptions);
      } else {
        // If refresh fails, clear tokens
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('refreshToken');
        await AsyncStorage.removeItem('user');
      }
    } else {
      // No refresh token, clear tokens
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('refreshToken');
      await AsyncStorage.removeItem('user');
    }
  }

  return result;
};

export default baseQueryWithReauth;
