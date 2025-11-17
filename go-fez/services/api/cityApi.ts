import { createApi } from '@reduxjs/toolkit/query/react';
import baseQuery from '../BaseQuery';

// City Coordinates
export interface CityCoordinates {
  address: string;
  addressAr: string;
  addressEn: string;
  longitude: number;
  latitude: number;
}

// City Type
export interface City {
  id: string;
  name: string;
  nameAr: string;
  nameEn: string;
  image: string;
  imagePublicId: string;
  country: string;
  coordinates: CityCoordinates;
  radius: number;
  isActive: boolean;
  isDeleted: boolean;
  created_at?: string;
  updated_at?: string;
}

// Get Cities Params
export interface GetCitiesParams {
  page?: number;
  limit?: number;
  search?: string;
  country?: string;
  isActive?: boolean;
  sortBy?: 'name' | 'newest' | 'oldest';
}

// Get Cities Response
export interface GetCitiesResponse {
  status: string;
  message: string;
  data: {
    cities: City[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export const cityApi = createApi({
  reducerPath: 'cityApi',
  baseQuery: baseQuery,
  tagTypes: ['City', 'Cities'],
  endpoints: (builder) => ({
    // Get all cities
    getAllCities: builder.query<{ status: string; data: City[] }, void>({
      query: () => ({
        url: '/api/city/',
        method: 'GET',
      }),
      providesTags: ['Cities'],
    }),

    // Get filtered cities
    getFilteredCities: builder.query<GetCitiesResponse, GetCitiesParams>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.search) queryParams.append('search', params.search);
        if (params.country) queryParams.append('country', params.country);
        if (params.isActive !== undefined)
          queryParams.append('isActive', params.isActive.toString());
        if (params.sortBy) queryParams.append('sortBy', params.sortBy);

        return {
          url: `/api/city/?${queryParams.toString()}`,
          method: 'GET',
        };
      },
      providesTags: ['Cities'],
    }),

    // Get city by ID
    getCityById: builder.query<{ status: string; data: City }, string>({
      query: (id) => ({
        url: `/api/city/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'City', id }],
    }),
  }),
});

export const {
  useGetAllCitiesQuery,
  useGetFilteredCitiesQuery,
  useGetCityByIdQuery,
} = cityApi;

export default cityApi;
