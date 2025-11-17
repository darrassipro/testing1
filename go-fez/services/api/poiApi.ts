import { createApi } from '@reduxjs/toolkit/query/react';
import baseQuery from '../BaseQuery';

export interface POILocalization {
  id?: string;
  name: string;
  description: string;
  address: string;
  audioFiles?: string | null;
}

export interface POIFile {
  id: string;
  poiId: string;
  fileUrl: string;
  filePublicId: string | null;
  type: 'image' | 'video' | 'virtualtour';
  createdAt?: string;
  updatedAt?: string;
}

// Parameters for filtering POIs
export interface GetPOIsParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  cityId?: string;
  isPremium?: boolean;
  isActive?: boolean;
  sortBy?: 'newest' | 'oldest' | 'name';
}

// Response type for filtered POIs
export interface GetPOIsResponse {
  success: boolean;
  data: {
    pois: POI[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface POI {
  id: string;
  coordinates:
    | {
        latitude: number;
        longitude: number;
        address?: string;
      }
    | {
        type: 'Point';
        coordinates: [number, number]; // [longitude, latitude] GeoJSON format
      };
  files?: POIFile[];

  // --- Le reste de vos champs ---
  category: string;
  practicalInfo: any;
  cityId: string;
  isActive: boolean;
  isVerified: boolean;
  isPremium: boolean;
  rating?: number;
  reviewCount?: number;
  poiFileId?: string | null;
  isDeleted?: boolean;
  arLocalization?: POILocalization;
  frLocalization?: POILocalization;
  enLocalization?: POILocalization;
  poiFile?: POIFile;
  categoryPOI?: any;
  created_at?: string;
  updated_at?: string;

  // For circuit POIs
  CircuitPOI?: {
    order: number;
  };

  // Localized versions (shortcuts)
  fr?: POILocalization;
  ar?: POILocalization;
  en?: POILocalization;
}

export const poiApi = createApi({
  reducerPath: 'poiApi',
  baseQuery: baseQuery,
  tagTypes: ['POI', 'POIs'],
  endpoints: (builder) => ({
    getAllPOIs: builder.query<
      { success: boolean; pois: POI[] },
      { search?: string; isActive?: boolean } | void
    >({
      query: (params) => {
        const p: any = params || {};
        const queryParams = new URLSearchParams();
        if (p.search) queryParams.append('search', p.search);
        if (p.isActive !== undefined)
          queryParams.append('isActive', p.isActive.toString());

        const queryString = queryParams.toString();
        return {
          url: `/api/pois${queryString ? `?${queryString}` : ''}`,
          method: 'GET',
        };
      },
      providesTags: ['POIs'],
    }),

    getFilteredPOIs: builder.query<GetPOIsResponse, GetPOIsParams>({
      query: (params) => {
        const queryParams = new URLSearchParams();

        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.search) queryParams.append('search', params.search);
        if (params.category) queryParams.append('category', params.category);
        if (params.cityId) queryParams.append('cityId', params.cityId);
        if (params.isPremium !== undefined)
          queryParams.append('isPremium', params.isPremium.toString());
        if (params.isActive !== undefined)
          queryParams.append('isActive', params.isActive.toString());
        if (params.sortBy) queryParams.append('sortBy', params.sortBy);

        return {
          url: `/api/pois?${queryParams.toString()}`,
          method: 'GET',
        };
      },
      providesTags: ['POIs'],
    }),

    getPOIById: builder.query<{ success: boolean; poi: POI }, string>({
      query: (id) => ({
        url: `/api/pois/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'POI', id }],
    }),
  }),
});

export const {
  useGetAllPOIsQuery,
  useGetFilteredPOIsQuery,
  useGetPOIByIdQuery,
} = poiApi;

export default poiApi;
