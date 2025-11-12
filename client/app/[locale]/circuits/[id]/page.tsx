// client/app/[locale]/circuits/[id]/page.tsx
'use client';

import React, { use } from 'react';	
import { useTranslations } from 'next-intl';
import { useGetCircuitByIdQuery } from '@/services/api/CircuitApi';
import { useGetCustomCircuitByIdQuery } from '@/services/api/CustomCircuitApi';
import { useRouter } from '@/i18n/navigation';

// Importer les composants
import ReadOnlyCircuitMap from '@/components/map/ReadOnlyCircuitMap';
import { LoadingState } from '@/components/admin/shared/LoadingState';
import { ErrorState } from '@/components/admin/shared/ErrorState';
import Header from '@/components/header/header';

interface CircuitDetailPageProps {
	params: Promise<{
		locale: string;
		id: string; // L'ID du circuit
	}>;
}

export default function CircuitDetailPage({
	params,
}: CircuitDetailPageProps) {
	const { locale, id } = use(params);
	const t = useTranslations('CircuitDetailPage');
	const router = useRouter();

	// Try to fetch as regular circuit first
	const { 
		data: regularCircuitData, 
		isLoading: isLoadingRegular, 
		isError: isErrorRegular 
	} = useGetCircuitByIdQuery(id);
	
	// If regular circuit fails, try custom circuit
	const { 
		data: customCircuitData, 
		isLoading: isLoadingCustom, 
		isError: isErrorCustom,
		error: customError 
	} = useGetCustomCircuitByIdQuery(id, {
		skip: !isErrorRegular, // Only fetch if regular circuit fails
	});

	// Determine which data to use
	const isCustomCircuit = isErrorRegular && !isErrorCustom;
	const data = isCustomCircuit ? customCircuitData : regularCircuitData;
	const isLoading = isLoadingRegular || (isErrorRegular && isLoadingCustom);
	const isError = isErrorRegular && isErrorCustom;
	const error = isErrorRegular ? customError : undefined;

	const circuit = data?.data;

	if (isLoading) {
		return <LoadingState message={t('loading')} />;
	}

	if (isError || !circuit) {
		console.error('Erreur de chargement du circuit:', error);
		return <ErrorState error={error} onRetry={() => {}} />;
	}

	// Handle both regular circuits and custom circuits
	// Regular circuits have localized fields (fr, ar, en)
	// Custom circuits have direct name and description fields
	const circuitAny = circuit as any;
	const hasLocalizedFields = circuitAny.fr || circuitAny.ar || circuitAny.en;
	
	let name: string;
	let description: string;
	
	if (hasLocalizedFields) {
		// Regular circuit
		const localeData = circuitAny[locale as 'fr' | 'en' | 'ar'];
		const frData = circuitAny.fr;
		
		name = (typeof localeData === 'object' && localeData?.name)
			? localeData.name 
			: (typeof frData === 'object' && frData?.name)
				? frData.name
				: 'Circuit';
				
		description = (typeof localeData === 'object' && localeData?.description)
			? localeData.description 
			: (typeof frData === 'object' && frData?.description)
				? frData.description
				: '';
	} else {
		// Custom circuit
		name = circuitAny.name || 'Circuit';
		description = circuitAny.description || '';
	}
	
	const imageUrl = circuitAny.image || '/images/hero.jpg';

    return (
        <div className="w-full h-screen">
			{(() => {
				const isRTL = locale === 'ar';
				const onLanguageChange = (lang: 'en' | 'fr' | 'ar') => {
					try {
						router.push(`/${lang}/circuits/${id}`);
					} catch {}
				};
				return (
					<Header
						locale={locale}
						isRTL={isRTL}
						onLanguageChange={onLanguageChange}
					/>
				);
			})()}
			<main className="pt-12 md:pt-[120px]">
				<ReadOnlyCircuitMap pois={circuit.pois || []} locale={locale} circuit={circuit} />
			</main>
        </div>
    );
}