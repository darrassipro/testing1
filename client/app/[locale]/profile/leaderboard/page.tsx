// client/app/[locale]/profile/leaderboard/page.tsx
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import LeaderboardTable from '@/components/gamification/LeaderboardTable';

export default function LeaderboardPage() {
	const t = useTranslations('Leaderboard');

	return (
		<div className="container mx-auto max-w-7xl px-4 py-8">
			<header className="mb-8">
				<h1 className="text-3xl font-bold tracking-tight text-gray-900">
					{t('title')}
				</h1>
				<p className="mt-1 text-lg text-gray-600">{t('subtitle')}</p>
			</header>

			<section>
				<LeaderboardTable />
			</section>
		</div>
	);
}