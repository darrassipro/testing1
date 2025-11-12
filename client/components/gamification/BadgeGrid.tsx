// client/components/gamification/BadgeGrid.tsx
'use client';

import React from 'react';
import { Badge } from '@/lib/types'; // Le type Badge du backend
import { useTranslations } from 'next-intl';

// Assumant shadcn/ui Tooltip
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip';

interface BadgeGridProps {
	badges: Badge[];
	locale: string;
}

// Sous-composant pour un seul badge
const BadgeIcon: React.FC<{ badge: Badge; locale: string }> = ({
	badge,
	locale,
}) => {
	// Get localized name and description
	const nameKey = locale === 'ar' ? 'nameAr' : locale === 'en' ? 'nameEn' : 'nameFr';
	const descKey = locale === 'ar' ? 'descriptionAr' : locale === 'en' ? 'descriptionEn' : 'descriptionFr';
	
    const name = (badge as any)[nameKey] || (badge as any).name || 'Badge';
    const description = (badge as any)[descKey] || (badge as any).description || '';
	
	// Check if badge has an earnedAt date (from UserBadge join)
	const earnedAt = (badge as any).UserBadge?.earnedAt || (badge as any).userBadge?.earnedAt;
	const isEarned = !!earnedAt;

	return (
		<TooltipProvider delayDuration={100}>
			<Tooltip>
				<TooltipTrigger asChild>
					<div className="flex flex-col items-center gap-2">
						<div 
							className={`
								relative flex h-20 w-20 items-center justify-center 
								overflow-hidden rounded-full border-4 
								transition-all duration-200 hover:scale-110
								${isEarned 
									? 'border-yellow-400 bg-gradient-to-br from-yellow-100 to-yellow-50 shadow-lg' 
									: 'border-gray-300 bg-gray-100 opacity-50 grayscale'
								}
							`}
						>
							<span className="text-4xl">{badge.icon}</span>
							{isEarned && (
								<div className="absolute -right-1 -top-1 rounded-full bg-green-500 p-1">
									<svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
										<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
									</svg>
								</div>
							)}
						</div>
						<span className={`w-24 truncate text-center text-xs font-medium ${isEarned ? 'text-gray-900' : 'text-gray-400'}`}>
							{name}
						</span>
					</div>
				</TooltipTrigger>
				<TooltipContent>
					<div className="max-w-xs">
						<p className="font-semibold">{name}</p>
						<p className="text-sm text-gray-600">{description}</p>
						{isEarned && earnedAt && (
							<p className="mt-1 text-xs text-green-600">
								✓ {new Date(earnedAt).toLocaleDateString(locale)}
							</p>
						)}
					</div>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
};

// Composant grille principal
const BadgeGrid: React.FC<BadgeGridProps> = ({ badges, locale }) => {
	const t = useTranslations('GamificationProfile');

	return (
		<div className="rounded-lg border bg-white p-6 shadow-sm">
			<h3 className="mb-2 text-lg font-semibold text-gray-700">
				{t('myBadges')}
			</h3>
			<p className="mb-4 text-sm text-gray-500">
				{t('badgesEarned', { count: badges.length })}
			</p>
			{badges.length === 0 ? (
				<div className="flex flex-col items-center justify-center py-12">
					<div className="mb-4 text-6xl opacity-30">🏆</div>
					<p className="text-center text-gray-500">
						{t('noBadges')}
					</p>
					<p className="mt-2 text-center text-sm text-gray-400">
						{t('earnBadgesHint')}
					</p>
				</div>
			) : (
				<div className="mt-6 grid grid-cols-3 gap-6 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
					{badges.map((badge) => (
						<BadgeIcon key={badge.id} badge={badge} locale={locale} />
					))}
				</div>
			)}
		</div>
	);
};

export default BadgeGrid;
