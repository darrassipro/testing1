// client/components/pois/POICard.tsx
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { POI } from '@/lib/types';
import { cloudinaryLoader } from '@/utils/cloudenary-loader';
import { MapPin, Star } from 'lucide-react';
import POIRating from './POIRating';
import { Badge } from '@/components/ui/badge';

interface POICardProps {
	poi: POI;
	locale: string;
}

const POICard: React.FC<POICardProps> = ({ poi, locale }) => {
	// Debug log (can be removed in production)
	// console.log('POI Data:', poi); 

	// Helper to safely extract category name from JSON structure
	const getCategoryName = () => {
		if (!poi.categoryPOI) return null;

		// Access dynamic properties safely
		const catModel = poi.categoryPOI as any;
		// Try current locale, fallback to others
		const rawData = catModel[locale] || catModel.fr || catModel.en || catModel.ar;

		if (!rawData) return null;

		// Case 1: Already an object
		if (typeof rawData === 'object') {
			return rawData.name || null;
		}

		// Case 2: String (needs parsing)
		if (typeof rawData === 'string') {
			try {
				const trimmed = rawData.trim();
				if (trimmed.startsWith('{')) {
					const parsed = JSON.parse(trimmed);
					return parsed.name;
				}
				return trimmed;
			} catch (e) {
				return rawData;
			}
		}
		return null;
	};

	const categoryName = getCategoryName();

	const localization =
		poi.frLocalization || poi.enLocalization || poi.arLocalization;
	
	// Helper for address to avoid "undefined"
	const address =
		poi.frLocalization?.address ||
		poi.enLocalization?.address ||
		poi.arLocalization?.address;

	// Get first image from POI files array
	const imageUrl = poi.files?.[0]?.fileUrl || '/images/hero.jpg';

	return (
		<Link 
			href={`/${locale}/pois/${poi.id}`}
			className="group block overflow-hidden rounded-xl border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-md bg-white"
		>
			<div className="relative h-48 w-full overflow-hidden">
				<Image
					loader={cloudinaryLoader}
					src={imageUrl}
                    alt={localization?.name || 'Point of Interest'}
					fill
					className="object-cover transition-transform duration-300 group-hover:scale-105"
					quality={80}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
				/>
				{poi.isPremium && (
					<Badge
						variant="destructive"
						className="absolute top-2 right-2 flex items-center gap-1 shadow-sm"
					>
						<Star className="h-3 w-3 fill-current" />
						Premium
					</Badge>
				)}
			</div>
			<div className="p-4">
				{/* Display the parsed category name */}
				{categoryName && (
					<span className="text-xs font-semibold uppercase tracking-wide text-blue-600 block mb-1">
						{categoryName}
					</span>
				)}
				<h3 className="truncate text-lg font-bold text-gray-900">
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
				<div className="mt-3 flex items-center justify-between pt-3 border-t border-gray-100">
					<POIRating
						rating={poi.rating || 0}
						reviewCount={poi.reviewCount || 0}
					/>
				</div>
			</div>
		</Link>
	);
};

export default POICard;