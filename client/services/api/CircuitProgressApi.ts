// client/services/api/CircuitProgressApi.ts
import { createApi } from '@reduxjs/toolkit/query/react';
// FIX: Changed from '{ baseQuery }' to 'baseQuery'
import baseQuery from '../BaseQuery';
import { CircuitProgress } from '@/lib/types'; // Assurez-vous que ce type existe

// Interface pour la réponse de startCircuit
interface StartCircuitResponse {
    success: boolean;
    message: string;
    data: CircuitProgress;
}

// Interface pour les arguments de startCircuit
interface StartCircuitArgs {
    circuitId: string;
    circuitType?: 'REGULAR' | 'CUSTOM';
}

// Interface pour les arguments de mise à jour
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
                url: '/progress/start',
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
                url: '/progress/update',
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
            query: () => '/progress/user',
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
            query: (circuitId) => `/progress/${circuitId}`,
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