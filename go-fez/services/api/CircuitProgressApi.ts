import { createApi } from '@reduxjs/toolkit/query/react';
import baseQuery from '../BaseQuery';

export interface CircuitProgress {
  id: string;
  circuitId: string;
  userId: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'PAUSED';
  startedAt: string;
  completedAt?: string;
  currentPoiIndex?: number;
  visitedPoiIds?: string[];
}

interface StartCircuitResponse {
  success: boolean;
  message: string;
  data: CircuitProgress;
}

interface StartCircuitArgs {
  circuitId: string;
  circuitType?: 'REGULAR' | 'CUSTOM';
}

interface UpdateProgressArgs {
  circuitId: string;
  poiId: string;
}

export const circuitProgressApi = createApi({
  reducerPath: 'circuitProgressApi',
  baseQuery: baseQuery,
  tagTypes: ['CircuitProgress'],
  endpoints: (builder) => ({
    // Démarrer un circuit
    startCircuit: builder.mutation<StartCircuitResponse, StartCircuitArgs>({
      query: ({ circuitId, circuitType = 'REGULAR' }) => ({
        url: '/api/progress/start',
        method: 'POST',
        body: { circuitId, circuitType },
      }),
      invalidatesTags: (result, error, { circuitId }) => [
        { type: 'CircuitProgress', id: circuitId },
        { type: 'CircuitProgress', id: 'LIST' },
      ],
    }),

    // Mettre à jour la progression
    updateCircuitProgress: builder.mutation<
      CircuitProgress,
      UpdateProgressArgs
    >({
      query: (body) => ({
        url: '/api/progress/update',
        method: 'POST',
        body: body,
      }),
      invalidatesTags: (result, error, { circuitId }) => [
        { type: 'CircuitProgress', id: circuitId },
        { type: 'CircuitProgress', id: 'LIST' },
      ],
    }),

    // Obtenir toutes les progressions de l'utilisateur
    getAllUserProgress: builder.query<CircuitProgress[], void>({
      query: () => '/api/progress/user',
      providesTags: (result) =>
        result
          ? [
              ...result.map(
                ({ id }) =>
                  ({ type: 'CircuitProgress', id } as const)
              ),
              { type: 'CircuitProgress', id: 'LIST' },
            ]
          : [{ type: 'CircuitProgress', id: 'LIST' }],
    }),

    // Obtenir la progression d'un circuit spécifique
    getCircuitProgress: builder.query<CircuitProgress, string>({
      query: (circuitId) => `/api/progress/${circuitId}`,
      providesTags: (result, error, id) => [
        { type: 'CircuitProgress', id },
      ],
    }),
  }),
});

export const {
  useStartCircuitMutation,
  useUpdateCircuitProgressMutation,
  useGetAllUserProgressQuery,
  useGetCircuitProgressQuery,
} = circuitProgressApi;

