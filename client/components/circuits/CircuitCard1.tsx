// Custom Circuit Card matching Figma design
'use client';

import React from 'react';
import Image from 'next/image';
import { Circuit } from '@/lib/types';
import { getLocalizedField } from '@/lib/utils';
import { cloudinaryLoader } from '@/utils/cloudenary-loader';

interface CircuitCardProps {
  circuit: Circuit;
  locale: 'en' | 'fr' | 'ar';
  onClick?: () => void;
}

const CircuitCard1: React.FC<CircuitCardProps> = ({ circuit, locale, onClick }) => {
  const imageUrl = circuit.image || '/images/hero.jpg';
  
  // Get localized fields
  const isCustomCircuit = !circuit.fr && !circuit.ar && !circuit.en;
  const name = isCustomCircuit 
    ? (circuit as any).name 
    : getLocalizedField(circuit, 'name', locale);
  
  // Get category/theme name
  const categoryName = circuit.themes && circuit.themes.length > 0
    ? getLocalizedField(circuit.themes[0], 'name', locale)
    : '';

  // Calculate average rating (placeholder - replace with actual rating if available)
  const rating = (circuit as any).rating || 4.7;

  return (
    <div 
      onClick={onClick}
      className="relative w-full max-w-[416px] h-[450px] flex-shrink-0 cursor-pointer transition-transform hover:scale-[1.02] duration-300"
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
          alt={name || 'Circuit'}
          fill
          className="object-cover "
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

      {/* Rating Badge - Frame 1000003102 */}
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
        {/* Frame 81 */}
        <div 
          className="flex flex-row items-center"
          style={{
            gap: '5.61px',
            width: '55.61px',
            height: '23px'
          }}
        >
          {/* Star 1 */}
          <svg width="23" height="23" viewBox="0 0 23 23" fill="none">
            <path d="M11.5 0L14.1 8.4H23L16.5 13.6L19.1 22L11.5 16.8L3.9 22L6.5 13.6L0 8.4H8.9L11.5 0Z" fill="#FFFFFF" />
          </svg>
          {/* Rating Text */}
          <span 
            className="font-['Inter']"
            style={{
              fontWeight: 500,
              fontSize: '15px',
              lineHeight: '18px',
              color: '#FFFFFF'
            }}
          >
            {rating}
          </span>
        </div>
      </div>

      {/* Rectangle 80 - Bottom Info Section */}
      <div 
        className="absolute"
        style={{
          left: 0,
          top: '280px',
          width: '100%',
          height: '140px',
          background: '#FFFFFF'
        }}
      >
        {/* Frame 1000003135 - Text Content */}
        <div 
          className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center"
          style={{
            top: '32px',
            gap: '8px'
          }}
        >
          {/* Category Name */}
          <p 
            className="font-['Inter'] text-center"
            style={{
              fontWeight: 400,
              fontSize: '15px',
              lineHeight: '24px',
              color: '#6A6A6A'
            }}
          >
            {categoryName}
          </p>
          {/* Circuit Name */}
          <h3 
            className="font-['BigNoodleTitling'] text-center px-4"
            style={{
              fontWeight: 400,
              fontSize: '18px',
              lineHeight: '44px',
              letterSpacing: '0.02em',
              color: '#000000'
            }}
          >
            {name}
          </h3>
        </div>
      </div>
    </div>
  );
};

export default CircuitCard1;
