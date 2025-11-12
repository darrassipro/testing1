import { createApi } from "@reduxjs/toolkit/query/react";
import baseQuery from "../BaseQuery";

export interface RouteSummary {
  id: string;
  circuitId: string;
  isCompleted: boolean;
}

export interface StartRouteRequest {
  circuitId: string;
  longitude: number;
  latitude: number;
  pois?: (string | number)[];
}

export interface StartRouteResponse {
  status: boolean;
  message: string;
  data?: {
    circuit: any;
    firstTrace: any;
    isRouteCompleted: boolean;
  };
}

export interface RemovePOIRequest {
  routeId: string;
  poiId: string;
}

export interface RemovePOIResponse {
  status: boolean;
  message: string;
  data?: {
    removedTrace: any;
    isRouteCompleted: boolean;
    albumId?: string;
  };
}

export interface GetAllRoutesParams {
  search?: string;
  page?: number;
  limit?: number;
}

export interface GetAllRoutesResponse {
  status: boolean;
  message: string;
  pagination?: {
    total: number;
    currentPage: number;
    totalPages: number;
  };
  data?: any[];
}

export interface SavedRoute {
  id: string;
  userId: string;
  poiId: string;
  poiName: string;
  poiImage?: string;
  startLocation: {
    lat: number;
    lng: number;
    address?: string;
  };
  endLocation: {
    lat: number;
    lng: number;
    address?: string;
  };
  distance: number; // in km
  duration: number; // in minutes
  transportMode: 'car' | 'foot' | 'bike' | 'motorcycle';
  routeGeoJSON: any;
  pointsEarned: number;
  completedAt: string;
  createdAt: string;
}

export interface GetRouteByIdResponse {
  status: boolean;
  message: string;
  data?: {
    route: RouteSummary;
    pois: any[];
    visitedTraces: any[];
  };
}

export interface AddVisitedTraceRequest {
  routeId: string;
  longitude: number;
  latitude: number;
  pois?: (string | number)[];
}

export interface AddVisitedTraceResponse {
  status: boolean;
  message: string;
  data?: any;
}

export interface SaveRouteRequest {
  poiId: string;
  poiName: string;
  poiImage?: string;
  startLocation: {
    lat: number;
    lng: number;
    address?: string;
  };
  endLocation: {
    lat: number;
    lng: number;
    address?: string;
  };
  distance: number;
  duration: number;
  transportMode: 'car' | 'foot' | 'bike' | 'motorcycle';
  routeGeoJSON: any;
  pointsEarned: number;
}

export interface SaveRouteResponse {
  status: boolean;
  message: string;
  data?: SavedRoute;
}

export interface GetUserRoutesResponse {
  status: boolean;
  message: string;
  data?: {
    routes: SavedRoute[];
    totalPoints: number;
    totalRoutes: number;
    totalDistance: number;
  };
}

export const routeApi = createApi({
  reducerPath: "routeApi",
  baseQuery,
  tagTypes: ["Route", "UserRoutes", "AllRoutes"],
  endpoints: (builder) => ({
    // Start a new route (circuit-based)
    startRoute: builder.mutation<StartRouteResponse, StartRouteRequest>({
      query: (body) => ({
        url: `/api/routes/start`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Route", "UserRoutes"],
    }),
    
    // Get route by ID with POIs and traces
    getRouteById: builder.query<GetRouteByIdResponse, string>({
      query: (id) => ({
        url: `/api/routes/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Route", id }],
    }),
    
    // Add visited trace (GPS tracking during circuit navigation)
    addVisitedTrace: builder.mutation<AddVisitedTraceResponse, AddVisitedTraceRequest>({
      query: (body) => ({
        url: `/api/routes/trace`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, arg) => arg?.routeId ? [{ type: "Route", id: arg.routeId }] : [],
    }),
    
    // Remove POI from route (circuit customization)
    removePOIFromRoute: builder.mutation<RemovePOIResponse, RemovePOIRequest>({
      query: (body) => ({
        url: `/api/routes/remove-poi`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, arg) => arg?.routeId ? [{ type: "Route", id: arg.routeId }] : [],
    }),
    
    // Save a completed navigation route (from map navigation)
    saveRoute: builder.mutation<SaveRouteResponse, SaveRouteRequest>({
      query: (body) => ({
        url: `/api/routes/save`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["UserRoutes"],
    }),
    
    // Get user's saved routes with statistics
    getUserRoutes: builder.query<GetUserRoutesResponse, void>({
      query: () => ({
        url: `/api/routes/user`,
        method: "GET",
      }),
      providesTags: ["UserRoutes"],
    }),
    
    // Get all routes (admin - with search and pagination)
    getAllRoutes: builder.query<GetAllRoutesResponse, GetAllRoutesParams | void>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params && typeof params === 'object') {
          if (params.search) searchParams.append('search', params.search);
          if (params.page) searchParams.append('page', params.page.toString());
          if (params.limit) searchParams.append('limit', params.limit.toString());
        }
        
        return {
          url: `/api/routes${searchParams.toString() ? `?${searchParams.toString()}` : ''}`,
          method: "GET",
        };
      },
      providesTags: ["AllRoutes"],
    }),
  }),
});

export const { 
  useStartRouteMutation,
  useGetRouteByIdQuery, 
  useAddVisitedTraceMutation,
  useRemovePOIFromRouteMutation,
  useSaveRouteMutation,
  useGetUserRoutesQuery,
  useGetAllRoutesQuery,
} = routeApi;
export default routeApi;

