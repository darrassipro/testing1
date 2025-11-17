"use client";

import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import { useRouter } from '@/i18n/navigation';
import { useGetAllCategoriesQuery } from '@/services/api/CategoryApi';

interface HeroProps {
  dir: string;
  isRTL: boolean;
}

const Hero = ({ dir, isRTL }: HeroProps) => {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const [imgError, setImgError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: categoriesData, isLoading: isLoadingCategories } = useGetAllCategoriesQuery();

  // Logic to send search query
  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/pois?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Logic to send Category AND Search Query (if it exists)
  const handleCategoryClick = (categoryId: string) => {
    const params = new URLSearchParams();
    params.set('category', categoryId);
    
    // If user has typed something, include it in the category filter
    if (searchQuery.trim()) {
      params.set('search', searchQuery.trim());
    }
    
    router.push(`/pois?${params.toString()}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getCategoryName = (category: any) => {
    if (!category) return '';
    let locData = category[locale] || category.fr || category.en || category.ar;
    if (typeof locData === 'string') {
      try {
        locData = JSON.parse(locData);
      } catch (e) {
        return 'Category';
      }
    }
    return locData?.name || 'Category';
  };

  const getCategoryIcon = (category: any) => {
    if (category.icon) return category.icon;
    const name = (getCategoryName(category) || '').toLowerCase();
    if (name.includes('restaurant')) return '/images/RESTAURANT.png';
    if (name.includes('coffee') || name.includes('café')) return '/images/COFFE-CUP.png';
    if (name.includes('shop') || name.includes('market') || name.includes('marché')) return '/images/SHOP.png';
    return '/images/MUSEUM.png';
  };

  const displayCategories = categoriesData?.data?.slice(0, 8) || [];

  return (
    <div className="relative w-full pt-[70px] md:pt-[80px] text-white overflow-hidden h-screen md:h-screen max-h-[900px] flex items-center justify-center">
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full">
        {!imgError ? (
          <Image
            src="/images/hero.jpg"
            alt="Fez Background"
            fill
            className="object-cover"
            priority
            onError={(e) => {
              console.error('Hero background image failed to load:', e);
              setImgError(true);
            }}
          />
        ) : (
          <div className="absolute inset-0 bg-gray-700 flex items-center justify-center text-white">
            Image failed to load
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-[#02355E]/30 via-[#02355E]/20 to-[#02355E]/40" />
      </div>

      {/* Hero Content */}
      <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-4xl lg:text-[75px] font-regular mb-5 md:mb-6 leading-[1.3] lg:leading-[1] uppercase font-noodle">
            {t('hero.discover')} <span className="text-emerald-400">{t('hero.fez')}</span>
            <span className="">{' ' + t('hero.through')}</span>
          </h1>
          <p className="text-base md:text-xl text-gray-100 mb-6 md:mb-7 leading-relaxed">
            {t('hero.subtitle')}
          </p>

          {/* Search Bar */}
          <div className="max-w-[600px] mx-auto mb-8">
            <div className={`relative bg-white rounded-full px-4 md:px-6 py-3 md:py-2 flex items-center gap-3 shadow-2xl ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Search className="text-gray-400 flex-shrink-0" size={20} />
              <input
                type="text"
                placeholder={t('hero.search')}
                className={`flex-1 bg-transparent text-gray-700 text-sm md:text-base focus:outline-none placeholder:text-gray-400 ${isRTL ? 'text-right' : 'text-left'}`}
                dir={dir}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                onClick={handleSearch}
                className="bg-emerald-600 text-white px-5 md:px-7 py-2 md:py-2 rounded-full font-semibold hover:bg-emerald-700 transition text-sm md:text-base whitespace-nowrap shadow-lg"
              >
                {t('hero.searchButton')}
              </button>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="w-full max-w-[1000px] mx-auto">
            <div className="flex flex-wrap justify-center items-center gap-3 px-2">
              {isLoadingCategories ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="flex flex-row justify-center items-center px-4 py-[9.4px] gap-[9.4px] h-[43px] w-32 bg-white/5 backdrop-blur-md rounded-full border border-white/10 animate-pulse">
                    <div className="w-6 h-6 bg-white/20 rounded-full"></div>
                    <div className="w-20 h-4 bg-white/20 rounded"></div>
                  </div>
                ))
              ) : (
                displayCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id)} // Updated handler
                    className="flex flex-row justify-center items-center px-4 py-[9.4px] gap-[9.4px] h-[43px] bg-white/10 backdrop-blur-md rounded-full border border-white/20 hover:bg-white/20 transition"
                  >
                    <div className="w-6 h-6 relative">
                      <Image
                        src={getCategoryIcon(category)}
                        alt={getCategoryName(category)}
                        fill
                        className="object-contain"
                        onError={(e) => { (e.target as HTMLImageElement).src = '/images/MUSEUM.png'; }}
                      />
                    </div>
                    <span className="font-['Inter'] font-medium text-base leading-[19px] text-white">
                      {getCategoryName(category)}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Hero;