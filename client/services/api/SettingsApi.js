import { createApi } from "@reduxjs/toolkit/query/react";
import baseQuery from "../BaseQuery.js";

export const settingsApi = createApi({
  reducerPath: "settingsApi",
  baseQuery: baseQuery,
  tagTypes: ['Settings'],
  endpoints: (builder) => ({
    // Get all settings
    getAllSettings: builder.query({
      query: () => ({
        url: "/api/settings",
        method: "GET",
      }),
      providesTags: ['Settings'],
    }),

    // Get a specific setting by key
    getSetting: builder.query({
      query: (key) => ({
        url: `/api/settings/${key}`,
        method: "GET",
      }),
      providesTags: (result, error, key) => [{ type: 'Settings', id: key }],
    }),

    // Update a specific setting
    updateSetting: builder.mutation({
      query: ({ key, value }) => ({
        url: `/api/settings/${key}`,
        method: "PUT",
        body: { value },
      }),
      invalidatesTags: ['Settings'],
    }),

    // Update multiple settings at once
    updateMultipleSettings: builder.mutation({
      query: (settings) => ({
        url: "/api/settings",
        method: "PUT",
        body: { settings },
      }),
      invalidatesTags: ['Settings'],
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useGetAllSettingsQuery,
  useGetSettingQuery,
  useUpdateSettingMutation,
  useUpdateMultipleSettingsMutation,
} = settingsApi;

export default settingsApi;
