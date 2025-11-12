'use client';

import StatsCard from '@/components/admin/dashboard/StatsCard';
import UserActivityChart from '@/components/admin/dashboard/UserActivityChart';
import PopularThemes from '@/components/admin/dashboard/PopularThemes';
import POICategoryChart from '@/components/admin/dashboard/POICategoryChart';
import { useGetOverviewStatsQuery, useGetUserGrowthQuery } from '@/services/api/StatisticsApi';
import { useGetAllRoutesQuery } from '@/services/api/RouteApi';
import { Calendar, Download } from 'lucide-react';
import { useState } from 'react';

export default function AdminDashboard() {
  const { data: statsResponse, isLoading } = useGetOverviewStatsQuery();
  const { data: userGrowthResponse } = useGetUserGrowthQuery({ days: 30 });
  const { data: routesResponse } = useGetAllRoutesQuery({ page: 1, limit: 1 });
  
  const stats = statsResponse?.data;
  const totalRoutes = routesResponse?.pagination?.total || 0;
  
  const [dateRange, setDateRange] = useState('Last 30 days');

  // Format activity data for the chart
  const activityData = {
    labels: userGrowthResponse?.data?.labels?.slice(-7).map((date) => {
      const d = new Date(date);
      return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    }) || ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
    inscriptions: userGrowthResponse?.data?.data?.slice(-7) || [10, 25, 15, 30, 22, 35, 28],
    circuitCreations: [5, 15, 10, 20, 12, 18, 15],
    poiAdditions: [8, 20, 12, 25, 18, 28, 22]
  };
  
  // Calculate percentage changes
  const calculatePercentage = (current: number, previous: number) => {
    if (previous === 0) return '+100';
    const change = ((current - previous) / previous) * 100;
    return change > 0 ? `+${change.toFixed(0)}` : change.toFixed(0);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white -m-8">
      {/* Main Content */}
      <div className="px-4 sm:px-6 md:px-8 lg:px-[60px] py-4 sm:py-6 md:py-8">
        {/* Header Section */}
        <div className="flex flex-col gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Title and Filters */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-black font-semibold text-xl sm:text-2xl leading-[29px]">
              Tableau de bord
            </h1>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-1 w-full sm:w-auto">
              {/* Date Range Picker */}
              <button className="flex flex-row justify-center items-center px-3 py-2 gap-2 bg-white border border-[#D9D9D9] rounded-md hover:bg-gray-50 transition-colors">
                <span className="font-semibold text-xs sm:text-[13.13px] leading-[27px] text-[#1F1F1F]">
                  06 Oct 2025 - 07 Oct 2025
                </span>
                <Calendar className="w-5 h-5 sm:w-[22.64px] sm:h-[22.64px] text-[#1F1F1F]" />
              </button>
              
              {/* Last 30 Days */}
              <button className="flex flex-row justify-center items-center px-3 py-2 gap-2 bg-white border border-[#D9D9D9] rounded-md hover:bg-gray-50 transition-colors">
                <span className="font-semibold text-xs sm:text-[13.13px] leading-[27px] text-[#1F1F1F]">
                  {dateRange}
                </span>
                <Calendar className="w-5 h-5 sm:w-[22.64px] sm:h-[22.64px] text-[#1F1F1F]" />
              </button>
              
              {/* Export Button */}
              <button className="flex flex-row justify-center items-center px-3 py-2 gap-2 bg-white border border-[#D9D9D9] rounded-md hover:bg-gray-50 transition-colors">
                <Download className="w-4 h-4 sm:w-[15.73px] sm:h-[15.73px] text-[#1F1F1F]" />
                <span className="font-semibold text-xs sm:text-[13.13px] leading-[27px] text-[#1F1F1F]">
                  Export
                </span>
              </button>
            </div>
          </div>

          {/* Stats Cards Grid - Responsive 6 Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-[7px]">
            <StatsCard
              title="Utilisateurs inscrits"
              value={stats?.totalUsers?.toLocaleString() || '0'}
              subtitle={`+${stats?.newUsersThisMonth || 0} ce mois`}
              isPositive={true}
            />
            <StatsCard
              title="Circuits actifs"
              value={stats?.activeCircuits?.toString() || '0'}
              subtitle={`+5 nouveaux`}
              isPositive={true}
            />
            <StatsCard
              title="Routes complétées"
              value={totalRoutes?.toLocaleString() || '0'}
              subtitle={`Circuits & Navigation`}
              isPositive={true}
            />
            <StatsCard
              title="Points d'intérêt"
              value={stats?.totalPois?.toString() || '0'}
              subtitle={`+${stats?.newPoisThisWeek || 0} ajoutés cette semaine`}
              isPositive={true}
            />
            <StatsCard
              title="Thèmes disponibles"
              value={stats?.totalThemes?.toString() || '0'}
              subtitle={`+${stats?.newThemesThisMonth || 0} nouveaux thèmes`}
              isPositive={true}
            />
            <StatsCard
              title="Points attribués totaux"
              value={stats?.totalPoints?.toLocaleString() || '0'}
              subtitle="cumulés par les utilisateurs"
              isPositive={false}
            />
          </div>
        </div>

        {/* Activity Chart */}
        <div className="mb-6 sm:mb-8">
          <UserActivityChart data={activityData} />
        </div>

        {/* Bottom Row: Popular Themes + POI Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          <PopularThemes />
          <POICategoryChart />
        </div>
      </div>
    </div>
  );
}
