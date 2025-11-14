'use client';

import React, { use, useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useGetAllThemesQuery } from '@/services/api/ThemeApi';
import { useGetAllCategoriesQuery } from '@/services/api/CategoryApi'; // 1. Import Category API
import { LoadingState } from '@/components/admin/shared/LoadingState';
import { ErrorState } from '@/components/admin/shared/ErrorState';
import { useRouter } from '@/i18n/navigation';
import Header from '@/components/header/header';
import Footer from '@/components/footer/footer';
import ThemeCard from '@/components/accueil/features/ThemeCard';
import { Search } from 'lucide-react';
import Image from 'next/image'; // 2. Import Image for icons
import { cn } from '@/lib/utils'; // Optional: for better class merging

interface ThemesPageProps {
    params: Promise<{
        locale: string;
    }>;
}

export default function ThemesPage({ params }: ThemesPageProps) {
    const { locale } = use(params);
    const t = useTranslations(); // Using root 't' for filters
    const tPage = useTranslations('ThemesPage');
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');

    const isRTL = locale === 'ar';
    const dir = isRTL ? 'rtl' : 'ltr';

    const { 
        data: themesData, 
        isLoading: isLoadingThemes, 
        isError: isThemesError, 
        error: themesError 
    } = useGetAllThemesQuery();

    // 3. Fetch categories
    const { 
        data: categoriesData, 
        isLoading: isLoadingCategories 
    } = useGetAllCategoriesQuery();

    const themes = themesData?.data || [];
    const activeThemes = themes.filter((theme: any) => theme.isActive);
    const categories = categoriesData?.data || [];

    // Filter themes based on search query
    const filteredThemes = useMemo(() => {
        if (!searchQuery.trim()) return activeThemes;
        
        const query = searchQuery.toLowerCase();
        return activeThemes.filter((theme: any) => {
            const name = theme[locale]?.name?.name || theme.fr?.name?.name || '';
            const description = theme[locale]?.desc || theme.fr?.desc || '';
            
            // Parse category name if it's JSON
            const getLocName = (loc: any) => {
                if (!loc) return '';
                if (typeof loc === 'string') {
                    try { return JSON.parse(loc).name || ''; } catch(e) { return ''; }
                }
                return loc.name || '';
            };
            
            const nameFr = getLocName(theme.fr);
            const nameEn = getLocName(theme.en);
            const nameAr = getLocName(theme.ar);

            return nameFr.toLowerCase().includes(query) || 
                   nameEn.toLowerCase().includes(query) || 
                   nameAr.toLowerCase().includes(query) ||
                   description.toLowerCase().includes(query);
        });
    }, [activeThemes, searchQuery, locale]);

    const handleThemeClick = (themeId: string) => {
        router.push(`/themes/${themeId}`);
    };

    const handleLanguageChange = (newLocale: "en" | "fr" | "ar") => {
        router.replace('/themes', { locale: newLocale });
    };

    const handleCategoryClick = (category: any) => {
        const categoryName = category[locale]?.name || category.fr?.name || '';
        
        // If already selected, clear filter. Otherwise, set filter.
        if (searchQuery.toLowerCase() === categoryName.toLowerCase()) {
            setSearchQuery('');
        } else {
            setSearchQuery(categoryName);
        }
    };

    // Helper to safely get localized category name
    const getCategoryName = (category: any) => {
        const loc = category[locale] || category.fr;
        if (typeof loc === 'string') {
            try { return JSON.parse(loc).name; } catch (e) { return '...'; }
        }
        return loc?.name || '...';
    };

    if (isLoadingThemes || isLoadingCategories) {
        return <LoadingState message={tPage('loading') || 'Loading themes...'} />;
    }

    if (isThemesError) {
        return (
            <ErrorState
                error={(themesError as any)?.data?.message || tPage('error') || 'Error loading themes'}
                onRetry={() => {}}
            />
        );
    }

    return (
        <div className="min-h-screen bg-white" dir={dir}>
            <Header 
                locale={locale} 
                isRTL={isRTL} 
                onLanguageChange={handleLanguageChange}
            />
            
            <div className="h-[120px] md:h-[130px]"></div>
            
            <main className="max-w-[1453px] mx-auto px-4 sm:px-6 lg:px-16 py-8 md:py-12">
                <div className="flex flex-col gap-6 mb-8">
                    <div className="flex flex-col gap-4 md:max-w-[1290px]">
                        {/* Breadcrumb */}
                        <div className="hidden md:flex items-center gap-2">
                            <button 
                                onClick={() => router.push('/')}
                                className="font-['Inter'] font-medium text-[18px] leading-[22px] text-[#007036] hover:underline"
                            >
                                {tPage('home') || 'Home'}
                            </button>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={isRTL ? 'rotate-180' : ''}>
                                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span className="font-['Inter'] font-medium text-[18px] leading-[22px] text-black">
                                {tPage('themes') || 'Themes'}
                            </span>
                        </div>

                        {/* Title */}
                        <h1 className="font-['BigNoodleTitling'] font-normal text-[32px] leading-[38px] text-left text-black uppercase">
                            <b>{tPage('title') || 'Explore Fez by Theme'}</b>
                        </h1>

                        {/* Subtitle and Search Bar Container */}
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                            <p className="hidden md:block font-['Poppins'] font-normal text-[22.5335px] leading-[38px] text-[#6A6A6A] flex-1">
                                {tPage('subtitle') || 'Discover Fez with intelligent routes, immersive guides, and playful rewards'}
                            </p>

                            <div className="w-full md:w-[416px] flex-shrink-0">
                                <div className="flex items-center px-[18px] py-[18px] bg-white border border-[#EEEEEE] rounded-[272.346px] shadow-sm">
                                    <Search className="text-black flex-shrink-0" size={24} />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder={tPage('searchPlaceholder') || 'Search...'}
                                        className="flex-1 font-['Inter'] font-normal text-[16px] leading-[37px] text-left text-[#5B5B5B] bg-transparent border-none outline-none placeholder:text-[#5B5B5B] focus:outline-none ml-2"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 4. DYNAMIC FILTER PILLS */}
                        <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-4">
                            {categories.map((category: any) => {
                                const categoryName = getCategoryName(category);
                                const isActive = searchQuery.toLowerCase() === categoryName.toLowerCase();
                                
                                return (
                                    <button
                                        key={category.id}
                                        onClick={() => handleCategoryClick(category)}
                                        className={cn(
                                            `flex flex-row justify-center items-center px-4 py-[9.4px] gap-[9.4px] h-[43px] rounded-full border transition shadow-sm`,
                                            isActive 
                                                ? 'bg-emerald-600 border-emerald-600 text-white' 
                                                : 'bg-white border-[#EEEEEE] text-black hover:bg-gray-50'
                                        )}
                                    >
                                        <div className="w-5 h-5 relative">
                                            <Image 
                                                src={category.icon || '/images/MUSEUM.png'} // Use category icon or fallback
                                                alt={categoryName} 
                                                fill 
                                                className={cn("object-contain", isActive ? 'brightness-0 invert' : '')} 
                                            />
                                        </div>
                                        <span className="font-['Inter'] font-medium text-[15px] leading-[19px]">
                                            {categoryName}
                                        </span>
                                    </button>
                                );
                            })}
                            
                            {searchQuery && (
                                <button 
                                    onClick={() => setSearchQuery('')}
                                    className="text-sm text-red-500 hover:underline px-2 font-medium"
                                >
                                    ✕ {t('common.viewAll') || 'Clear'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Themes Grid */}
                {filteredThemes.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg font-['Poppins']">
                            {searchQuery 
                                ? (tPage('noResults') || 'No themes found matching your search')
                                : (tPage('noThemes') || 'No themes available')
                            }
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {Array.from({ length: Math.ceil(filteredThemes.length / 3) }).map((_, rowIndex) => (
                            <div 
                                key={rowIndex}
                                className="flex flex-col md:flex-row items-center gap-[21px] w-full"
                            >
                                {filteredThemes
                                    .slice(rowIndex * 3, (rowIndex + 1) * 3)
                                    .map((theme: any) => (
                                        <ThemeCard
                                            key={theme.id}
                                            theme={theme}
                                            currentLocale={locale}
                                            onSelect={handleThemeClick}
                                        />
                                    ))}
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <Footer 
                locale={locale} 
                isRTL={isRTL} 
                onLanguageChange={handleLanguageChange}
            />
        </div>
    );
}