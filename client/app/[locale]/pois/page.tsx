// client/app/[locale]/pois/page.tsx
'use client';

import React, { useState, use } from 'react';
import { useTranslations } from 'next-intl';
import { useGetFilteredPOIsQuery, GetPOIsParams } from '@/services/api/PoiApi';

// Importer les composants que nous avons créés
import POIFilters from '@/components/pois/POIFilters';
import POICard from '@/components/pois/POICard';
import PaginationControls from '@/components/shared/PaginationControls';

// Importer les composants de chargement/erreur (supposés exister)
import { LoadingState } from '@/components/admin/shared/LoadingState';
import { ErrorState } from '@/components/admin/shared/ErrorState';
import { EmptyState } from '@/components/admin/shared/EmptyState';

// Interface pour les paramètres de la page
interface PoisPageProps {
	params: Promise<{
		locale: string;
	}>;
}

export default function PoisPage({ params }: PoisPageProps) {
	const { locale } = use(params);
	const t = useTranslations('PoisPage');

	// État pour les filtres, incluant la page
	const [filters, setFilters] = useState<GetPOIsParams>({ page: 1, limit: 12 });

	// Appel RTK Query avec l'état des filtres
	const { data, isLoading, isError, error } = useGetFilteredPOIsQuery(filters);

	// Gérer le changement de filtres depuis le composant enfant
	const handleFilterChange = (newFilters: Omit<GetPOIsParams, 'page'>) => {
		setFilters((prev) => ({
			...prev,
			...newFilters,
			page: 1, // Réinitialiser à la page 1 à chaque changement de filtre
		}));
	};

	// Gérer le changement de page
	const handlePageChange = (newPage: number) => {
		setFilters((prev) => ({
			...prev,
			page: newPage,
		}));
	};

	// Gérer l'affichage du contenu
	const renderContent = () => {
		if (isLoading) {
			return <LoadingState message={t('loading')} />;
		}

		if (isError) {
			console.error('Erreur de chargement des POIs:', error);
			return <ErrorState error={t('error')} onRetry={() => {}} />; // Idéalement, relancer la requête
		}

		if (!data || data.data.pois.length === 0) {
			return <EmptyState title={t('noPois')} />;
		}

		return (
			<>
				<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{data.data.pois.map((poi) => (
						<POICard key={poi.id} poi={poi} locale={locale} />
					))}
				</div>
				<PaginationControls
					currentPage={data.data.currentPage}
					totalPages={data.data.totalPages}
					onPageChange={handlePageChange}
				/>
			</>
		);
	};

	return (
		<div className="container mx-auto max-w-7xl px-4 py-8">
			<header className="mb-6">
				<h1 className="text-3xl font-bold tracking-tight text-gray-900">
					{t('title')}
				</h1>
				<p className="mt-1 text-lg text-gray-600">{t('subtitle')}</p>
			</header>

			{/* Section des filtres */}
			<section className="mb-8">
				<POIFilters locale={locale} onFilterChange={handleFilterChange} />
			</section>

			{/* Section de la grille des POIs */}
			<section>{renderContent()}</section>
		</div>
	);
}