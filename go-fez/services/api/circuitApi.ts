import { createApi } from '@reduxjs/toolkit/query/react';
import baseQuery from '../BaseQuery';

export interface CircuitLocalization {
  name: string;
  description: string;
}

export interface Circuit {
  id: string;
  ar: CircuitLocalization | string;
  fr: CircuitLocalization | string;
  en: CircuitLocalization | string;
  image: string;
  imagePublicId: string;
  cityId: string;
  duration: number;
  distance: number;
  startPoint?: string;
  endPoint?: string;
  price?: number;
  isPremium: boolean;
  isActive: boolean;
  rating?: number;
  reviewCount?: number;
  themes?: Array<{ id: string; fr: string | CircuitLocalization }>;
  pois?: Array<{ id: string }>;
  city?: { id: string; name: string };
}

// Parameters for filtering circuits
export interface GetCircuitsParams {
  page?: number;
  limit?: number;
  search?: string;
  themeId?: string;
  cityId?: string;
  isPremium?: boolean;
  isActive?: boolean;
  sortBy?: 'newest' | 'popular' | 'rating';
}

// Response type for filtered circuits
export interface GetCircuitsResponse {
  success: boolean;
  message: string;
  data: {
    circuits: Circuit[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export const circuitApi = createApi({
  reducerPath: 'circuitApi',
  baseQuery: baseQuery,
  tagTypes: ['Circuit', 'Circuits'],
  endpoints: (builder) => ({
    getAllCircuits: builder.query<
      { success: boolean; message?: string; data: Circuit[] },
      void
    >({
      query: () => ({
        url: '/api/circuits/',
        method: 'GET',
      }),
      providesTags: ['Circuits'],
    }),

    getFilteredCircuits: builder.query<GetCircuitsResponse, GetCircuitsParams>({
      query: (params) => {
        const queryParams = new URLSearchParams();

        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.search) queryParams.append('search', params.search);
        if (params.themeId) queryParams.append('themeId', params.themeId);
        if (params.cityId) queryParams.append('cityId', params.cityId);
        if (params.isPremium !== undefined)
          queryParams.append('isPremium', params.isPremium.toString());
        if (params.isActive !== undefined)
          queryParams.append('isActive', params.isActive.toString());
        if (params.sortBy) queryParams.append('sortBy', params.sortBy);

        return {
          url: `/api/circuits?${queryParams.toString()}`,
          method: 'GET',
        };
      },
      providesTags: ['Circuits'],
    }),

    getCircuitById: builder.query<{ success: boolean; data: Circuit }, string>({
      query: (id) => ({
        url: `/api/circuits/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'Circuit', id }],
    }),
  }),
});

export const {
  useGetAllCircuitsQuery,
  useGetFilteredCircuitsQuery,
  useGetCircuitByIdQuery,
} = circuitApi;

export default circuitApi;
