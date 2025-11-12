// client/components/gamification/LevelProgress.tsx
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Progress } from '@/components/ui/progress'; // Assumant shadcn/ui
import { Shield } from 'lucide-react';

interface LevelProgressProps {
	level: number;
	totalPoints: number;
}

// Logique simple pour les niveaux (ex: 1000 points par niveau)
const POINTS_PER_LEVEL = 1000;

const LevelProgress: React.FC<LevelProgressProps> = ({
	level,
	totalPoints,
}) => {
	const t = useTranslations('GamificationProfile');

	// Calculer la progression
	const pointsInCurrentLevel = totalPoints % POINTS_PER_LEVEL;
	const progressPercentage = (pointsInCurrentLevel / POINTS_PER_LEVEL) * 100;
	const pointsToNextLevel = POINTS_PER_LEVEL - pointsInCurrentLevel;

	return (
		<div className="rounded-lg border bg-white p-6 shadow-sm">
			<div className="flex items-center justify-between">
				<h3 className="text-lg font-semibold text-gray-700">
					{t('level')} {level}
				</h3>
				<div className="flex items-center gap-2">
					<Shield className="h-6 w-6 text-blue-600" />
					<span className="text-xl font-bold text-blue-600">
						{t('level')} {level + 1}
					</span>
				</div>
			</div>
			<Progress value={progressPercentage} className="mt-3" />
			<p className="mt-2 text-center text-sm text-gray-600">
				{t('pointsToNextLevel', { count: pointsToNextLevel })}
			</p>
		</div>
	);
};

export default LevelProgress;