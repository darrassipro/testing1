// client/app/[locale]/partners/[id]/page.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useGetPartnerByIdQuery } from '@/services/api/PartnerApi';

// Importer les composants
import { LoadingState } from '@/components/admin/shared/LoadingState';
import { ErrorState } from '@/components/admin/shared/ErrorState';
import { cloudinaryLoader } from '@/utils/cloudenary-loader';
import { Badge } from '@/components/ui/badge';
import { Building, Tag, MapPin, Globe } from 'lucide-react';

// Composant Map Placeholder (à remplacer par une vraie carte plus tard)
const MapPlaceholder: React.FC = () => (
	<div className="mt-6 flex h-64 items-center justify-center rounded-lg bg-gray-200 text-gray-500">
		(PartnerMap.tsx - Intégration Mapbox/Leaflet)
	</div>
);

export default function PartnerDetailPage() {
	const t = useTranslations('PartnerDetailPage');
	const params = useParams();
	const locale = params.locale as string;
	const partnerId = params.id as string;

	// Récupérer les données du partenaire
	const { data, isLoading, isError, error } = useGetPartnerByIdQuery(partnerId);

    if (isLoading) {
        return <LoadingState message={t('loading')} />;
    }

    if (isError || !data?.data) {
        console.error('Erreur chargement partenaire:', error);
        return <ErrorState error={error} onRetry={() => {}} />;
    }

	const partner = data.data;
	const logoUrl = partner.logo || '/images/SHOP.png';

	// Logique de localisation
	const name = partner[`name${locale.charAt(0).toUpperCase() + locale.slice(1)}` as
		| 'nameFr'
		| 'nameEn'
		| 'nameAr'] || partner.name;
	const description =
		partner[`description${locale.charAt(0).toUpperCase() + locale.slice(1)}` as
			| 'descriptionFr'
			| 'descriptionEn'
			| 'descriptionAr'] || partner.description;

	return (
		<div className="container mx-auto max-w-4xl px-4 py-8">
			{/* En-tête Partenaire */}
			<div className="flex flex-col items-center gap-6 md:flex-row">
				<div className="relative h-40 w-40 flex-shrink-0 overflow-hidden rounded-lg border bg-white shadow-sm">
					<Image
						loader={cloudinaryLoader}
						src={logoUrl}
						alt={name}
						layout="fill"
						objectFit="contain"
						className="p-4"
					/>
				</div>
				<div className="text-center md:text-left">
                    {(partner as any)?.category && (
                        <Badge variant="secondary" className="mb-2 w-fit">
                            {(partner as any).category}
                        </Badge>
                    )}
					<h1 className="text-3xl font-bold tracking-tight text-gray-900">
						{name}
					</h1>
					{partner.address && (
						<div className="mt-2 flex items-center justify-center gap-2 md:justify-start">
							<MapPin className="h-5 w-5 flex-shrink-0 text-gray-500" />
							<p className="text-base text-gray-700">{partner.address}</p>
						</div>
					)}
				</div>
			</div>

			{/* Description et Offre */}
			<div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3">
				<div className="md:col-span-2">
					<h2 className="text-xl font-semibold">{t('about')}</h2>
					<p className="prose prose-lg mt-4 max-w-none text-gray-700">
						{description || t('noDescription')}
					</p>
				</div>
                {(partner as any)?.discount && (
					<div className="rounded-lg border bg-green-50 p-6 ring-1 ring-inset ring-green-200">
						<h3 className="text-lg font-semibold text-green-800">
							{t('offerTitle')}
						</h3>
						<div className="mt-3 flex items-center gap-2">
							<Tag className="h-5 w-5 flex-shrink-0 text-green-600" />
							<p className="text-xl font-bold text-green-700">
                                {(partner as any).discount}
							</p>
						</div>
						<p className="mt-2 text-sm text-green-600">
							{t('offerHint')}
						</p>
					</div>
				)}
			</div>

            {/* Carte (si coordonnées disponibles) */}
            {(partner as any)?.coordinates && <MapPlaceholder />}
		</div>
	);
}