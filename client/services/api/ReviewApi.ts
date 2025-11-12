// client/services/api/ReviewApi.ts
import { createApi } from '@reduxjs/toolkit/query/react';
import baseQuery from '../BaseQuery';
import { Review } from '@/lib/types'; // Assurez-vous que le type Review existe

// Interface pour la réponse paginée des avis
export interface PaginatedReviewResponse {
	success: boolean;
	data: {
		totalItems: number;
		totalPages: number;
		currentPage: number;
		reviews: Review[];
	};
}

// Interface pour les arguments de la pagination
export interface GetReviewsParams {
	poiId?: string;
	page?: number;
	limit?: number;
	status?: 'pending' | 'accepted' | 'denied';
}

// Interface pour la création d'un avis
export interface CreateReviewArgs {
	poiId: string;
	rating: number;
	comment?: string;
	photos?: File[]; // Pour une implémentation future
}

// Interface pour approve/deny responses
export interface ReviewActionResponse {
	success: boolean;
	message: string;
	data: Review;
}

export const reviewApi = createApi({
	reducerPath: 'reviewApi',
	baseQuery: baseQuery,
	tagTypes: ['Review', 'POI', 'PendingReviews'], // Nous taguons aussi POI car la note du POI change
	endpoints: (builder) => ({
		// Récupérer les avis pour un POI (public - only accepted)
		getReviewsForPOI: builder.query<
			PaginatedReviewResponse,
			GetReviewsParams
		>({
			query: ({ poiId, page = 1, limit = 5 }) => ({
				url: `api/reviews/poi/${poiId}`,
				params: { page, limit },
			}),
			providesTags: (result, error, { poiId }) => [
				{ type: 'Review', id: poiId },
			],
		}),

		// Get user's own reviews
		getUserReviews: builder.query<PaginatedReviewResponse, { page?: number; limit?: number }>({
			query: ({ page = 1, limit = 10 }) => ({
				url: 'api/reviews/user/my-reviews',
				params: { page, limit },
			}),
			providesTags: ['Review'],
		}),

		// ADMIN: Get pending/all reviews
		getPendingReviews: builder.query<PaginatedReviewResponse, GetReviewsParams>({
			query: ({ page = 1, limit = 10, status = 'pending' }) => ({
				url: 'api/reviews/admin/pending',
				params: { page, limit, status },
			}),
			providesTags: ['PendingReviews'],
		}),

		// ADMIN: Approve a review
		approveReview: builder.mutation<ReviewActionResponse, string>({
			query: (reviewId) => ({
				url: `api/reviews/admin/approve/${reviewId}`,
				method: 'PUT',
			}),
			invalidatesTags: ['PendingReviews', 'Review'],
		}),

		// ADMIN: Deny a review
		denyReview: builder.mutation<ReviewActionResponse, { reviewId: string; reason: string }>({
			query: ({ reviewId, reason }) => ({
				url: `api/reviews/admin/deny/${reviewId}`,
				method: 'PUT',
				body: { reason },
			}),
			invalidatesTags: ['PendingReviews', 'Review'],
		}),

		// Créer un nouvel avis
		createReview: builder.mutation<Review, CreateReviewArgs>({
			query: ({ poiId, rating, comment }) => ({
				url: 'api/reviews',
				method: 'POST',
				body: { 
					poiId, 
					rating, 
					comment: comment || undefined 
				},
			}),
			invalidatesTags: (result, error, { poiId }) => [
				{ type: 'Review', id: poiId },
				'Review', // Invalidate all reviews including user's own reviews
				{ type: 'POI', id: poiId }, // Invalider le POI pour rafraîchir la note
				{ type: 'POI', id: 'LIST' }, // Invalider la liste des POIs
			],
		}),

		// Delete a review
		deleteReview: builder.mutation<{ success: boolean; message: string }, string>({
			query: (reviewId) => ({
				url: `api/reviews/${reviewId}`,
				method: 'DELETE',
			}),
			invalidatesTags: ['Review', 'PendingReviews', 'POI'],
		}),
	}),
});

export const { 
	useGetReviewsForPOIQuery, 
	useGetUserReviewsQuery,
	useGetPendingReviewsQuery,
	useApproveReviewMutation,
	useDenyReviewMutation,
	useCreateReviewMutation,
	useDeleteReviewMutation,
} = reviewApi;