// client/components/pois/POICard.tsx
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { POI } from '@/lib/types';
import { cloudinaryLoader } from '@/utils/cloudenary-loader';
import { MapPin, Star } from 'lucide-react';
import POIRating from './POIRating';
import { Badge } from '@/components/ui/badge'; // Supposant que vous avez un composant Badge

interface POICardProps {
	poi: POI;
	locale: string; // Pour la localisation du nom et du lien
}

const POICard: React.FC<POICardProps> = ({ poi, locale }) => {
	console.log('POI Data:', poi); // Add this line for debugging
	// Sélectionner la bonne localisation
	const localization =
		poi.frLocalization || poi.enLocalization || poi.arLocalization;
	const category =
		poi.categoryPOI?.fr || poi.categoryPOI?.en || poi.categoryPOI?.ar;
	const address =
		poi.frLocalization?.address ||
		poi.enLocalization?.address ||
		poi.arLocalization?.address;

	// Get first image from POI files array
	const imageUrl = poi.files?.[0]?.fileUrl || '/images/hero.jpg';

	return (
		<Link 
			href={`/${locale}/pois/${poi.id}`}
			className="group block overflow-hidden rounded-xl border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-md"
		>
			<div className="relative h-48 w-full overflow-hidden">
				<Image
					loader={cloudinaryLoader}
					src={imageUrl}
                    alt={localization?.name || 'Point of Interest'}
					fill
					className="object-cover transition-transform duration-300 group-hover:scale-105"
					quality={80}
				/>
				{poi.isPremium && (
					<Badge
						variant="destructive"
						className="absolute top-2 right-2 flex items-center gap-1"
					>
						<Star className="h-3 w-3" />
						Premium
					</Badge>
				)}
			</div>
			<div className="p-4">
				{category && (
					<span className="text-xs font-semibold uppercase tracking-wide text-blue-600">
						{category}
					</span>
				)}
				<h3 className="mt-1 truncate text-lg font-bold text-gray-900">
					{localization?.name || 'Nom non disponible'}
				</h3>
				{address && (
					<div className="mt-2 flex items-center gap-1.5">
						<MapPin className="h-4 w-4 flex-shrink-0 text-gray-500" />
						<p className="truncate text-sm text-gray-600">
							{address}
						</p>
					</div>
				)}
				<div className="mt-3 flex items-center justify-between">
					<POIRating
						rating={poi.rating || 0}
						reviewCount={poi.reviewCount || 0}
					/>
					{/* TODO: Ajouter le bouton Favori ici */}
				</div>
			</div>
		</Link>
	);
};

export default POICard;