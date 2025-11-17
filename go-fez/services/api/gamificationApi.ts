import { createApi } from '@reduxjs/toolkit/query/react';
import baseQuery from '../BaseQuery';

// Gamification Rule Type
export interface GamificationRule {
  id: string;
  name: string;
  description: string;
  points: number;
  icon?: string;
  category: string;
  isActive: boolean;
  created_at: string;
  updated_at: string;
}

// User Gamification Type
export interface UserGamification {
  id: string;
  userId: string;
  gamificationRuleId: string;
  points: number;
  isClaimed: boolean;
  createdAt: string;
  updatedAt: string;
  gamificationRule?: GamificationRule;
}

// Leaderboard Entry
export interface LeaderboardEntry {
  totalPoints: number;
  level: number;
  rank?: number;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
}

// User Profile with Gamification
export interface UserGamificationProfile {
  totalPoints: number;
  level: number;
  rank?: number;
  unclaimedRewards: UserGamification[];
  recentActivities: UserGamification[];
}

// API Responses
export interface GamificationProfileResponse {
  success: boolean;
  data: UserGamificationProfile;
}

export interface LeaderboardResponse {
  success: boolean;
  data: LeaderboardEntry[];
}

export interface GamificationHistoryResponse {
  success: boolean;
  data: UserGamification[];
}

export interface ClaimRewardResponse {
  success: boolean;
  message: string;
  data?: UserGamification;
}

export const gamificationApi = createApi({
  reducerPath: 'gamificationApi',
  baseQuery: baseQuery,
  tagTypes: ['GamificationProfile', 'Leaderboard', 'GamificationHistory'],
  endpoints: (builder) => ({
    // Get user gamification profile
    getGamificationProfile: builder.query<GamificationProfileResponse, void>({
      query: () => ({
        url: '/api/gamification/profile',
        method: 'GET',
      }),
      providesTags: ['GamificationProfile'],
    }),

    // Get leaderboard
    getLeaderboard: builder.query<LeaderboardResponse, { limit?: number }>({
      query: ({ limit = 10 }) => ({
        url: '/api/gamification/leaderboard',
        method: 'GET',
        params: { limit },
      }),
      providesTags: ['Leaderboard'],
    }),

    // Get user gamification history
    getGamificationHistory: builder.query<GamificationHistoryResponse, void>({
      query: () => ({
        url: '/api/gamification/history',
        method: 'GET',
      }),
      providesTags: ['GamificationHistory'],
    }),

    // Complete a gamification task
    completeGamificationTask: builder.mutation<ClaimRewardResponse, { gamificationRuleName: string }>({
      query: (body) => ({
        url: '/api/gamification/complete-gamification',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['GamificationProfile', 'GamificationHistory'],
    }),

    // Claim a gamification reward
    claimGamificationReward: builder.mutation<ClaimRewardResponse, { taskId: string }>({
      query: (body) => ({
        url: '/api/gamification/claim-gamification',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['GamificationProfile', 'GamificationHistory', 'Leaderboard'],
    }),
  }),
});

export const {
  useGetGamificationProfileQuery,
  useGetLeaderboardQuery,
  useGetGamificationHistoryQuery,
  useCompleteGamificationTaskMutation,
  useClaimGamificationRewardMutation,
} = gamificationApi;

export default gamificationApi;
