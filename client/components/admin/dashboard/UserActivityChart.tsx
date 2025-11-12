'use client';

import { Calendar } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface UserActivityChartProps {
  data?: {
    labels: string[];
    inscriptions: number[];
    circuitCreations: number[];
    poiAdditions: number[];
  };
}

export default function UserActivityChart({ data }: UserActivityChartProps) {
  // Default data if none provided
  const defaultData = {
    labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
    inscriptions: [10, 25, 15, 30],
    circuitCreations: [5, 15, 10, 20],
    poiAdditions: [8, 20, 12, 25]
  };

  const chartData = data || defaultData;

  const chartConfig = {
    labels: chartData.labels,
    datasets: [
      {
        label: 'Inscriptions',
        data: chartData.inscriptions,
        borderColor: '#003285',
        backgroundColor: 'transparent',
        borderWidth: 3,
        tension: 0.4,
        fill: false,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: '#003285',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
      {
        label: 'Créations de circuits',
        data: chartData.circuitCreations,
        borderColor: '#FF7F3E',
        backgroundColor: 'transparent',
        borderWidth: 3,
        tension: 0.4,
        fill: false,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: '#FF7F3E',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
      {
        label: 'Ajouts de POI',
        data: chartData.poiAdditions,
        borderColor: '#0FC89C',
        backgroundColor: 'transparent',
        borderWidth: 3,
        tension: 0.4,
        fill: false,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: '#0FC89C',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
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
        bodyFont: {
          size: 14,
        },
        titleFont: {
          size: 14,
          weight: 'bold' as const,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false,
        },
        ticks: {
          color: '#6E6E6E',
          font: {
            size: 13,
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false,
        },
        ticks: {
          color: '#6E6E6E',
          font: {
            size: 13,
          },
          stepSize: 10,
        },
      },
    },
  } as const;

  return (
    <div className="bg-white border border-[#E0E0E0] rounded-[19px] p-4 sm:p-6 lg:p-8 h-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <h2 className="text-[#353535] font-semibold text-xl sm:text-2xl lg:text-[28px] leading-8 tracking-[-1px]">
          Activité des utilisateurs
        </h2>
        
        <button className="flex items-center justify-center gap-2 px-3 py-2 bg-white border border-[#D9D9D9] rounded-md hover:bg-gray-50 transition-colors">
          <span className="font-semibold text-xs sm:text-[13.13px] leading-[27px] text-black">
            Last 30 days
          </span>
          <Calendar className="w-5 h-5 sm:w-[22.64px] sm:h-[22.64px] text-[#1F1F1F]" />
        </button>
      </div>

      {/* Chart Area - Responsive Height */}
      <div className="relative h-[200px] sm:h-[250px] lg:h-[280px] mb-6">
        <Line data={chartConfig} options={options} />
      </div>

      {/* Legend - Responsive Layout */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-center gap-4 sm:gap-8 lg:gap-16 mt-6 sm:mt-8">
        <div className="flex items-center gap-2.5">
          <div className="w-8 sm:w-12 h-2.5 sm:h-3 bg-[#003285] rounded-full" />
          <span className="font-medium text-sm sm:text-base text-black">Inscriptions</span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-8 sm:w-12 h-2.5 sm:h-3 bg-[#FF7F3E] rounded-full" />
          <span className="font-medium text-sm sm:text-base text-black">Créations de circuits</span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-8 sm:w-12 h-2.5 sm:h-3 bg-[#0FC89C] rounded-full" />
          <span className="font-medium text-sm sm:text-base text-black">Ajouts de POI</span>
        </div>
      </div>
    </div>
  );
}
