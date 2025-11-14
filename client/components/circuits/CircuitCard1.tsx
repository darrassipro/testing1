// client/components/circuits/CircuitCard1.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import { Circuit } from '@/lib/types';
import { cloudinaryLoader } from '@/utils/cloudenary-loader';

interface CircuitCardProps {
  circuit: Circuit;
  locale: string;
  onClick?: () => void;
}

const CircuitCard1: React.FC<CircuitCardProps> = ({ circuit, locale, onClick }) => {
  const imageUrl = circuit.image || '/images/hero.jpg';
  
  // Helper to safely parse localized fields (handles both string/JSON and object)
  const getSafeLoc = (data: any, field: string) => {
    if (!data) return '';
    
    // Try to find the locale data
    const locData = data[locale] || data.fr || data.en || data.ar;
    
    if (!locData) return '';
    
    if (typeof locData === 'string') {
        try {
            const parsed = JSON.parse(locData);
            return parsed[field] || '';
        } catch (e) {
            // If it's a simple string, return it as the name
            return field === 'name' ? locData : '';
        }
    }
    return locData[field] || '';
  };

  const name = getSafeLoc(circuit, 'name') || 'Circuit Sans Nom';
  
  // Get category/theme name (safely)
  const categoryName = circuit.themes && circuit.themes.length > 0
    ? getSafeLoc(circuit.themes[0], 'name')
    : 'Circuit';

  // Rating (default to 4.7 if missing)
  const rating = (circuit as any).rating || 4.7;

  return (
    <div 
      onClick={onClick}
      className="relative w-full max-w-[416px] h-[450px] flex-shrink-0 cursor-pointer transition-transform hover:scale-[1.02] duration-300 bg-white"
      style={{
        border: '1px solid #EDEDED',
        boxShadow: '0px 17px 37px rgba(176, 176, 176, 0.1)',
        borderRadius: '0px 60px',
        overflow: 'hidden'
      }}
    >
      {/* Background Image */}
      <div className="absolute inset-0 h-[350px]">
        <Image
          loader={cloudinaryLoader}
          src={imageUrl}
          alt={name}
          fill
          className="object-cover"
          quality={80}
        />
        {/* Gradient Overlay */}
        <div 
          className="absolute inset-0" 
          style={{
            background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2))'
          }}
        />
      </div>

      {/* Rating Badge */}
      <div 
        className="absolute flex flex-row justify-center items-center"
        style={{
          left: '34px',
          top: '37px',
          padding: '11.8765px 13px',
          gap: '9.14px',
          width: '81.61px',
          height: '46.59px',
          background: '#08743E',
          borderRadius: '0px 18.2716px'
        }}
      >
        <div className="flex flex-row items-center gap-1">
          <svg width="23" height="23" viewBox="0 0 23 23" fill="none">
            <path d="M11.5 0L14.1 8.4H23L16.5 13.6L19.1 22L11.5 16.8L3.9 22L6.5 13.6L0 8.4H8.9L11.5 0Z" fill="#FFFFFF" />
          </svg>
          <span className="font-medium text-[15px] leading-[18px] text-white">
            {rating}
          </span>
        </div>
      </div>

      {/* Bottom Info Section */}
      <div 
        className="absolute bottom-0 left-0 w-full h-[140px] bg-white flex flex-col items-center pt-8"
        style={{ top: '310px' }} // Overlap slighty
      >
          {/* Category Name */}
          <p className="text-[#6A6A6A] text-[15px] font-normal leading-[24px] mb-2">
            {categoryName}
          </p>
          {/* Circuit Name */}
          <h3 className="text-black text-[18px] font-normal leading-[28px] text-center px-4 uppercase tracking-wide">
            {name}
          </h3>
      </div>
    </div>
  );
};

export default CircuitCard1;