// client/services/api/GamificationApi.ts
import { createApi } from '@reduxjs/toolkit/query/react';
import baseQuery from '../BaseQuery.js';
import { UserPoints, Badge, User } from '@/lib/types';

// Interface pour le profil de gamification
export interface GamificationProfileResponse {
	success: boolean;
	data: {
		points: UserPoints;
		badges: Badge[];
	};
}

// Interface pour le leaderboard
export interface LeaderboardEntry {
	totalPoints: number;
	level: number;
	user: Pick<User, 'firstName' | 'lastName' | 'profileImage'>;
}

export interface LeaderboardResponse {
	success: boolean;
	data: LeaderboardEntry[];
}

export const gamificationApi = createApi({
	reducerPath: 'gamificationApi',
	baseQuery: baseQuery,
	tagTypes: ['GamificationProfile', 'Leaderboard'],
	endpoints: (builder) => ({
		// Obtenir le profil de l'utilisateur connecté
		getGamificationProfile: builder.query<GamificationProfileResponse, void>({
			query: () => 'api/gamification/profile',
			providesTags: ['GamificationProfile'],
		}),

		// Obtenir le classement
		getLeaderboard: builder.query<LeaderboardResponse, { limit?: number }>({
			query: ({ limit = 10 }) => ({
				url: 'api/gamification/leaderboard',
				params: { limit },
			}),
			providesTags: ['Leaderboard'],
		}),
	}),
});

export const {
	useGetGamificationProfileQuery,
	useGetLeaderboardQuery,
} = gamificationApi;