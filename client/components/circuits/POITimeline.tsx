// client/components/circuits/POITimeline.tsx
'use client';

import React from 'react';
import { POI } from '@/lib/types';
import Link from 'next/link';
import { CheckCircle, Circle, MapPin, Navigation } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface POITimelineProps {
	pois: POI[];
	locale: string;
	// Optionnel: pour marquer les POIs comme complétés
	completedPoiIds?: string[];
	// Optionnel: pour mettre en évidence le POI actuel
	currentPoiId?: string;
}

const POITimeline: React.FC<POITimelineProps> = ({
	pois = [],
	locale,
	completedPoiIds = [],
	currentPoiId,
}) => {
	const t = useTranslations('CircuitDetailPage');

	// Trier les POIs en fonction de l'attribut 'order' de la table de liaison
	const sortedPois = [...pois].sort(
		(a, b) => (a.CircuitPOI?.order || 0) - (b.CircuitPOI?.order || 0)
	);

	return (
		<div className="relative py-4">
			{/* La ligne verticale de la timeline - gradient moderne */}
			<div className="absolute left-6 top-0 h-full w-1 bg-gradient-to-b from-blue-200 via-blue-200 to-pink-200 rounded-full" />

			<div className="space-y-6">
				{sortedPois.map((poi, index) => {
					const isCompleted = completedPoiIds.includes(poi.id);
					const isCurrent = currentPoiId === poi.id;
					
					const name =
						(poi[locale as 'fr' | 'en' | 'ar'] as any)?.name || 
						poi.frLocalization?.name ||
						'POI sans nom';
					
					const address =
						(poi[locale as 'fr' | 'en' | 'ar'] as any)?.address ||
						poi.frLocalization?.address;

					return (
						<div key={poi.id} className="relative flex items-start gap-4">
							{/* Le point sur la timeline avec animation */}
							<div className="relative z-10 flex-shrink-0">
								<div
									className={`flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 ${
										isCurrent
											? 'bg-gradient-to-br from-blue-500 via-blue-500 to-pink-500 text-white ring-4 ring-blue-200 shadow-lg scale-110'
											: isCompleted
											? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white ring-4 ring-green-100 shadow-md'
											: 'bg-white text-gray-600 ring-4 ring-gray-100 border-2 border-gray-300'
									}`}
								>
									{isCompleted ? (
										<CheckCircle className="h-6 w-6" />
									) : isCurrent ? (
										<Navigation className="h-6 w-6 animate-pulse" />
									) : (
										<span className="font-bold text-sm">{index + 1}</span>
									)}
								</div>
								
								{/* Badge étape */}
								{isCurrent && (
									<div className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap">
										<span className="inline-block rounded-full bg-blue-600 px-2 py-0.5 text-xs font-bold text-white shadow-sm">
											Actuel
										</span>
									</div>
								)}
							</div>

							{/* Le contenu de l'étape avec carte moderne */}
							<div className="flex-1 w-full">
								<div 
									className={`rounded-xl border p-4 transition-all duration-300 ${
										isCurrent
											? 'bg-gradient-to-br from-blue-50 to-blue-50 border-blue-300 shadow-lg scale-105'
											: isCompleted
											? 'bg-green-50 border-green-200 shadow-md'
											: 'bg-white border-gray-200 shadow-sm hover:shadow-md'
									}`}
								>
									{/* Étape et statut */}
									<div className="mb-2 flex items-center justify-between">
										<span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
											Étape {index + 1}
										</span>
										{isCompleted && (
											<div className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">
												<CheckCircle className="h-3 w-3" />
												Visité
											</div>
										)}
									</div>

									{/* Nom avec lien */}
									<Link
										href={`/${locale}/pois/${poi.id}`}
										className={`block font-bold text-lg mb-2 transition-colors ${
											isCurrent
												? 'text-blue-700 hover:text-blue-700'
												: isCompleted
												? 'text-green-700 hover:text-green-800'
												: 'text-gray-900 hover:text-blue-600'
										}`}
									>
										{name}
									</Link>

									{/* Adresse */}
									{address && (
										<div className="flex items-start gap-2 text-sm text-gray-600">
											<MapPin className="h-4 w-4 flex-shrink-0 mt-0.5 text-gray-400" />
											<p className="line-clamp-2">{address}</p>
										</div>
									)}
								</div>
							</div>
						</div>
					);
				})}
			</div>

			{/* Message de fin */}
			{sortedPois.length > 0 && (
				<div className="mt-6 text-center">
					<div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-50 to-blue-50 px-4 py-2 text-sm font-semibold text-gray-700">
						<Circle className="h-4 w-4 text-blue-500" />
						<span>{sortedPois.length} points d'intérêt au total</span>
					</div>
				</div>
			)}
		</div>
	);
};

export default POITimeline;