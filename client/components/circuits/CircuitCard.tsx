// client/components/circuits/CircuitCard.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Circuit } from '@/lib/types';
import { cloudinaryLoader } from '@/utils/cloudenary-loader';
import { useTranslations } from 'next-intl';

// Icônes et composants UI
import { Map, Clock, Zap, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CircuitCardProps {
	circuit: Circuit;
	locale: string;
}

// Sous-composant pour les icônes (distance, durée)
const InfoBadge: React.FC<{ icon: React.ReactNode; text: string }> = ({
	icon,
	text,
}) => (
	<div className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1">
		<div className="text-blue-600">{icon}</div>
		<span className="text-xs font-medium text-gray-800">{text}</span>
	</div>
);

const CircuitCard: React.FC<CircuitCardProps> = ({ circuit, locale }) => {
	const t = useTranslations('CircuitCard');
	const imageUrl = circuit.image || '/images/hero.jpg';

	// Handle both Circuit and CustomCircuit types
	// Regular circuits have localized fields (fr, ar, en)
	// Custom circuits have direct name and description fields
	const isCustomCircuit = !circuit.fr && !circuit.ar && !circuit.en;
	
	const name = isCustomCircuit 
		? (circuit as any).name 
		: (circuit[locale as 'fr' | 'en' | 'ar']?.name || circuit.fr?.name || '');
		
	const description = isCustomCircuit
		? ((circuit as any).description || '')
		: (circuit[locale as 'fr' | 'en' | 'ar']?.description || circuit.fr?.description || '');

	// Nombre de POIs
	const poisCount = circuit.pois?.length || 0;

	return (
		<Link href={`/${locale}/circuits/${circuit.id}`} className="group block overflow-hidden rounded-xl border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-blue-300">
			{/* Image avec overlay gradient */}
			<div className="relative h-56 w-full overflow-hidden">
					<Image
						loader={cloudinaryLoader}
						src={imageUrl}
						alt={name}
						layout="fill"
						objectFit="cover"
						className="transition-transform duration-300 group-hover:scale-105"
						quality={80}
					/>
					{/* Overlay gradient */}
					<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
					
					{/* Badge Premium */}
					{circuit.isPremium && (
						<Badge
							variant="destructive"
							className="absolute top-3 right-3 flex items-center gap-1 shadow-lg"
						>
							<Star className="h-3 w-3 fill-current" />
							Premium
						</Badge>
					)}

					{/* Badge POIs Count */}
					<div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-white/95 backdrop-blur-sm px-3 py-1.5 shadow-lg">
						<Zap className="h-4 w-4 text-blue-600" />
						<span className="text-xs font-bold text-gray-900">{poisCount} POIs</span>
					</div>
				</div>

				{/* Contenu */}
				<div className="p-5">
					{/* Thèmes (Tags) - Afficher jusqu'à 3 thèmes */}
					{circuit.themes && circuit.themes.length > 0 && (
						<div className="flex flex-wrap gap-2 mb-3">
							{circuit.themes.slice(0, 3).map((theme) => {
								const themeValue = theme[locale as 'fr' | 'en' | 'ar'] || theme.fr;
								const themeName = typeof themeValue === 'string' 
									? themeValue 
									: (themeValue as any)?.name || String(themeValue);
								return (
									<Badge 
										key={theme.id} 
										variant="secondary"
										className="bg-gradient-to-r from-blue-100 to-blue-100 text-blue-700 hover:from-blue-200 hover:to-blue-200 transition-all"
									>
										{themeName}
									</Badge>
								);
							})}
							{circuit.themes.length > 3 && (
								<Badge variant="outline" className="text-gray-500">
									+{circuit.themes.length - 3}
								</Badge>
							)}
						</div>
					)}

					{/* Badge for Custom Circuit */}
					{isCustomCircuit && (
						<div className="flex flex-wrap gap-2 mb-3">
							<Badge 
								variant="secondary"
								className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 hover:from-green-200 hover:to-emerald-200 transition-all"
							>
								{t('customCircuit') || 'Custom Circuit'}
							</Badge>
						</div>
					)}

					{/* Nom */}
					<h3 className="mt-2 truncate text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
						{name}
					</h3>
					{/* Description courte */}
					<p className="mt-2 h-10 text-sm text-gray-600 line-clamp-2">
						{description}
					</p>

					{/* Infos (Distance, Durée) - Design amélioré */}
					{circuit.distance && circuit.duration && (
						<div className="mt-4 flex flex-wrap items-center gap-3">
							<InfoBadge
								icon={<Map className="h-4 w-4" />}
								text={`${circuit.distance} ${t('km')}`}
							/>
							<InfoBadge
								icon={<Clock className="h-4 w-4" />}
								text={`${circuit.duration} ${t('min')}`}
							/>
						</div>
					)}
				</div>
		</Link>
	);
};

export default CircuitCard;