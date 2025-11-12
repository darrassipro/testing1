// client/services/api/CustomCircuitApi.ts
import { createApi } from '@reduxjs/toolkit/query/react';
import  baseQuery  from '../BaseQuery';
import { CustomCircuit, POI } from '@/lib/types'; // Assurez-vous que ces types existent

// Interface pour la réponse getById (incluant les POIs détaillés)
interface CustomCircuitWithPOIs extends CustomCircuit {
	pois: POI[];
}
interface GetCustomCircuitResponse {
	success: boolean;
	data: CustomCircuitWithPOIs;
}

// Interface pour la liste des circuits de l'utilisateur
interface ListCustomCircuitsResponse {
	success: boolean;
	data: CustomCircuit[];
}

// Interface pour la création/mise à jour
interface MutateCustomCircuitArgs {
	name: string;

	
	description?: string; 
	startDate?: Date | string | null;
	estimatedDuration?: number | null;
	isPublic?: boolean;
		pois: {
		poiId: string;
		order: number;
	}[];
}

export const customCircuitApi = createApi({
	reducerPath: 'customCircuitApi',
	baseQuery: baseQuery,
	tagTypes: ['CustomCircuit'],
	endpoints: (builder) => ({
		// Créer un circuit personnalisé
		createCustomCircuit: builder.mutation<
			{ success: boolean; data: CustomCircuit },
			MutateCustomCircuitArgs
		>({
			query: (body) => ({
				url: 'api/custom-circuits',
				method: 'POST',
				body: body,
			}),
			invalidatesTags: [{ type: 'CustomCircuit', id: 'LIST' }],
		}),

		// Récupérer les circuits personnalisés de l'utilisateur
		getUserCustomCircuits: builder.query<ListCustomCircuitsResponse, void>({
			query: () => 'api/custom-circuits/user',
			providesTags: (result) =>
				result
					? [
							...result.data.map(
								({ id }) =>
									({ type: 'CustomCircuit', id } as const)
							),
							{ type: 'CustomCircuit', id: 'LIST' },
					  ]
					: [{ type: 'CustomCircuit', id: 'LIST' }],
		}),

		// Récupérer un circuit personnalisé par ID (avec POIs)
		getCustomCircuitById: builder.query<GetCustomCircuitResponse, string>({
			query: (id) => `api/custom-circuits/${id}`,
			providesTags: (result, error, id) => [{ type: 'CustomCircuit', id }],
		}),

		// Mettre à jour un circuit personnalisé
		updateCustomCircuit: builder.mutation<
			{ success: boolean; data: CustomCircuit },
			{ id: string; body: Partial<MutateCustomCircuitArgs> }
		>({
			query: ({ id, body }) => ({
				url: `api/custom-circuits/${id}`,
				method: 'PUT',
				body: body,
			}),
			invalidatesTags: (result, error, { id }) => [
				{ type: 'CustomCircuit', id },
				{ type: 'CustomCircuit', id: 'LIST' },
			],
		}),

		// Supprimer un circuit personnalisé
		deleteCustomCircuit: builder.mutation<{ success: boolean }, string>({
			query: (id) => ({
				url: `api/custom-circuits/${id}`,
				method: 'DELETE',
			}),
			invalidatesTags: (result, error, id) => [
				{ type: 'CustomCircuit', id },
				{ type: 'CustomCircuit', id: 'LIST' },
			],
		}),
	}),
});

export const {
	useCreateCustomCircuitMutation,
	useGetUserCustomCircuitsQuery,
	useGetCustomCircuitByIdQuery,
	useUpdateCustomCircuitMutation,
	useDeleteCustomCircuitMutation,
} = customCircuitApi;