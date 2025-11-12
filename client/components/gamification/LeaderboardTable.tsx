// client/components/gamification/LeaderboardTable.tsx
'use client';

import React from 'react';
import { useGetLeaderboardQuery } from '@/services/api/GamificationApi';
import { useTranslations } from 'next-intl';

// Importer les composants
import { LoadingState } from '../admin/shared/LoadingState';
import { ErrorState } from '../admin/shared/ErrorState';
import { EmptyState } from '../admin/shared/EmptyState';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Trophy } from 'lucide-react';

// Fonction pour obtenir l'icône de classement
const getRankIcon = (rank: number) => {
	if (rank === 0)
		return <Trophy className="h-5 w-5 fill-yellow-400 text-yellow-400" />;
	if (rank === 1)
		return <Trophy className="h-5 w-5 fill-gray-400 text-gray-400" />;
	if (rank === 2)
		return <Trophy className="h-5 w-5 fill-yellow-700 text-yellow-700" />;
	return <span className="font-semibold text-gray-700">{rank + 1}</span>;
};

const LeaderboardTable: React.FC = () => {
	const t = useTranslations('Leaderboard');
	const { data, isLoading, isError, error } = useGetLeaderboardQuery({
		limit: 10,
	});

    if (isLoading) {
        return <LoadingState message={t('loading')} />;
    }

    if (isError) {
        console.error('Erreur chargement leaderboard:', error);
        return <ErrorState error={error} onRetry={() => {}} />;
    }

    if (!data || data.data.length === 0) {
        return <EmptyState title={t('noResults')} />;
    }

	return (
		<div className="overflow-hidden rounded-lg border shadow-sm">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className="w-16 text-center">
							{t('rank')}
						</TableHead>
						<TableHead>{t('player')}</TableHead>
						<TableHead className="text-right">{t('level')}</TableHead>
						<TableHead className="text-right">{t('points')}</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{data.data.map((entry, index) => {
						const userName =
							`${entry.user.firstName} ${entry.user.lastName}`.trim() ||
							'Explorateur Anonyme';
						const userInitials =
							entry.user.firstName?.charAt(0) ||
							'' + entry.user.lastName?.charAt(0) ||
							'E';

						return (
							<TableRow key={index} className="bg-white">
								<TableCell className="text-center">
									{getRankIcon(index)}
								</TableCell>
								<TableCell>
									<div className="flex items-center gap-3">
										<Avatar>
											<AvatarImage
												src={entry.user.profileImage}
												alt={userName}
											/>
											<AvatarFallback>{userInitials}</AvatarFallback>
										</Avatar>
										<span className="font-medium">{userName}</span>
									</div>
								</TableCell>
								<TableCell className="text-right font-semibold text-blue-600">
									{entry.level}
								</TableCell>
								<TableCell className="text-right font-bold text-gray-900">
									{entry.totalPoints}
								</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
		</div>
	);
};

export default LeaderboardTable;