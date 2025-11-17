import { createApi } from '@reduxjs/toolkit/query/react';
import baseQuery from '../BaseQuery';

export interface ThemeLocalization {
  name: string;
  desc: string;
}

export interface Theme {
  id: string;
  ar: string | ThemeLocalization;
  fr: string | ThemeLocalization;
  en: string | ThemeLocalization;
  icon: string;
  image: string;
  imagePublicId: string;
  iconPublicId: string;
  color: string;
  isActive: boolean;
  isDeleted: boolean;
  circuitsCount?: number;
  circuitsFromThemes?: any[];
  circuits?: any[];
  created_at: string;
  updated_at: string;
}

export const themeApi = createApi({
  reducerPath: 'themeApi',
  baseQuery: baseQuery,
  tagTypes: ['Theme', 'Themes'],
  endpoints: (builder) => ({
    getAllThemes: builder.query<{ status: string; data: Theme[] }, void>({
      query: () => ({
        url: '/api/themes/',
        method: 'GET',
      }),
      providesTags: ['Themes'],
    }),
  }),
});

export const { useGetAllThemesQuery } = themeApi;
export default themeApi;
