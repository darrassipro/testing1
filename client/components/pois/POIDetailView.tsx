// client/components/pois/POIDetailView.tsx
'use client';

import React from 'react';
import { POI } from '@/lib/types';
import { useTranslations } from 'next-intl';

// Les composants que nous avons créés
import MediaGallery from './MediaGallery';
import AudioPlayer from './AudioPlayer';
import POIRating from './POIRating';
import ReviewList from '../social/ReviewList'; // NOUVEL IMPORT
import ReviewForm from '../social/ReviewForm'; // NOUVEL IMPORT
import ShareButtons from '../social/ShareButtons'; // NOUVEL IMPORT
// Icônes et composants UI
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Star, Heart } from 'lucide-react';
import { Separator } from '@/components/ui/separator'; // NOUVEL IMPORT

interface POIDetailViewProps {
	poi: POI;
	locale: string;
}

const POIDetailView: React.FC<POIDetailViewProps> = ({ poi, locale }) => {
	const t = useTranslations('PoiDetailPage');
	const tReviews = useTranslations('ReviewSection');

	// ... (logique getLocaleText, name, description, etc. inchangée)
	const getLocaleText = (
		field: 'name' | 'description' | 'address',
		defaultValue = t('notAvailable')
	) => {
		const fr = poi.frLocalization?.[field];
		const en = poi.enLocalization?.[field];
		const ar = poi.arLocalization?.[field];

		if (locale === 'ar') return ar || en || fr || defaultValue;
		if (locale === 'en') return en || fr || ar || defaultValue;
		return fr || en || ar || defaultValue; // 'fr' par défaut
	};

	const name = getLocaleText('name');
	const description = getLocaleText('description');
	const address = getLocaleText('address');
	const category =
		poi.categoryPOI?.[locale as 'fr' | 'en' | 'ar'] || poi.categoryPOI?.fr;

    const frAudio = (poi.frLocalization as any)?.audioFiles?.[0];
    const arAudio = (poi.arLocalization as any)?.audioFiles?.[0];
    const enAudio = (poi.enLocalization as any)?.audioFiles?.[0];

	// Generate share URL
	const shareUrl = typeof window !== 'undefined' 
		? `${window.location.origin}/${locale}/pois/${poi.id}`
		: `https://gofez.com/${locale}/pois/${poi.id}`; // Fallback URL

	return (
		<>
			<div className="container mx-auto max-w-7xl px-4 py-8">
				{/* Grille principale (2 colonnes sur grand écran) */}
				<div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
					{/* Colonne de Gauche (Média) */}
					<div className="lg:col-span-7">
						<MediaGallery poiFile={poi.poiFile} poiName={name} />
						<div className="mt-6">
							<AudioPlayer
								frAudioUrl={frAudio}
								arAudioUrl={arAudio}
								enAudioUrl={enAudio}
							/>
						</div>
					</div>

					{/* Colonne de Droite (Informations) */}
					<div className="lg:col-span-5">
						<div className="flex flex-col">
							{/* ... (Catégorie, Nom, Badge Premium, Adresse, Note... inchangés) ... */}
							{category && (
								<span className="text-sm font-semibold uppercase tracking-wide text-blue-600">
									{category}
								</span>
							)}
							<h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-900">
								{name}
							</h1>
							{poi.isPremium && (
								<Badge
									variant="destructive"
									className="mt-2 flex w-fit items-center gap-1"
								>
									<Star className="h-4 w-4" />
									{t('premium')}
								</Badge>
							)}
							<div className="mt-4 flex items-center gap-2">
								<MapPin className="h-5 w-5 flex-shrink-0 text-gray-500" />
								<p className="text-base text-gray-700">{address}</p>
							</div>{/* Note, Favori et Partage */}
						<div className="mt-4 flex items-center gap-4">
							<POIRating
								rating={poi.rating || 0}
								reviewCount={poi.reviewCount || 0}
							/>
							{/* TODO: Gérer l'état de favori */}
							<Button variant="outline" size="icon">
								<Heart className="h-5 w-5" />
							</Button>
							{/* --- BOUTON AJOUTÉ --- */}
							<ShareButtons
								shareUrl={shareUrl}
								resourceType="poi"
								resourceId={poi.id}
								title={name}
							/>
						</div>
					
							<div className="prose prose-lg mt-6 max-w-none text-gray-700">
								<p>{description}</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* --- NOUVELLE SECTION AVIS --- */}
			<Separator className="my-12" />

			<div className="container mx-auto max-w-7xl px-4">
				<h2 className="text-2xl font-bold tracking-tight text-gray-900">
					{tReviews('reviewsTitle')} ({poi.reviewCount || 0})
				</h2>

				{/* Grille pour le formulaire et la liste */}
				<div className="mt-6 grid grid-cols-1 gap-12 lg:grid-cols-12">
					{/* Colonne Formulaire */}
					<div className="lg:col-span-5">
						{/* TODO: Afficher uniquement si l'utilisateur est connecté */}
						<ReviewForm poiId={poi.id} />
					</div>

					{/* Colonne Liste des Avis */}
					<div className="lg:col-span-7">
						<ReviewList poiId={poi.id} />
					</div>
				</div>
			</div>
		</>
	);
};

export default POIDetailView;