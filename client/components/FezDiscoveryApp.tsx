"use client"

import React, { useState, useRef, useEffect } from 'react';
import { Search, Menu, X, MapPin, Clock, Star, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { useGetAllThemesQuery } from '@/services/api/ThemeApi';
import { useGetAllCircuitsQuery } from '@/services/api/CircuitApi';
import { useGetAllCategoriesQuery } from '@/services/api/CategoryApi';
import Image from 'next/image';

const mockFeatures = [
  { icon: "route", titleKey: "features.routes.title", descriptionKey: "features.routes.description", color: "bg-emerald-600" },
  { icon: "audio", titleKey: "features.audio.title", descriptionKey: "features.audio.description", color: "bg-emerald-600" },
  { icon: "key", titleKey: "features.rewards.title", descriptionKey: "features.rewards.description", color: "bg-emerald-600" },
  { icon: "offline", titleKey: "features.offline.title", descriptionKey: "features.offline.description", color: "bg-emerald-600" }
];

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸', country: 'USA' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', country: 'France' },
  { code: 'ar', name: 'العربية', flag: '🇲🇦', country: 'Morocco' }
];

const LanguageDropdown = ({ locale, onLanguageChange }: { locale: string; onLanguageChange: (lang: 'en' | 'fr' | 'ar') => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const currentLang = languages.find(lang => lang.code === locale) || languages[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition text-white"
      >
        <span className="text-xl">{currentLang.flag}</span>
        <span className="hidden md:inline text-sm font-medium">{currentLang.name}</span>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow-xl overflow-hidden min-w-[200px] z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                onLanguageChange(lang.code as 'en' | 'fr' | 'ar');
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition ${
                locale === lang.code ? 'bg-blue-50' : ''
              }`}
            >
              <span className="text-2xl">{lang.flag}</span>
              <div className="flex flex-col items-start">
                <span className={`text-sm font-medium ${locale === lang.code ? 'text-blue-600' : 'text-gray-900'}`}>
                  {lang.name}
                </span>
                <span className="text-xs text-gray-500">{lang.country}</span>
              </div>
              {locale === lang.code && (
                <span className="ml-auto text-blue-600">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const FeatureIcon = ({ icon, color }: { icon: string; color: string }) => {
  const iconMap: Record<string, React.ReactElement> = {
    route: (
      <svg className="w-6 h-6 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    ),
    audio: (
      <svg className="w-6 h-6 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    key: (
      <svg className="w-6 h-6 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
      </svg>
    ),
    offline: (
      <svg className="w-6 h-6 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  };

  return (
    <div className={`w-12 h-16 md:w-14 md:h-20 ${color} rounded-lg flex items-center justify-center shadow-lg border-4 border-emerald-600/20`}>
      {iconMap[icon]}
    </div>
  );
};

interface ExploreCardProps {
  item: any;
  selected: string | null;
  onSelect: (id: string) => void;
  currentLocale: string;
}

const ExploreCard: React.FC<ExploreCardProps> = ({ item, selected, onSelect, currentLocale }) => {
  const [isHovered, setIsHovered] = useState(false);
  const t = useTranslations();
  const isSelected = selected === item.id;

  // Extract title based on locale
  let title = '';
  try {
    if (item[currentLocale]) {
      const localization = typeof item[currentLocale] === 'string' ? JSON.parse(item[currentLocale]) : item[currentLocale];
      title = localization.name || localization.title || '';
    }
  } catch (e) {
    title = 'Untitled';
  }

  // Calculate stops (POIs)
  const stops = item.pois?.length || 0;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelect(item.id)}
      className={`relative rounded-none overflow-hidden cursor-pointer transition-all duration-300 flex-shrink-0 ${
        isHovered || isSelected ? 'w-80 md:w-[474px]' : 'w-64 md:w-[291px]'
      } h-80 md:h-[388px] group shadow-xl`}
    >
      <div className="absolute inset-0">
        <img 
          src={item.image || 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=800'} 
          alt={title} 
          className="w-full h-full object-cover" 
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,33,59,0.5)] via-[rgba(0,33,59,0)] to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-5 md:p-7 text-white">
        <h3 className="text-lg md:text-2xl font-bold mb-2 tracking-tight">{title}</h3>
        {(isHovered || isSelected) && (
          <div className="flex items-center gap-3 md:gap-4 text-xs md:text-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
            <span className="flex items-center gap-1">
              <MapPin size={16} />
              {stops} {t('card.stops')}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={16} />
              {item.duration ? `${item.duration}h` : '2-3h'}
            </span>
            <span className="flex items-center gap-1">
              <Star size={16} fill="currentColor" />
              {item.rating || 4.7}
            </span>
          </div>
        )}
      </div>
      <div className="absolute top-4 md:top-7 right-4 md:right-7 bg-white rounded-full px-3 md:px-4 py-1 md:py-1.5 text-black text-xs md:text-base font-medium flex items-center gap-2">
        <span>{t('card.viewRoutes')}</span>
        <ChevronRight size={16} />
      </div>
    </div>
  );
};

export default function FezDiscoveryApp() {
  const t = useTranslations();
  const locale = useLocale() as 'en' | 'fr' | 'ar';
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [selectedCircuit, setSelectedCircuit] = useState<string | null>(null);

  // API Calls
  const { data: themesData, isLoading: themesLoading, error: themesError } = useGetAllThemesQuery();
  const { data: circuitsData, isLoading: circuitsLoading, error: circuitsError } = useGetAllCircuitsQuery();
  const { data: categoriesData } = useGetAllCategoriesQuery();

  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const isRTL = locale === 'ar';

  // Extract data or use empty array
  const themes = themesData?.data || [];
  const circuits = circuitsData?.data || [];

  // Language switch handler
  const switchLocale = (newLocale: 'en' | 'fr' | 'ar') => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <div className="min-h-screen bg-white" dir={dir}>
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-[#02355E] z-50">
        <div className="border-b border-white/20">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-3 text-center">
            <p className="text-white text-xs md:text-base font-semibold">
              Explore Fez like never before — Download the GO-FEZ App today!
            </p>
          </div>
        </div>
        <div className="border-b border-white/20">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16 md:h-20">
              <div className={`hidden lg:flex items-center gap-6 flex-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <a href="#" className="text-white hover:text-white/80 transition text-sm md:text-base font-medium">{t('nav.home')}</a>
                <a href="#" className="text-white hover:text-white/80 transition text-sm md:text-base font-medium">{t('nav.routes')}</a>
                <a href="#" className="text-white hover:text-white/80 transition text-sm md:text-base font-medium">{t('nav.pois')}</a>
                <a href="#" className="text-white hover:text-white/80 transition text-sm md:text-base font-medium">{t('nav.rewards')}</a>
                <a href="#" className="text-white hover:text-white/80 transition text-sm md:text-base font-medium">{t('nav.partners')}</a>
                <a href="#" className="text-white hover:text-white/80 transition text-sm md:text-base font-medium">{t('nav.contact')}</a>
              </div>
              <div className="flex-shrink-0">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-[#02355E] flex items-center justify-center">
                  <span className="text-white font-bold text-xl md:text-2xl">G</span>
                </div>
              </div>
              <div className={`hidden lg:flex items-center gap-4 flex-1 ${isRTL ? 'flex-row-reverse' : 'justify-end'}`}>
                <LanguageDropdown locale={locale} onLanguageChange={switchLocale} />
                <button className="px-5 py-2.5 text-sm text-white font-semibold hover:bg-white/10 transition rounded-lg">
                  {t('auth.login')}
                </button>
                <button className="px-5 py-2.5 text-sm bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition font-semibold">
                  {t('auth.signup')}
                </button>
              </div>
              <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden p-2 text-white">
                {menuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>
        {menuOpen && (
          <div className="lg:hidden bg-[#02355E] border-t border-white/20">
            <div className="px-4 py-6 space-y-4">
              <a href="#" className="block text-white font-medium py-2">{t('nav.home')}</a>
              <a href="#" className="block text-white font-medium py-2">{t('nav.routes')}</a>
              <a href="#" className="block text-white font-medium py-2">{t('nav.pois')}</a>
              <a href="#" className="block text-white font-medium py-2">{t('nav.rewards')}</a>
              <a href="#" className="block text-white font-medium py-2">{t('nav.partners')}</a>
              <a href="#" className="block text-white font-medium py-2">{t('nav.contact')}</a>
              <div className="pt-4 border-t border-white/20">
                <LanguageDropdown locale={locale} onLanguageChange={switchLocale} />
              </div>
              <button className="w-full px-6 py-3 text-white font-semibold border border-white rounded-lg">
                {t('auth.login')}
              </button>
              <button className="w-full px-6 py-3 bg-emerald-600 text-white rounded-full font-semibold">
                {t('auth.signup')}
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div className="relative mt-[108px] md:mt-[140px] bg-[#02355E] text-white overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/images/hero-fez-bg.jpg"
            alt="Fez Background"
            fill
            className="object-cover opacity-30"
            priority
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#02355E]/80 via-[#02355E]/70 to-[#02355E]/90" />
        </div>

        {/* Dot Pattern */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 opacity-5">
            {[...Array(100)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
              />
            ))}
          </div>
        </div>

        <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[57px] font-bold mb-4 md:mb-6 leading-tight tracking-tight">
              {t('hero.discover')} <span className="text-white">{t('hero.fez')}</span>
              <br />
              <span className="text-2xl sm:text-3xl md:text-4xl">{t('hero.through')}</span>
            </h1>
            <p className="text-base md:text-[22.5px] text-[#EDEDED] mb-6 md:mb-8 leading-relaxed">
              {t('hero.subtitle')}
            </p>
            <div className="max-w-[587px] mx-auto mb-5">
              <div className={`relative bg-white rounded-full px-4 md:px-7 py-3 md:py-4 flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Search className="text-gray-400 flex-shrink-0" size={20} />
                <input
                  type="text"
                  placeholder={t('hero.search')}
                  className={`flex-1 bg-transparent text-gray-600 text-sm md:text-base focus:outline-none placeholder:text-gray-400 ${isRTL ? 'text-right' : 'text-left'}`}
                  dir={dir}
                />
                <button className="bg-emerald-600 text-white px-4 md:px-6 py-2 md:py-2.5 rounded-full font-semibold hover:bg-emerald-700 transition text-sm md:text-base whitespace-nowrap">
                  {t('hero.searchButton')}
                </button>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-2 md:gap-3">
              <button className="px-4 md:px-5 py-2 md:py-2.5 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition text-sm md:text-base font-medium">
                {t('filters.museums')}
              </button>
              <button className="px-4 md:px-5 py-2 md:py-2.5 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition text-sm md:text-base font-medium">
                {t('filters.restaurants')}
              </button>
              <button className="px-4 md:px-5 py-2 md:py-2.5 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition text-sm md:text-base font-medium">
                {t('filters.monuments')}
              </button>
              <button className="px-4 md:px-5 py-2 md:py-2.5 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition text-sm md:text-base font-medium">
                {t('filters.markets')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 md:py-20 bg-gradient-to-b from-white to-white">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-16">
            <h2 className="text-3xl md:text-[40px] font-semibold mb-2 text-black leading-tight">
              {t('featuresSection.title')}
            </h2>
            <p className="text-[#6A6A6A] text-base md:text-[22.5px] leading-relaxed">
              {t('featuresSection.subtitle')}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-4">
            {mockFeatures.map((feature, index) => (
              <div key={index} className="bg-white border border-[rgba(0,112,54,0.15)] rounded-tr-[40px] p-6 md:p-7 text-center hover:shadow-lg transition-shadow">
                <div className="mx-auto mb-8 md:mb-10 flex justify-center">
                  <FeatureIcon icon={feature.icon} color={feature.color} />
                </div>
                <h3 className="text-xl md:text-2xl font-semibold mb-3 text-black">
                  {t(feature.titleKey)}
                </h3>
                <p className="text-black text-base md:text-xl leading-relaxed">
                  {t(feature.descriptionKey)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Explore by Theme */}
      <div className="py-12 md:py-20 bg-white">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex items-center justify-between mb-8 md:mb-10 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <h2 className="text-2xl md:text-[40px] font-semibold text-black leading-tight">
              {t('exploreTheme.title')}
            </h2>
            <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <button className="p-2 md:p-4 bg-white border border-[#D9D9D9] rounded-full hover:bg-gray-50 transition" aria-label="Previous">
                <ChevronLeft size={24} className={isRTL ? 'rotate-180' : ''} />
              </button>
              <button className="p-2 md:p-4 bg-white border border-[#D9D9D9] rounded-full hover:bg-gray-50 transition" aria-label="Next">
                <ChevronRight size={24} className={isRTL ? 'rotate-180' : ''} />
              </button>
            </div>
          </div>
          {themesLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
              <p className="text-gray-500 mt-4">Loading themes...</p>
            </div>
          ) : themesError ? (
            <div className="text-center py-12">
              <p className="text-red-500">Error loading themes</p>
            </div>
          ) : themes.length > 0 ? (
            <div className="overflow-x-auto pb-4 -mx-4 px-4">
              <div className={`flex gap-4 md:gap-5 min-w-max ${isRTL ? 'flex-row-reverse' : ''}`}>
                {themes.filter(t => t.isActive).map((item) => (
                  <ExploreCard
                    key={item.id}
                    item={item}
                    selected={selectedTheme}
                    onSelect={setSelectedTheme}
                    currentLocale={locale}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No themes available</p>
            </div>
          )}
        </div>
      </div>

      {/* Explore by Circuit */}
      <div className="py-12 md:py-20 bg-white">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex items-center justify-between mb-8 md:mb-10 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <h2 
              onClick={() => router.push('/circuits')}
              className="text-2xl md:text-[40px] font-semibold text-black leading-tight cursor-pointer hover:text-blue-600 transition-colors"
            >
              {t('exploreCircuit.title')}
            </h2>
            <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <button className="p-2 md:p-4 bg-white border border-[#D9D9D9] rounded-full hover:bg-gray-50 transition" aria-label="Previous">
                <ChevronLeft size={24} className={isRTL ? 'rotate-180' : ''} />
              </button>
              <button className="p-2 md:p-4 bg-white border border-[#D9D9D9] rounded-full hover:bg-gray-50 transition" aria-label="Next">
                <ChevronRight size={24} className={isRTL ? 'rotate-180' : ''} />
              </button>
            </div>
          </div>
          {circuitsLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
              <p className="text-gray-500 mt-4">Loading circuits...</p>
            </div>
          ) : circuitsError ? (
            <div className="text-center py-12">
              <p className="text-red-500">Error loading circuits</p>
            </div>
          ) : circuits.length > 0 ? (
            <div className="overflow-x-auto pb-4 -mx-4 px-4">
              <div className={`flex gap-5 min-w-max ${isRTL ? 'flex-row-reverse' : ''}`}>
                {circuits.filter(c => c.isActive).map((item) => (
                  <ExploreCard
                    key={item.id}
                    item={item}
                    selected={selectedCircuit}
                    onSelect={setSelectedCircuit}
                    currentLocale={locale}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No circuits available</p>
            </div>
          )}
        </div>
      </div>

      {/* App Download Section */}
      <div className="py-12 md:py-20 bg-[#02355E] text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} top-0 w-[491px] h-full opacity-30`}>
            <div
              className="w-full h-full"
              style={{
                backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.03) 35px, rgba(255,255,255,.03) 70px)`,
              }}
            />
          </div>
        </div>
        <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`max-w-[1300px] mx-auto bg-[#02355E] rounded-[38px] px-8 md:px-16 py-8 md:py-12 flex flex-col lg:flex-row items-center justify-between gap-8 ${isRTL ? 'lg:flex-row-reverse' : ''}`}>
            <div className={`flex-1 text-center ${isRTL ? 'lg:text-right' : 'lg:text-left'} max-w-[737px]`}>
              <h2 className="text-2xl md:text-[32px] font-bold mb-3 md:mb-4 leading-tight bg-gradient-to-r from-white to-emerald-600 bg-clip-text text-transparent">
                {t('download.title')}
              </h2>
              <p className="text-white text-base md:text-xl mb-6 md:mb-8 leading-relaxed">
                {t('download.description')}
              </p>
              <div className={`flex flex-wrap gap-3 justify-center ${isRTL ? 'lg:justify-end' : 'lg:justify-start'}`}>
                <button className="h-12 md:h-14 px-6 bg-white rounded-lg hover:bg-gray-100 transition flex items-center gap-2">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  <span className="text-black text-sm md:text-base font-semibold">{t('download.appStore')}</span>
                </button>
                <button className="h-12 md:h-14 px-6 bg-white rounded-lg hover:bg-gray-100 transition flex items-center gap-2">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                  </svg>
                  <span className="text-black text-sm md:text-base font-semibold">{t('download.googlePlay')}</span>
                </button>
              </div>
            </div>
            <div className="flex-shrink-0 relative">
              <div className="relative w-48 md:w-64">
                <div className="relative z-10">
                  <div className="w-full aspect-[9/19] bg-gray-900 rounded-[3rem] shadow-2xl p-2 md:p-3 border-4 md:border-8 border-gray-800">
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 rounded-[2.5rem] flex items-center justify-center overflow-hidden relative">
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 md:p-6 text-white">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-full flex items-center justify-center mb-3 md:mb-4">
                          <span className="text-blue-600 font-bold text-2xl md:text-3xl">G</span>
                        </div>
                        <h3 className="text-lg md:text-xl font-bold mb-2">GO FEZ</h3>
                        <p className="text-blue-100 text-xs md:text-sm text-center">
                          {t('download.appPreview')}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1/3 h-5 md:h-7 bg-gray-900 rounded-b-2xl" />
                </div>
                <div className="absolute inset-0 bg-blue-400 blur-3xl opacity-20 -z-10" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#F4FAFF] py-12 md:py-16">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-[1218px] mx-auto">
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-12 ${isRTL ? 'text-right' : 'text-left'}`}>
              <div className="lg:col-span-1">
                <div className={`flex items-center gap-3 mb-6 bg-[#02355E] rounded-[22px] p-4 w-fit ${isRTL ? 'mr-auto' : ''}`}>
                  <div className="w-10 h-16 flex items-center justify-center">
                    <span className="text-white font-bold text-2xl">G</span>
                  </div>
                </div>
                <p className="text-black text-base md:text-xl leading-relaxed mb-4">
                  {t('footer.description')}
                </p>
              </div>
              <div>
                <h3 className="font-medium text-xl mb-6 md:mb-8 text-black tracking-tight">{t('footer.links')}</h3>
                <ul className="space-y-3 md:space-y-4">
                  <li><a href="#" className="text-[#6A6A6A] hover:text-black transition text-base">{t('nav.home')}</a></li>
                  <li><a href="#" className="text-[#6A6A6A] hover:text-black transition text-base">{t('nav.routes')}</a></li>
                  <li><a href="#" className="text-[#6A6A6A] hover:text-black transition text-base">{t('nav.pois')}</a></li>
                  <li><a href="#" className="text-[#6A6A6A] hover:text-black transition text-base">{t('nav.rewards')}</a></li>
                  <li><a href="#" className="text-[#6A6A6A] hover:text-black transition text-base">{t('nav.partners')}</a></li>
                  <li><a href="#" className="text-[#6A6A6A] hover:text-black transition text-base">{t('nav.contact')}</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-xl mb-6 md:mb-8 text-black tracking-tight">Links</h3>
                <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                  <a href="#" className="w-10 h-10 bg-[#0A5A9A] rounded-full flex items-center justify-center hover:bg-[#084a7d] transition">
                    <svg className="w-5 h-5" fill="white" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                  <a href="#" className="w-10 h-10 bg-[#0A5A9A] rounded-full flex items-center justify-center hover:bg-[#084a7d] transition">
                    <svg className="w-5 h-5" fill="white" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                  </a>
                  <a href="#" className="w-10 h-10 bg-[#0A5A9A] rounded-full flex items-center justify-center hover:bg-[#084a7d] transition">
                    <svg className="w-5 h-5" fill="white" viewBox="0 0 24 24">
                      <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
                    </svg>
                  </a>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-xl mb-6 md:mb-8 text-black tracking-tight">{t('footer.language')}</h3>
                <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                  {([
                    { lang: 'en', label: 'En' },
                    { lang: 'fr', label: 'Fr' },
                    { lang: 'ar', label: 'Ar' }
                  ] as const).map(({ lang, label }) => (
                    <button
                      key={lang}
                      onClick={() => switchLocale(lang)}
                      className={`px-4 py-1 rounded-full border transition ${
                        locale === lang
                          ? 'bg-white text-black border-[#D9D9D9]'
                          : 'bg-transparent text-[#6A6A6A] border-[#D9D9D9] hover:bg-white/50'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="pt-8 border-t border-black/10 text-center">
              <p className="text-black text-sm md:text-base">{t('footer.copyright')}</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}