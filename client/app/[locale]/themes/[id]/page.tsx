// client/app/[locale]/themes/[id]/page.tsx
'use client';

import React, { useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useGetThemeByIdQuery } from "@/services/api/ThemeApi";
import { useDebounce } from "@/hooks/useDebounce";
import Header from "@/components/header/header";
import Footer from "@/components/footer/footer";
import CircuitCard1 from '@/components/circuits/CircuitCard1';
import { ChevronRight, Search, Loader2, Check } from 'lucide-react';

export default function ThemeDetailPage() {
  const { id, locale } = useParams() as { id: string; locale: string };
  const router = useRouter();
  const t = useTranslations("ThemePage");
  const dir = locale === "ar" ? "rtl" : "ltr";

  // --- FILTER STATES ---
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<'newest' | 'popular'>('newest');
  const [isWalking, setIsWalking] = useState(false);
  const [isShortDistance, setIsShortDistance] = useState(false);
  const [isMedina, setIsMedina] = useState(false);

  const debouncedSearch = useDebounce(search, 500);
  const effectiveSearch = isMedina ? 'Medina' : debouncedSearch;

  // --- API QUERY ---
  const {
    data,
    isLoading,
    isError,
  } = useGetThemeByIdQuery({
    id,
    params: {
        search: effectiveSearch || undefined,
        sortBy: sortBy,
        maxDistance: isShortDistance ? 2 : undefined,
        transportMode: isWalking ? 'walking' : undefined
    }
  });

  const theme = data?.data;
  const circuits = theme?.circuits || [];

  const getThemeLoc = () => {
    if (!theme) return { name: '...', description: '' };
    const raw = (theme as any)[locale] || (theme as any).fr;
    if (typeof raw === 'string') {
        try { return JSON.parse(raw); } catch(e) { return { name: raw }; }
    }
    return raw || {};
  };
  const themeInfo = getThemeLoc();

  const FilterButton = ({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) => (
    <div 
      onClick={onClick}
      className={`flex flex-row justify-center items-center cursor-pointer transition px-[22px] py-[13px] border-[2px] rounded-[160px] 
      ${active 
        ? 'bg-[#08743E] border-[#08743E] text-white' 
        : 'bg-white border-[#EEEEEE] text-black hover:bg-gray-50'}`}
    >
      <span className="font-medium text-[16px] md:text-[22px] whitespace-nowrap">
        {label}
      </span>
      {active && <Check className="ml-3 w-5 h-5" />}
    </div>
  );

  return (
    <div className="min-h-screen bg-white flex flex-col" dir={dir}>
      {/* ✅ FIX: Pass required props to Header */}
      <Header 
        locale={locale}
        isRTL={dir === 'rtl'}
        onLanguageChange={(newLocale) => router.push(`/${newLocale}/themes/${id}`)}
      />

      <div className="h-[100px] md:h-[120px]"></div>
  
      <main className="max-w-[1453px] mx-auto px-4 sm:px-6 lg:px-16 py-8 md:py-12 w-full">
        <div className="w-full md:max-w-[1290px] mx-auto">
          
          {/* --- HEADER SECTION --- */}
          <div className="flex flex-col gap-6 mb-12">
            <div className="hidden md:flex items-center gap-2 text-[18px]">
              <button onClick={() => router.push(`/${locale}/`)} className="text-[#007036] hover:underline font-medium">
                {t('home') || 'Home'}
              </button>
              <ChevronRight className={`w-5 h-5 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
              <span className="font-medium text-black">
                {t('themes') || 'Circuits'}
              </span>
            </div>

            <h1 className="font-normal text-[32px] md:text-[64px] leading-[1.1] text-black uppercase" style={{ fontFamily: 'BigNoodleTitling, sans-serif' }}>
              {themeInfo.name || 'Theme'}
            </h1>
            <p className="hidden md:block text-[22px] text-[#6A6A6A] max-w-4xl">
              {themeInfo.description || 'Discover Fez through curated routes designed to reveal hidden stories.'}
            </p>

            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mt-4">
              <div className="flex flex-wrap gap-3">
                <FilterButton 
                    label="Most Popular" 
                    active={sortBy === 'popular'} 
                    onClick={() => setSortBy(prev => prev === 'popular' ? 'newest' : 'popular')} 
                />
                <FilterButton 
                    label="Walking" 
                    active={isWalking} 
                    onClick={() => setIsWalking(!isWalking)} 
                />
                <FilterButton 
                    label="Medina" 
                    active={isMedina} 
                    onClick={() => {
                        setIsMedina(!isMedina);
                        setSearch(""); 
                    }} 
                />
                <FilterButton 
                    label="< 2 km" 
                    active={isShortDistance} 
                    onClick={() => setIsShortDistance(!isShortDistance)} 
                />
              </div>

              <div className="w-full xl:w-[416px]">
                <div className="flex items-center px-5 py-4 bg-white border border-[#EEEEEE] rounded-full shadow-sm hover:shadow-md transition-shadow">
                  <Search className="w-6 h-6 text-black" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setIsMedina(false); 
                    }}
                    placeholder={t('searchPlaceholder') || 'Search for restaurant, coffee...'}
                    className="flex-1 ml-3 text-[16px] bg-transparent border-none outline-none placeholder:text-[#5B5B5B]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* --- CONTENT GRID --- */}
          {isLoading ? (
            <div className="flex justify-center py-20">
                <Loader2 className="w-12 h-12 animate-spin text-[#007036]" />
            </div>
          ) : isError ? (
            <div className="text-center py-20 text-red-500">
                <h2 className="text-2xl font-bold mb-2">{t('errorTitle') || 'Error'}</h2>
                <p>{t('errorMessage') || 'Unable to load circuits.'}</p>
            </div>
          ) : circuits.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-xl">
                {t("noCircuitsMessage") || 'No circuits match your criteria.'}
              </p>
              <button 
                onClick={() => {
                    setSearch("");
                    setIsMedina(false);
                    setIsWalking(false);
                    setIsShortDistance(false);
                    setSortBy('newest');
                }}
                className="mt-4 text-[#007036] underline"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 justify-items-center">
                {circuits.map((circuit: any) => (
                    <CircuitCard1
                        key={circuit.id} 
                        circuit={circuit} 
                        locale={locale as any}
                        onClick={() => router.push(`/${locale}/circuits/${circuit.id}`)}
                    />
                ))}
            </div>
          )}

        </div>
      </main>
      
      {/* ✅ FIX: Pass required props to Footer if needed (assuming similar pattern) */}
      <Footer
        locale={locale}
        isRTL={dir === "rtl"}
        onLanguageChange={(newLocale) => router.push(`/${newLocale}/themes/${id}`)}
      />
    </div>
  );
}