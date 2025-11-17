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

export interface AddPOIRequest {
  routeId: string;
  poiId: string;
}

export interface AddPOIResponse {
  status: boolean;
  message: string;
  data?: {
    removedTrace: any;
  };
}

export interface GetRouteByIdResponse {
  status: boolean;
  message: string;
  data?: {
    route: RouteSummary;
    pois: any[];
    visitedTraces: any[];
    removedTraces?: any[];
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
  data?: {
    visitedTraces?: any[];
    isRouteCompleted?: boolean;
    pointsAwarded?: {
      totalPoints: number;
      pointsAwarded?: Array<{
        activity: string;
        points: number;
        description: string;
      }>;
    };
  };
}

export const routeApi = createApi({
  reducerPath: "routeApi",
  baseQuery: baseQuery,
  tagTypes: ["Route", "UserRoutes"],
  endpoints: (builder) => ({
    // Start a new route (circuit-based)
    startRoute: builder.mutation<StartRouteResponse, StartRouteRequest>({
      query: (body) => ({
        url: "/api/routes/start",
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
        url: "/api/routes/trace",
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, arg) => arg?.routeId ? [{ type: "Route", id: arg.routeId }] : [],
    }),
    
    // Remove POI from route (circuit customization)
    removePOIFromRoute: builder.mutation<RemovePOIResponse, RemovePOIRequest>({
      query: (body) => ({
        url: "/api/routes/remove-poi",
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, arg) => arg?.routeId ? [{ type: "Route", id: arg.routeId }] : [],
    }),
    
    // Add POI back to route (circuit customization)
    addPOIToRoute: builder.mutation<AddPOIResponse, AddPOIRequest>({
      query: (body) => ({
        url: "/api/routes/add-poi",
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, arg) => arg?.routeId ? [{ type: "Route", id: arg.routeId }] : [],
    }),
  }),
});

export const { 
  useStartRouteMutation,
  useGetRouteByIdQuery, 
  useAddVisitedTraceMutation,
  useRemovePOIFromRouteMutation,
  useAddPOIToRouteMutation,
} = routeApi;

export default routeApi;

