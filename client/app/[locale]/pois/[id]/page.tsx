// client/app/[locale]/pois/[id]/page.tsx
'use client';

import React, { use } from 'react';
import { useTranslations } from 'next-intl';
import { useGetPOIByIdQuery } from '@/services/api/PoiApi';

// Importer les composants
import POIDetailView from '@/components/pois/POIDetailView';
import { LoadingState } from '@/components/admin/shared/LoadingState';
import { ErrorState } from '@/components/admin/shared/ErrorState';

interface PoiDetailPageProps {
	params: Promise<{
		locale: string;
		id: string; // L'ID du POI vient de l'URL
	}>;
}

export default function PoiDetailPage({
	params: paramsPromise,
}: PoiDetailPageProps) {
	const { locale, id } = use(paramsPromise);
	const t = useTranslations('PoiDetailPage');

	// Récupérer les données du POI spécifique
	const { data, isLoading, isError, error } = useGetPOIByIdQuery(id);

	if (isLoading) {
		// --- FIX: 'text' changed to 'message' ---
		return <LoadingState message={t('loading')} />;
	}

	if (isError) {
		console.error('Erreur de chargement du POI:', error);
		// --- FIX: 'message' changed to 'error' ---
		return <ErrorState error={error || t('error')} onRetry={() => {}} />;
	}

	if (!data || !data.poi) {
		// --- FIX: 'message' changed to 'error' ---
		return <ErrorState error={t('notFound')} onRetry={() => {}} />;
	}

	return <POIDetailView poi={data.poi} locale={locale} />;
}