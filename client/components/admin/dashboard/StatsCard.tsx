'use client';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  isPositive?: boolean;
}

export default function StatsCard({ title, value, subtitle, isPositive = true }: StatsCardProps) {
  return (
    <div className="bg-white border border-[#E0E0E0] rounded-[14px] w-full h-[140px] sm:h-[155px] 
      hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer p-4 sm:p-5">
      {/* Content Container */}
      <div className="flex flex-col items-start gap-3 sm:gap-4 h-full">
        {/* Title Row */}
        <div className="flex flex-row items-center w-full">
          <h3 className="font-inter font-medium text-sm sm:text-base leading-tight sm:leading-[25px] text-[#353535] truncate">
            {title}
          </h3>
        </div>
        
        {/* Value and Subtitle */}
        <div className="flex flex-col justify-end items-start gap-1 w-full flex-1">
          <p className="font-inter font-semibold text-2xl sm:text-[30px] leading-tight sm:leading-[32px] tracking-[-1px] text-[#353535]">
            {value}
          </p>
          <p className={`font-inter font-medium text-xs sm:text-[14.5476px] leading-tight sm:leading-[25px] ${
            isPositive ? 'text-[#028A43]' : 'text-[#6E6E6E]'
          } truncate w-full`}>
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}

