// client/components/gamification/PointsDisplay.tsx
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Award } from 'lucide-react';

interface PointsDisplayProps {
	totalPoints: number;
}

const PointsDisplay: React.FC<PointsDisplayProps> = ({ totalPoints }) => {
	const t = useTranslations('GamificationProfile');

	return (
		<div className="rounded-lg border bg-white p-6 text-center shadow-sm">
			<Award className="mx-auto h-12 w-12 text-yellow-500" />
			<h3 className="mt-3 text-lg font-semibold text-gray-700">
				{t('totalPoints')}
			</h3>
			<p className="text-4xl font-bold text-gray-900">{totalPoints}</p>
		</div>
	);
};

export default PointsDisplay;