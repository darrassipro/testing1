// client/components/pois/POIRating.tsx
import { Star } from 'lucide-react';
import React from 'react';

interface POIRatingProps {
	rating: number;
	reviewCount?: number;
	className?: string;
}

const POIRating: React.FC<POIRatingProps> = ({
	rating,
	reviewCount,
	className,
}) => {
	const roundedRating = Math.round(rating * 10) / 10;

	return (
		<div className={`flex items-center gap-1 ${className}`}>
			<Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
			<span className="font-semibold text-sm text-gray-800">
				{roundedRating.toFixed(1)}
			</span>
			{reviewCount !== undefined && (
				<span className="text-xs text-gray-500">({reviewCount})</span>
			)}
		</div>
	);
};

export default POIRating;