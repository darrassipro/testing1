// client/services/api/PartnerApi.ts
import { createApi } from '@reduxjs/toolkit/query/react';
import baseQuery from '../BaseQuery.js';
import { Partner, PartnerVisit } from '@/lib/types'; // Assurez-vous que ces types existent

// Interface pour la liste des partenaires
interface GetPartnersResponse {
	success: boolean;
	data: Partner[];
}

// Interface pour un partenaire unique
interface GetPartnerResponse {
	success: boolean;
	data: Partner;
}

// Interface pour la réponse de l'enregistrement de visite
interface RegisterVisitResponse {
	success: boolean;
	message: string;
	data: {
		visitId: string;
		partnerName: string;
		pointsAwarded: boolean;
	};
}

export const partnerApi = createApi({
	reducerPath: 'partnerApi',
	baseQuery: baseQuery,
	tagTypes: ['Partner', 'PartnerVisit'],
	endpoints: (builder) => ({
		// Récupérer tous les partenaires actifs (pour les utilisateurs)
		getActivePartners: builder.query<GetPartnersResponse, void>({
			query: () => '/partners?isActive=true',
			providesTags: (result) =>
				result
					? [
							...result.data.map(
								({ id }) => ({ type: 'Partner', id } as const)
							),
							{ type: 'Partner', id: 'LIST' },
					  ]
					: [{ type: 'Partner', id: 'LIST' }],
		}),

		// Récupérer tous les partenaires (pour l'admin)
		getAllPartnersAdmin: builder.query<GetPartnersResponse, void>({
			query: () => '/partners', // Endpoint sans filtre isActive
			providesTags: (result) =>
				result
					? [
							...result.data.map(
								({ id }) => ({ type: 'Partner', id } as const)
							),
							{ type: 'Partner', id: 'LIST' },
					  ]
					: [{ type: 'Partner', id: 'LIST' }],
		}),

		// Récupérer un partenaire par ID
		getPartnerById: builder.query<GetPartnerResponse, string>({
			query: (id) => `/partners/${id}`,
			providesTags: (result, error, id) => [{ type: 'Partner', id }],
		}),

		// Enregistrer une visite (via QR code)
		registerVisit: builder.mutation<RegisterVisitResponse, { qrCode: string }>({
			query: (body) => ({
				url: '/partners/visit',
				method: 'POST',
				body: body,
			}),
            // Invalidation locale seulement
            invalidatesTags: ['PartnerVisit'],
		}),

		// --- Endpoints Admin (CRUD) ---
		createPartner: builder.mutation<GetPartnerResponse, FormData>({
			query: (formData) => ({
				url: '/partners',
				method: 'POST',
				body: formData,
				formData: true,
			}),
			invalidatesTags: [{ type: 'Partner', id: 'LIST' }],
		}),

		updatePartner: builder.mutation<
			GetPartnerResponse,
			{ id: string; formData: FormData }
		>({
			query: ({ id, formData }) => ({
				url: `/partners/${id}`,
				method: 'PUT',
				body: formData,
				formData: true,
			}),
			invalidatesTags: (result, error, { id }) => [
				{ type: 'Partner', id },
				{ type: 'Partner', id: 'LIST' },
			],
		}),

		deletePartner: builder.mutation<{ success: boolean }, string>({
			query: (id) => ({
				url: `/partners/${id}`,
				method: 'DELETE',
			}),
			invalidatesTags: [{ type: 'Partner', id: 'LIST' }],
		}),
	}),
});

export const {
	useGetActivePartnersQuery,
	useGetAllPartnersAdminQuery, // Pour l'admin
	useGetPartnerByIdQuery,
	useRegisterVisitMutation,
	useCreatePartnerMutation, // Pour l'admin
	useUpdatePartnerMutation, // Pour l'admin
	useDeletePartnerMutation, // Pour l'admin
} = partnerApi;