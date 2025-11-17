import { createApi } from '@reduxjs/toolkit/query/react';
import baseQuery from '../BaseQuery';

// Share Registration Args
export interface RegisterShareArgs {
  resourceType: 'poi' | 'circuit';
  resourceId: string;
  platform: 'facebook' | 'twitter' | 'whatsapp' | 'link';
}

// Share Response
export interface ShareResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    userId: number;
    resourceType: string;
    resourceId: string;
    platform: string;
    created_at: string;
    updated_at: string;
  };
}

export const shareApi = createApi({
  reducerPath: 'shareApi',
  baseQuery: baseQuery,
  tagTypes: ['Share'],
  endpoints: (builder) => ({
    // Register a share action
    registerShare: builder.mutation<ShareResponse, RegisterShareArgs>({
      query: (body) => ({
        url: '/api/shares/register',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Share'],
    }),
  }),
});

export const { useRegisterShareMutation } = shareApi;

export default shareApi;
