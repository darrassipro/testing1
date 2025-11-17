import { createApi } from '@reduxjs/toolkit/query/react';
import baseQuery from '../BaseQuery';

// Review Type
export interface Review {
  id: string;
  userId: string;
  poiId: string;
  rating: number;
  comment?: string;
  status: 'pending' | 'accepted' | 'denied';
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
}

// Paginated Review Response
export interface PaginatedReviewResponse {
  success: boolean;
  data: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    reviews: Review[];
  };
}

// Get Reviews Params
export interface GetReviewsParams {
  poiId?: string;
  page?: number;
  limit?: number;
  status?: 'pending' | 'accepted' | 'denied';
}

// Create Review Args
export interface CreateReviewArgs {
  poiId: string;
  rating: number;
  comment?: string;
}

// Review Action Response
export interface ReviewActionResponse {
  success: boolean;
  message: string;
  data: Review;
}

export const reviewApi = createApi({
  reducerPath: 'reviewApi',
  baseQuery: baseQuery,
  tagTypes: ['Review', 'POI', 'PendingReviews'],
  endpoints: (builder) => ({
    // Get reviews for a POI (public - only accepted)
    getReviewsForPOI: builder.query<PaginatedReviewResponse, GetReviewsParams>({
      query: ({ poiId, page = 1, limit = 5 }) => ({
        url: `/api/reviews/poi/${poiId}`,
        method: 'GET',
        params: { page, limit },
      }),
      providesTags: (result, error, { poiId }) => [{ type: 'Review', id: poiId }],
    }),

    // Get user's own reviews
    getUserReviews: builder.query<PaginatedReviewResponse, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 10 }) => ({
        url: '/api/reviews/user/my-reviews',
        method: 'GET',
        params: { page, limit },
      }),
      providesTags: ['Review'],
    }),

    // Create a new review
    createReview: builder.mutation<Review, CreateReviewArgs>({
      query: ({ poiId, rating, comment }) => ({
        url: '/api/reviews',
        method: 'POST',
        body: {
          poiId,
          rating,
          comment: comment || undefined,
        },
      }),
      invalidatesTags: (result, error, { poiId }) => [
        { type: 'Review', id: poiId },
        'Review',
        { type: 'POI', id: poiId },
        { type: 'POI', id: 'LIST' },
      ],
    }),

    // Delete a review
    deleteReview: builder.mutation<{ success: boolean; message: string }, string>({
      query: (reviewId) => ({
        url: `/api/reviews/${reviewId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Review', 'PendingReviews', 'POI'],
    }),
  }),
});

export const {
  useGetReviewsForPOIQuery,
  useGetUserReviewsQuery,
  useCreateReviewMutation,
  useDeleteReviewMutation,
} = reviewApi;

export default reviewApi;
