'use client';

import React, { use, useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useGetAllThemesQuery } from '@/services/api/ThemeApi';
import { useGetAllCategoriesQuery } from '@/services/api/CategoryApi';
import { useGetAllCircuitsQuery } from '@/services/api/CircuitApi';
import { LoadingState } from '@/components/admin/shared/LoadingState';
import { ErrorState } from '@/components/admin/shared/ErrorState';
import { useRouter } from '@/i18n/navigation';
import Header from '@/components/header/header';
import Footer from '@/components/footer/footer';
import ThemeCard from '@/components/accueil/features/ThemeCard';
import { Search } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ThemesPageProps {
    params: Promise<{
        locale: string;
    }>;
}

export default function ThemesPage({ params }: ThemesPageProps) {
    const { locale } = use(params);
    const t = useTranslations();
    const tPage = useTranslations('ThemesPage');
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

    const isRTL = locale === 'ar';
    const dir = isRTL ? 'rtl' : 'ltr';

    // 1. Fetch All Required Data
    const { 
        data: themesData, 
        isLoading: isLoadingThemes, 
        isError: isThemesError, 
        error: themesError 
    } = useGetAllThemesQuery();

    const { 
        data: categoriesData, 
        isLoading: isLoadingCategories 
    } = useGetAllCategoriesQuery();

    // Fetch circuits to determine which themes belong to which categories (via POIs)
    const {
        data: circuitsData,
        isLoading: isLoadingCircuits
    } = useGetAllCircuitsQuery();

    const themes = themesData?.data || [];
    const activeThemes = themes.filter((theme: any) => theme.isActive);
    
    const categories = categoriesData?.data || [];
    const activeCategories = categories.filter((c: any) => c.isActive);
    
    const circuits = circuitsData?.data || [];

    // 2. Logic to map Themes to Categories based on their Circuits -> POIs
    // This replicates the logic from client/components/accueil/features/themes.tsx
    const themeCategories = useMemo(() => {
        const map = new Map<string, Set<string>>();
        
        circuits.forEach((circuit: any) => {
            if (circuit.themes && circuit.pois && circuit.pois.length > 0) {
                const circuitPOIs = circuit.pois;
                
                circuit.themes.forEach((theme: any) => {
                    if (!map.has(theme.id)) {
                        map.set(theme.id, new Set());
                    }
                    
                    // Add each POI's category to this theme
                    circuitPOIs.forEach((poi: any) => {
                        if (poi.category) {
                            map.get(theme.id)?.add(poi.category);
                        }
                    });
                });
            }
        });
        
        return map;
    }, [circuits]);

    // 3. Filter Themes
    const filteredThemes = useMemo(() => {
        return activeThemes.filter((theme: any) => {
            // --- Category Filter ---
            let matchesCategory = true;
            if (selectedCategoryId) {
                const categories = themeCategories.get(theme.id);
                // Show theme if it has the selected category OR if it has no categories yet (new/empty themes)
                matchesCategory = !categories || categories.size === 0 || categories.has(selectedCategoryId);
            }

            // --- Search Filter (Name/Description) ---
            let matchesSearch = true;
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase();
                
                // Helper to safely get localized string
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
                const description = theme[locale]?.desc || theme.fr?.desc || '';

                matchesSearch = nameFr.toLowerCase().includes(query) || 
                               nameEn.toLowerCase().includes(query) || 
                               nameAr.toLowerCase().includes(query) ||
                               description.toLowerCase().includes(query);
            }

            return matchesCategory && matchesSearch;
        });
    }, [activeThemes, searchQuery, selectedCategoryId, themeCategories, locale]);

    const handleThemeClick = (themeId: string) => {
        router.push(`/themes/${themeId}`);
    };

    const handleLanguageChange = (newLocale: "en" | "fr" | "ar") => {
        router.replace('/themes', { locale: newLocale });
    };

    const handleCategoryClick = (categoryId: string) => {
        // Toggle selection: if clicking the already selected category, deselect it.
        if (selectedCategoryId === categoryId) {
            setSelectedCategoryId(null);
        } else {
            setSelectedCategoryId(categoryId);
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

    if (isLoadingThemes || isLoadingCategories || isLoadingCircuits) {
        return <LoadingState message={tPage('loading') || 'Loading...'} />;
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
        <div className="min-h-screen bg-white roboto" dir={dir}>
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
                                className="roboto font-medium text-[18px] leading-[22px] text-[#007036] hover:underline"
                            >
                                {tPage('home') || 'Home'}
                            </button>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={isRTL ? 'rotate-180' : ''}>
                                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span className="roboto font-medium text-[18px] leading-[22px] text-black">
                                {tPage('themes') || 'Themes'}
                            </span>
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl md:text-[55px] font-regular mb-2 text-gray-900 leading-tight uppercase font-noodle">
                            <b>{tPage('title') || 'Explore Fez by Theme'}</b>
                        </h1>

                        {/* Subtitle and Search Bar Container */}
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                            <p className="hidden md:block roboto font-normal text-[22.5335px] leading-[38px] text-[#6A6A6A] flex-1">
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
                                        className="flex-1 roboto font-normal text-[16px] leading-[37px] text-left text-[#5B5B5B] bg-transparent border-none outline-none placeholder:text-[#5B5B5B] focus:outline-none ml-2"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Category Filter Pills */}
                        <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-4">
                            {activeCategories.map((category: any) => {
                                const categoryName = getCategoryName(category);
                                const isActive = selectedCategoryId === category.id;
                                
                                return (
                                    <button
                                        key={category.id}
                                        onClick={() => handleCategoryClick(category.id)}
                                        className={cn(
                                            `flex flex-row justify-center items-center px-4 py-[9.4px] gap-[9.4px] h-[43px] rounded-full border transition shadow-sm`,
                                            isActive 
                                                ? 'bg-emerald-600 border-emerald-600 text-white' 
                                                : 'bg-white border-[#EEEEEE] text-black hover:bg-gray-50'
                                        )}
                                    >
                                        <div className="w-5 h-5 relative">
                                            <Image 
                                                src={category.icon || '/images/MUSEUM.png'} 
                                                alt={categoryName} 
                                                fill 
                                                className={cn("object-contain", isActive ? 'brightness-0 invert' : '')} 
                                            />
                                        </div>
                                    <span className="roboto font-medium text-[15px] leading-[19px]">
                                            {categoryName}
                                        </span>
                                    </button>
                                );
                            })}
                            
                            {/* Clear Filters Button */}
                            {(selectedCategoryId || searchQuery) && (
                                <button 
                                    onClick={() => {
                                        setSearchQuery('');
                                        setSelectedCategoryId(null);
                                    }}
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
                        <p className="text-gray-500 text-lg roboto">
                            {searchQuery || selectedCategoryId
                                ? (tPage('noResults') || 'No themes found matching your search')
                                : (tPage('noThemes') || 'No themes available')
                            }
                        </p>
                        {/* Option to clear category if results are empty */}
                        {selectedCategoryId && (
                            <button
                                onClick={() => setSelectedCategoryId(null)}
                                className="mt-4 px-6 py-2 bg-[#007036] text-white rounded-full hover:bg-[#005a2b] transition-colors"
                            >
                                View all themes
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[21px]">
                        {filteredThemes.map((theme: any) => (
                            <ThemeCard
                                key={theme.id}
                                theme={theme}
                                currentLocale={locale}
                                onSelect={handleThemeClick}
                            />
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