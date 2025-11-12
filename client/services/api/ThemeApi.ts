import { createApi } from "@reduxjs/toolkit/query/react";
import baseQuery from "../BaseQuery";

export interface ThemeLocalization {
  name: string;
  desc: string;
}

export interface ThemeLocalizations {
  ar: ThemeLocalization;
  fr: ThemeLocalization;
  en: ThemeLocalization;
}

export interface Theme {
  id: string;
  ar: ThemeLocalization | string;
  fr: ThemeLocalization | string;
  en: ThemeLocalization | string;
  icon: string;
  image: string;
  imagePublicId: string;
  iconPublicId: string;
  color: string;
  isActive: boolean;
  isDeleted: boolean;
  circuitsCount?: number;
  circuitsFromThemes?: any[];
  created_at: string;
  updated_at: string;
}

export interface GetThemesParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: 'newest' | 'oldest' | 'name';
}

export interface GetThemesResponse {
  status: string;
  data: Theme[];
  pagination?: {
    totalCount: number;
    currentPage: number;
    totalPages: number;
    limit: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface CreateThemeData {
  localizations: ThemeLocalizations;
  color: string;
  isActive: boolean;
}

export const themeApi = createApi({
  reducerPath: "themeApi",
  baseQuery: baseQuery,
  tagTypes: ['Theme', 'Themes'],
  endpoints: (builder) => ({
    getAllThemes: builder.query<{ status: string; data: Theme[] }, void>({
      query: () => ({
        url: "/api/themes/",
        method: "GET",
      }),
      providesTags: ['Themes'],
    }),

    getFilteredThemes: builder.query<GetThemesResponse, GetThemesParams>({
      query: (params) => ({
        url: "/api/themes/",
        method: "GET",
        params,
      }),
      providesTags: ['Themes'],
    }),

    getThemeById: builder.query<{ status: string; data: Theme }, string>({
      query: (id) => ({
        url: `/api/themes/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: 'Theme', id }],
    }),

    createTheme: builder.mutation<{ status: string; data: Theme }, FormData>({
      query: (formData) => ({
        url: "/api/themes/create-with-files",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ['Themes'],
    }),

    updateTheme: builder.mutation<{ status: string; data: Theme }, { id: string; formData: FormData }>({
      query: ({ id, formData }) => ({
        url: `/api/themes/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Theme', id },
        'Themes'
      ],
    }),

    deleteTheme: builder.mutation<{ status: string; message: string }, string>({
      query: (id) => ({
        url: `/api/themes/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ['Themes'],
    }),
  }),
});

export const {
  useGetAllThemesQuery,
  useGetFilteredThemesQuery,
  useGetThemeByIdQuery,
  useCreateThemeMutation,
  useUpdateThemeMutation,
  useDeleteThemeMutation,
} = themeApi;

export default themeApi;