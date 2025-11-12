'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

interface AppDownloadProps {
  isRTL: boolean;
}

export default function AppDownload({ isRTL }: AppDownloadProps) {
  const t = useTranslations();

  return (
    <div className="py-12 md:py-20 text-white relative overflow-hidden">
      <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`max-w-[1300px] mx-auto bg-[#02355E] rounded-[38px] px-8 md:px-16 py-8 md:py-12 flex flex-col lg:flex-row items-center justify-between gap-8 ${isRTL ? 'lg:flex-row-reverse' : ''} shadow-2xl`}>
          
          {/* Left Content Section */}
          <div className={`flex-1 text-center ${isRTL ? 'lg:text-right' : 'lg:text-left'} max-w-[737px]`}>
            <h2 className="text-2xl md:text-[40px] font-bold mb-3 md:mb-4 leading-tight bg-gradient-to-r from-white via-white to-emerald-400 bg-clip-text text-transparent">
              {t('download.title') || 'Explore Fez with GPS Guidance and 360° Tours'}
            </h2>
            <p className="text-white text-base md:text-xl mb-6 md:mb-8 leading-relaxed opacity-80">
              {t('download.description') || 'Experience Fez through interactive routes, GPS guidance, and immersive stories.'}
            </p>

            {/* Download Buttons */}
            <div className={`flex flex-wrap gap-4 justify-center ${isRTL ? 'lg:justify-end' : 'lg:justify-start'}`}>
              <button className="h-12 md:h-14 px-6 bg-white rounded-xl hover:bg-gray-100 transition flex items-center gap-2 shadow-md">
                <i className="fab fa-apple text-xl text-black" />
                <span className="text-black text-sm md:text-base font-semibold">
                  {t('download.appStore') || 'Download on the App Store'}
                </span>
              </button>

              <button className="h-12 md:h-14 px-6 bg-white rounded-xl hover:bg-gray-100 transition flex items-center gap-2 shadow-md">
                <i className="fab fa-google-play text-xl text-black" />
                <span className="text-black text-sm md:text-base font-semibold">
                  {t('download.googlePlay') || 'Get it on Google Play'}
                </span>
              </button>
            </div>
          </div>

          {/* Right Phone Mockup Section */}
          <div className="flex-shrink-0 relative w-full lg:w-auto mt-12 lg:mt-0">
            <div 
              className="relative w-full lg:w-[430px] mx-auto overflow-hidden"
              style={{
                backgroundImage: "url('/images/mobile-back.png')",
                backgroundSize: '120% auto',
                backgroundPosition: 'center top',
                backgroundRepeat: 'no-repeat',
                height: '215px', // show only top half on large screens
              }}
            >
              <img 
                src="/images/mobile-app-photo.png" 
                alt="Mobile App Screenshots"
                className="absolute top-0 left-0  w-full h-auto object-cover lg:object-top"
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
