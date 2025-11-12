// client/services/api/ShareApi.ts
import { createApi } from '@reduxjs/toolkit/query/react';
import baseQuery from '../BaseQuery';

// Interface pour les arguments de l'enregistrement
export interface RegisterShareArgs {
	resourceType: 'poi' | 'circuit';
	resourceId: string;
	platform: 'facebook' | 'twitter' | 'whatsapp' | 'link';
}

export interface ShareResponse {
	success: boolean;
	message: string;
	data?: {
		id: string;
		userId: number;
		resourceType: string;
		resourceId: string;
		platform: string;
		created_at: string;
		updated_at: string;
	};
}

export const shareApi = createApi({
	reducerPath: 'shareApi',
	baseQuery: baseQuery,
	tagTypes: ['Share'],
	endpoints: (builder) => ({
		// Enregistrer une action de partage
		registerShare: builder.mutation<ShareResponse, RegisterShareArgs>({
			query: (body) => ({
				url: 'api/shares/register',
				method: 'POST',
				body: body,
			}),
			invalidatesTags: ['Share'],
		}),
	}),
});

export const { useRegisterShareMutation } = shareApi;