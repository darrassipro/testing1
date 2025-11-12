'use client';

import { CalendarDays } from 'lucide-react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useGetPOICategoryDistributionQuery } from '@/services/api/StatisticsApi';
import { useEffect } from 'react';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

interface CategoryData {
  name: string;
  color: string;
  percentage: number;
}

interface POICategoryChartProps {
  categories?: CategoryData[];
}

export default function POICategoryChart({ categories }: POICategoryChartProps) {
  const { data: categoryData, isLoading, error } = useGetPOICategoryDistributionQuery();
  
  // Debug logging
  useEffect(() => {
    if (categoryData?.data) {
      console.log('📊 POI Category Distribution Data:', categoryData.data);
    }
    if (error) {
      console.error('❌ POI Category Distribution Error:', error);
      // Log full error details
      if ('status' in error && 'data' in error) {
        console.error('Error details:', { status: error.status, data: error.data });
      }
    }
  }, [categoryData, error]);
  
  // Use ONLY real data from API
  const displayCategories = categoryData?.data || categories || [];
  const hasData = displayCategories.length > 0;

  const chartData = {
    labels: displayCategories.map(cat => cat.name),
    datasets: [
      {
        data: displayCategories.map(cat => cat.percentage),
        backgroundColor: displayCategories.map(cat => cat.color),
        borderColor: '#fff',
        borderWidth: 3,
        hoverBorderWidth: 4,
        hoverOffset: 10,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#fff',
        titleColor: '#353535',
        bodyColor: '#6E6E6E',
        borderColor: '#E0E0E0',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        boxPadding: 6,
        callbacks: {
          label: function(context: any) {
            return context.label + ': ' + context.parsed + '%';
          }
        }
      },
    },
  };

  return (
    <div className="bg-white border border-[#E0E0E0] rounded-[19px] p-4 sm:p-6 lg:p-8 w-full h-auto min-h-[300px] sm:min-h-[350px] lg:h-[421px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8 lg:mb-[38px]">
        <h2 className="text-[#353535] font-semibold text-xl sm:text-2xl lg:text-[28px] leading-tight sm:leading-8 tracking-[-1px]">
          Catégories POI
        </h2>
        <button className="flex items-center gap-2 px-3 sm:px-4 py-2 border border-[#E0E0E0] rounded-lg hover:bg-gray-50 transition-colors">
          <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
          <span className="text-xs sm:text-[14px] text-gray-700">Last 30 days</span>
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-[200px]">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#003285]"></div>
            <div className="text-gray-500 text-sm">Chargement des catégories...</div>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-[200px]">
          <div className="text-red-500 text-sm">Erreur lors du chargement des données</div>
        </div>
      ) : !hasData ? (
        <div className="flex items-center justify-center h-[200px]">
          <div className="text-gray-500 text-sm">Aucune catégorie POI disponible</div>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8 lg:gap-12">
          {/* Donut Chart */}
          <div className="relative w-[160px] h-[160px] sm:w-[180px] sm:h-[180px] lg:w-[200px] lg:h-[200px] flex-shrink-0">
            <Doughnut data={chartData} options={options} />
          </div>

          {/* Legend */}
          <div className="flex flex-col gap-3 sm:gap-4 flex-1 w-full">
            {displayCategories.map((category, index) => (
              <div key={index} className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <div 
                    className="w-3 h-3 sm:w-4 sm:h-4 rounded-full transition-transform group-hover:scale-110 flex-shrink-0"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-sm sm:text-[16px] text-[#353535] font-medium group-hover:text-[#003285] transition-colors truncate">
                    {category.name}
                  </span>
                </div>
                <span className="text-sm sm:text-[16px] text-gray-600 font-medium ml-2 whitespace-nowrap">
                  {category.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
