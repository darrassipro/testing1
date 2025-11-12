'use client';

import { useGetThemePopularityQuery } from '@/services/api/StatisticsApi';
import { useEffect } from 'react';

interface ThemeBarProps {
  name: string;
  percentage: number;
  color: string;
}

function ThemeBar({ name, percentage, color }: ThemeBarProps) {
  return (
    <div className="flex flex-col gap-2 sm:gap-2.5 w-full group cursor-pointer">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-lg sm:text-xl lg:text-[22px] leading-tight sm:leading-8 text-black transition-colors truncate pr-4"
            style={{ color: `${color}` }}>
          {name}
        </h4>
        <span className="text-sm sm:text-[16px] font-semibold whitespace-nowrap"
              style={{ color: `${color}` }}>
          {percentage}%
        </span>
      </div>
      <div className="relative w-full h-2.5 sm:h-3">
        <div className="absolute inset-0 bg-[#D9D9D9] rounded-full" />
        <div 
          className="absolute top-0 left-0 h-2.5 sm:h-3 rounded-full transition-all duration-500 group-hover:opacity-80"
          style={{ 
            width: `${percentage}%`,
            backgroundColor: color
          }}
        />
      </div>
    </div>
  );
}

interface PopularThemesProps {
  themes?: Array<{
    name: string;
    percentage: number;
    color: string;
  }>;
}

export default function PopularThemes({ themes }: PopularThemesProps) {
  const { data: themeData, isLoading, error } = useGetThemePopularityQuery({ limit: 3 });
  
  // Debug logging
  useEffect(() => {
    if (themeData?.data) {
      console.log('📊 Theme Popularity Data:', themeData.data);
    }
    if (error) {
      console.error('❌ Theme Popularity Error:', error);
      // Log full error details
      if ('status' in error && 'data' in error) {
        console.error('Error details:', { status: error.status, data: error.data });
      }
    }
  }, [themeData, error]);
  
  // Use ONLY real data from API
  const displayThemes = themeData?.data || themes || [];
  const hasData = displayThemes.length > 0;

  return (
    <div className="bg-white border border-[#E0E0E0] rounded-[19px] p-4 sm:p-6 lg:p-8 h-auto min-h-[300px] sm:min-h-[350px] lg:h-[421px] w-full">
      <h2 className="text-[#353535] font-semibold text-xl sm:text-2xl lg:text-[28px] leading-tight sm:leading-8 tracking-[-1px] mb-6 sm:mb-8 lg:mb-[38px]">
        Thèmes les plus explorés
      </h2>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-[200px]">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#003285]"></div>
            <div className="text-gray-500 text-sm">Chargement des thèmes...</div>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-[200px]">
          <div className="text-red-500 text-sm">Erreur lors du chargement des données</div>
        </div>
      ) : !hasData ? (
        <div className="flex items-center justify-center h-[200px]">
          <div className="text-gray-500 text-sm">Aucun thème disponible pour le moment</div>
        </div>
      ) : (
        <div className="flex flex-col gap-6 sm:gap-8 lg:gap-[39px]">
          {displayThemes.map((theme, index) => (
            <ThemeBar 
              key={index} 
              name={theme.name} 
              percentage={theme.percentage}
              color={theme.color || '#FF7F3E'}
            />
          ))}
        </div>
      )}
    </div>
  );
}
