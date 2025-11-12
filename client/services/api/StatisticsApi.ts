// client/services/api/StatisticsApi.ts
import { createApi } from '@reduxjs/toolkit/query/react';
import baseQuery from '../BaseQuery.js';
import { POI } from '@/lib/types'; // Assuming POI type is sufficient here

// Interface for Overview Stats
interface OverviewStatsData {
	totalUsers: number;
	verifiedUsers: number;
	totalPois: number;
	verifiedPois: number;
	activeCircuits: number;
	customCircuits: number;
	totalReviews: number;
	activePartners: number;
	activeSubscriptions: number;
	totalThemes: number;
	totalPoints: number;
	newUsersThisMonth: number;
	newPoisThisWeek: number;
	newThemesThisMonth: number;
	completedCircuitsThisMonth: number;
}
interface OverviewStatsResponse {
	success: boolean;
	data: OverviewStatsData;
}

// Interface for User Growth Stats
interface UserGrowthData {
	labels: string[]; // Dates (YYYY-MM-DD)
	data: number[]; // Counts
}
interface UserGrowthResponse {
	success: boolean;
	data: UserGrowthData;
}

// Interface for Popular POIs
// (Using a simplified POI structure based on backend response)
interface PopularPoiData {
    id: string;
    name: string;
    rating: number;
    reviewCount: number;
    isVerified: boolean;
    isPremium: boolean;
    isActive: boolean;
}
interface PopularPoisResponse {
	success: boolean;
	data: PopularPoiData[];
}

// Interface for Theme Popularity
interface ThemePopularityData {
	name: string;
	color: string;
	circuitCount: number;
	percentage: number;
}
interface ThemePopularityResponse {
	success: boolean;
	data: ThemePopularityData[];
}

// Interface for POI Category Distribution
interface POICategoryData {
	name: string;
	color: string;
	count: number;
	percentage: number;
}
interface POICategoryDistributionResponse {
	success: boolean;
	data: POICategoryData[];
}


export const statisticsApi = createApi({
	reducerPath: 'statisticsApi',
	baseQuery: baseQuery,
	tagTypes: ['Stats'],
	endpoints: (builder) => ({
		// Get Overview Stats
		getOverviewStats: builder.query<OverviewStatsResponse, void>({
			query: () => 'api/stats/overview',
			providesTags: [{ type: 'Stats', id: 'OVERVIEW' }],
		}),

		// Get User Growth Stats
		getUserGrowth: builder.query<UserGrowthResponse, { days?: number }>({
			query: ({ days = 7 } = {}) => ({ // Default to 7 days if no arg provided
                url: 'api/stats/user-growth',
                params: { days }
            }),
			providesTags: [{ type: 'Stats', id: 'USER_GROWTH' }],
		}),

        // Get Popular POIs
        getPopularPois: builder.query<PopularPoisResponse, { limit?: number }>({
            query: ({ limit = 5 } = {}) => ({ // Default to 5 POIs
                url: 'api/stats/popular-pois',
                params: { limit }
            }),
            providesTags: [{ type: 'Stats', id: 'POPULAR_POIS' }],
        }),
		
		// Get Theme Popularity
		getThemePopularity: builder.query<ThemePopularityResponse, { limit?: number }>({
			query: ({ limit = 3 } = {}) => ({
				url: 'api/stats/theme-popularity',
				params: { limit }
			}),
			providesTags: [{ type: 'Stats', id: 'THEME_POPULARITY' }],
		}),
		
		// Get POI Category Distribution
		getPOICategoryDistribution: builder.query<POICategoryDistributionResponse, void>({
			query: () => 'api/stats/poi-category-distribution',
			providesTags: [{ type: 'Stats', id: 'POI_CATEGORY_DISTRIBUTION' }],
		}),
	}),
});

export const {
	useGetOverviewStatsQuery,
	useGetUserGrowthQuery,
    useGetPopularPoisQuery,
	useGetThemePopularityQuery,
	useGetPOICategoryDistributionQuery,
} = statisticsApi;