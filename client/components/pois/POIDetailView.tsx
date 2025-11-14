// client/components/pois/POIDetailView.tsx
'use client';

import React from 'react';
import { POI } from '@/lib/types';
import { useTranslations } from 'next-intl';

// Components
import MediaGallery from './MediaGallery';
import AudioPlayer from './AudioPlayer';
import POIRating from './POIRating';
import ReviewList from '../social/ReviewList';
import ReviewForm from '../social/ReviewForm';
import ShareButtons from '../social/ShareButtons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Star, Heart, Navigation } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface POIDetailViewProps {
	poi: POI;
	locale: string;
}

const POIDetailView: React.FC<POIDetailViewProps> = ({ poi, locale }) => {
	const t = useTranslations('PoiDetailPage');
	const tReviews = useTranslations('ReviewSection');

    // ✅ Helper: Extract structured coordinate data
    const getCoordinatesData = () => {
        if (!poi.coordinates) return null;
        
        let coords: any = poi.coordinates;
        
        // Parse string if necessary
        if (typeof coords === 'string') {
            try {
                coords = JSON.parse(coords);
            } catch (e) {
                return null;
            }
        }

        let latitude: number | null = null;
        let longitude: number | null = null;
        let rawAddress: string | null = null;

        if (typeof coords === 'object') {
            // 1. Standard Object format { latitude, longitude, address }
            if ('latitude' in coords) latitude = Number(coords.latitude);
            if ('longitude' in coords) longitude = Number(coords.longitude);
            if ('address' in coords) rawAddress = coords.address;

            // 2. GeoJSON format { type: 'Point', coordinates: [lng, lat] }
            if (coords.type === 'Point' && Array.isArray(coords.coordinates)) {
                longitude = coords.coordinates[0];
                latitude = coords.coordinates[1];
            }
        }
        
        // 3. Simple Array format [lat, lng]
        if (Array.isArray(coords) && coords.length >= 2) {
            latitude = Number(coords[0]);
            longitude = Number(coords[1]);
        }

        return { latitude, longitude, rawAddress };
    };

    const coordsData = getCoordinatesData();

	const getLocaleText = (
		field: 'name' | 'description' | 'address',
		defaultValue = t('notAvailable')
	) => {
		const fr = poi.frLocalization?.[field];
		const en = poi.enLocalization?.[field];
		const ar = poi.arLocalization?.[field];

		if (locale === 'ar') return ar || en || fr || defaultValue;
		if (locale === 'en') return en || fr || ar || defaultValue;
		return fr || en || ar || defaultValue;
	};

    const getCategoryName = () => {
        if (!poi.categoryPOI) return null;
        const catData = poi.categoryPOI as any;
        const rawCat = catData[locale] || catData.fr;

        if (!rawCat) return null;
        if (typeof rawCat === 'object') return rawCat.name || null;
        if (typeof rawCat === 'string') {
            try {
                const trimmed = rawCat.trim();
                if (trimmed.startsWith('{')) return JSON.parse(trimmed).name;
                return trimmed;
            } catch (e) { return rawCat; }
        }
        return null;
    };

	const name = getLocaleText('name');
	const description = getLocaleText('description');
    
    // Use raw address from coordinates if localized address is missing
    const fallbackAddress = coordsData?.rawAddress || t('notAvailable');
	const address = getLocaleText('address', fallbackAddress);
    
	const category = getCategoryName(); 

    const frAudio = (poi.frLocalization as any)?.audioFiles?.[0];
    const arAudio = (poi.arLocalization as any)?.audioFiles?.[0];
    const enAudio = (poi.enLocalization as any)?.audioFiles?.[0];

	const shareUrl = typeof window !== 'undefined' 
		? `${window.location.origin}/${locale}/pois/${poi.id}`
		: `https://gofez.com/${locale}/pois/${poi.id}`;

	return (
		<>
			<div className="container mx-auto max-w-7xl px-4 py-8">
				<div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
					{/* Left Column (Media) */}
					<div className="lg:col-span-7">
						<MediaGallery files={poi.files} poiName={name} />
						<div className="mt-6">
							<AudioPlayer
								frAudioUrl={frAudio}
								arAudioUrl={arAudio}
								enAudioUrl={enAudio}
							/>
						</div>
					</div>

					{/* Right Column (Info) */}
					<div className="lg:col-span-5">
						<div className="flex flex-col">
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

                            {/* --- Location Section --- */}
							<div className="mt-6 rounded-lg bg-gray-50 p-4 border border-gray-100">
                                <div className="flex items-start gap-3">
                                    <MapPin className="h-5 w-5 flex-shrink-0 text-blue-600 mt-1" />
                                    <div className="space-y-1">
                                        <p className="text-base font-medium text-gray-900">Adresse</p>
                                        <p className="text-gray-700">{address}</p>
                                        
                                        {/* Explicitly show Coordinates if available */}
                                        {coordsData && (coordsData.latitude || coordsData.longitude) && (
                                            <div className="pt-2 mt-2 border-t border-gray-200 text-sm text-gray-600 flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <Navigation className="h-3 w-3" />
                                                    <span className="font-mono text-xs">
                                                        Lat: {coordsData.latitude?.toFixed(6)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Navigation className="h-3 w-3" />
                                                    <span className="font-mono text-xs">
                                                        Lng: {coordsData.longitude?.toFixed(6)}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
							</div>

							<div className="mt-4 flex items-center gap-4">
								<POIRating
									rating={poi.rating || 0}
									reviewCount={poi.reviewCount || 0}
								/>
								<Button variant="outline" size="icon">
									<Heart className="h-5 w-5" />
								</Button>
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

			<Separator className="my-12" />

			<div className="container mx-auto max-w-7xl px-4">
				<h2 className="text-2xl font-bold tracking-tight text-gray-900">
					{tReviews('reviewsTitle')} ({poi.reviewCount || 0})
				</h2>

				<div className="mt-6 grid grid-cols-1 gap-12 lg:grid-cols-12">
					<div className="lg:col-span-5">
						<ReviewForm poiId={poi.id} />
					</div>
					<div className="lg:col-span-7">
						<ReviewList poiId={poi.id} />
					</div>
				</div>
			</div>
		</>
	);
};

export default POIDetailView;