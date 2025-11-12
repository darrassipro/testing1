// client/app/[locale]/partners/page.tsx
'use client';

import React, { use } from 'react';
import { useTranslations } from 'next-intl';
import { useGetActivePartnersQuery } from '@/services/api/PartnerApi';
import PartnerCard from '@/components/partners/PartnerCard';

// Importer les composants de chargement/erreur
import { LoadingState } from '@/components/admin/shared/LoadingState';
import { ErrorState } from '@/components/admin/shared/ErrorState';
import { EmptyState } from '@/components/admin/shared/EmptyState';

interface PartnersPageProps {
    params: Promise<{
        locale: string;
    }>;
}

export default function PartnersPage({ params }: PartnersPageProps) {
    const { locale } = use(params);
	const t = useTranslations('PartnersPage');

	// Appel RTK Query pour récupérer les partenaires actifs
	const { data, isLoading, isError, error } = useGetActivePartnersQuery();

	const renderContent = () => {
        if (isLoading) {
            return <LoadingState message={t('loading')} />;
        }

        if (isError) {
            console.error('Erreur de chargement des partenaires:', error);
            return <ErrorState error={error} onRetry={() => {}} />;
        }

        if (!data || data.data.length === 0) {
            return <EmptyState title={t('noResults')} />;
        }

		return (
			<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{data.data.map((partner) => (
					<PartnerCard key={partner.id} partner={partner} locale={locale} />
				))}
			</div>
		);
	};

	return (
		<div className="container mx-auto max-w-7xl px-4 py-8">
			<header className="mb-8">
				<h1 className="text-3xl font-bold tracking-tight text-gray-900">
					{t('title')}
				</h1>
				<p className="mt-1 text-lg text-gray-600">{t('subtitle')}</p>
			</header>

			{/* TODO: Ajouter une carte (PartnerMap) et des filtres (par catégorie) */}

			<section>{renderContent()}</section>
		</div>
	);
}