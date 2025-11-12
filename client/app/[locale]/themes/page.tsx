'use client';

import React, { use, useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useGetAllThemesQuery } from '@/services/api/ThemeApi';
import { LoadingState } from '@/components/admin/shared/LoadingState';
import { ErrorState } from '@/components/admin/shared/ErrorState';
import { useRouter } from '@/i18n/navigation';
import Header from '@/components/header/header';
import Footer from '@/components/footer/footer';
import ThemeCard from '@/components/accueil/features/ThemeCard';

interface ThemesPageProps {
	params: Promise<{
		locale: string;
	}>;
}

export default function ThemesPage({ params }: ThemesPageProps) {
	const { locale } = use(params);
	const t = useTranslations('ThemesPage');
	const router = useRouter();
	const [searchQuery, setSearchQuery] = useState('');

	const isRTL = locale === 'ar';
	const dir = isRTL ? 'rtl' : 'ltr';

	const { 
		data: themesData, 
		isLoading, 
		isError, 
		error 
	} = useGetAllThemesQuery();

	const themes = themesData?.data || [];
	const activeThemes = themes.filter((theme: any) => theme.isActive);

	// Filter themes based on search query
	const filteredThemes = useMemo(() => {
		if (!searchQuery.trim()) return activeThemes;
		
		const query = searchQuery.toLowerCase();
		return activeThemes.filter((theme: any) => {
			const name = theme[locale]?.name || theme.fr?.name || '';
			const description = theme[locale]?.description || theme.fr?.description || '';
			return name.toLowerCase().includes(query) || description.toLowerCase().includes(query);
		});
	}, [activeThemes, searchQuery, locale]);

	const handleThemeClick = (themeId: string) => {
		router.push(`/pois?theme=${themeId}`);
	};

	const handleLanguageChange = (newLocale: "en" | "fr" | "ar") => {
		router.replace('/themes', { locale: newLocale });
	};

	if (isLoading) {
		return <LoadingState message={t('loading') || 'Loading themes...'} />;
	}

	if (isError) {
		return (
			<ErrorState
				error={(error as any)?.data?.message || t('error') || 'Error loading themes'}
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
			
			{/* Spacer for fixed header */}
			<div className="h-[120px] md:h-[130px]"></div>
			
			<main className="max-w-[1453px] mx-auto px-4 sm:px-6 lg:px-16 py-8 md:py-12">
				{/* Header Section - Frame 1000003102 */}
				   <div className="flex flex-col gap-6 mb-8">
					   {/* Frame 1000003100 - Title, Description, Search */}
					   <div className="flex flex-col gap-4 md:max-w-[1290px]">
						   {/* Breadcrumb - only visible on md and up */}
						   <div className="hidden md:flex items-center gap-2">
							   <button 
								   onClick={() => router.push('/')}
								   className="font-['Inter'] font-medium text-[18px] leading-[22px] text-[#007036] hover:underline"
							   >
								   {t('home') || 'Home'}
							   </button>
							   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={isRTL ? 'rotate-180' : ''}>
								   <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
							   </svg>
							   <span className="font-['Inter'] font-medium text-[18px] leading-[22px] text-black">
								   {t('themes') || 'Themes'}
							   </span>
						   </div>

						   {/* Title */}
						   <h1 className="font-['BigNoodleTitling'] font-normal text-[32px] leading-[38px] text-left text-black">
							   <b>{t('title') || 'Explore Fez by Theme'}</b>
						   </h1>

						   {/* Subtitle and Search Bar Container - on same line for md and up */}
						   <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
							   {/* Subtitle - only visible on md and up */}
							   <p className="hidden md:block font-['Poppins'] font-normal text-[22.5335px] leading-[38px] text-[#6A6A6A] flex-1">
								   {t('subtitle') || 'Discover Fez with intelligent routes, immersive guides, and playful rewards'}
							   </p>

							   {/* Search Bar */}
							   <div className="w-full md:w-[416px] flex-shrink-0">
								   <div className="flex items-center px-[18px] py-[18px] bg-white border border-[#EEEEEE] rounded-[272.346px] shadow-[-91px_60px_44px_rgba(163,163,163,0.01),-51px_34px_37px_rgba(163,163,163,0.05),-23px_15px_27px_rgba(163,163,163,0.09),-6px_4px_15px_rgba(163,163,163,0.1)]">
									   <svg width="27.55" height="27.55" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
										   <circle cx="11" cy="11" r="8" stroke="#000000" strokeWidth="1.83654" strokeLinecap="round" strokeLinejoin="round"/>
										   <path d="M21 21L16.65 16.65" stroke="#000000" strokeWidth="1.83654" strokeLinecap="round" strokeLinejoin="round"/>
									   </svg>
									   <input
										   type="text"
										   value={searchQuery}
										   onChange={(e) => setSearchQuery(e.target.value)}
										   placeholder={t('searchPlaceholder') || 'Search for restaurant,coffee ,shopping...'}
										   className="flex-1 font-['Inter'] font-normal text-[16px] leading-[37px] text-left text-[#5B5B5B] bg-transparent border-none outline-none placeholder:text-[#5B5B5B] focus:outline-none"
									   />
								   </div>
							   </div>
						   </div>

					   </div>
				   </div>

				{/* Frame 1000003125 - Themes Grid */}
				{filteredThemes.length === 0 ? (
					<div className="text-center py-12">
						<p className="text-gray-500 text-lg font-['Poppins']">
							{searchQuery 
								? (t('noResults') || 'No themes found matching your search')
								: (t('noThemes') || 'No themes available')
							}
						</p>
					</div>
				) : (
					<div className="flex flex-col gap-4">
						{/* Render all themes in rows of 3 */}
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