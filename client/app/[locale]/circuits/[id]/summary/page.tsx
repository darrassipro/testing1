// Redirect page - Summary feature removed (Leaflet removed, using MapTiler only)
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface SummaryPageProps {
	params: Promise<{
		locale: string;
		id: string;
	}>;
}

export default function SummaryPage({ params }: SummaryPageProps) {
	const router = useRouter();
	
	useEffect(() => {
		params.then(({ locale, id }) => {
			router.replace(`/${locale}/circuits/${id}`);
		});
	}, [router, params]);

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50">
			<div className="text-center">
				<h1 className="text-2xl font-bold text-gray-900 mb-4">Redirecting...</h1>
				<p className="text-gray-600">Summary feature has been removed.</p>
			</div>
		</div>
	);
}
import { useGetGamificationProfileQuery } from '@/services/api/GamificationApi';

// Importer les composants
import { LoadingState } from '@/components/admin/shared/LoadingState';
import { ErrorState } from '@/components/admin/shared/ErrorState';
import { Button } from '@/components/ui/button';
import { CheckCircle, Award, Clock } from 'lucide-react';

export default function CircuitSummaryPage() {
	const t = useTranslations('CircuitSummary');
	const params = useParams();
	const locale = params.locale as string;
	const circuitId = params.id as string;

	// Récupérer les données du circuit (pour le nom)
	const { data: circuitData } = useGetCircuitByIdQuery(circuitId);

	// Récupérer les données de progression (pour le temps, etc.)
	const { data: progressData, isLoading: isLoadingProgress } =
		useGetCircuitProgressQuery(circuitId, { skip: !circuitId });

	// Récupérer les données de gamification (pour les points)
	const { data: profileData, isLoading: isLoadingProfile } =
		useGetGamificationProfileQuery();

    if (isLoadingProgress || isLoadingProfile) {
        return <LoadingState message={t('loading')} />;
    }

    if (!progressData || !circuitData) {
        return <ErrorState error={{ message: t('error') }} onRetry={() => {}} />;
    }

    let circuitName: string = '';
    try {
        const locRaw: any = (circuitData as any)?.data?.[locale as 'fr' | 'en' | 'ar'];
        let locObj: any = locRaw;
        if (typeof locRaw === 'string') {
            try { locObj = JSON.parse(locRaw); } catch {}
        }
        const frRaw: any = (circuitData as any)?.data?.fr;
        let frObj: any = frRaw;
        if (typeof frRaw === 'string') {
            try { frObj = JSON.parse(frRaw); } catch {}
        }
        const fallbackName = (frObj && typeof frObj === 'object') ? (frObj?.name || '') : '';
        circuitName = (locObj && typeof locObj === 'object' && locObj?.name) ? String(locObj.name) : String(fallbackName);
    } catch {
        circuitName = '';
    }
	const progress = progressData;
	const points = profileData?.data?.points?.totalPoints || 0;

	return (
		<div className="container mx-auto flex min-h-[80vh] max-w-2xl flex-col items-center justify-center px-4 py-12 text-center">
			<CheckCircle className="h-20 w-20 text-green-500" />
			<h1 className="mt-6 text-4xl font-bold tracking-tight text-gray-900">
				{t('title')}
			</h1>
			<p className="mt-2 text-lg text-gray-600">
				{t('subtitle')} "{circuitName}"
			</p>

			{/* Section des statistiques */}
			<div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
				<div className="rounded-lg border bg-white p-6">
					<Clock className="mx-auto h-10 w-10 text-blue-600" />
					<h3 className="mt-3 text-lg font-semibold">{t('totalTime')}</h3>
                    <p className="text-3xl font-bold text-gray-900">
                        {(progress as any)?.totalTime || 0}
						<span className="text-xl"> {t('minutes')}</span>
					</p>
				</div>
				<div className="rounded-lg border bg-white p-6">
					<Award className="mx-auto h-10 w-10 text-yellow-500" />
					<h3 className="mt-3 text-lg font-semibold">{t('pointsEarned')}</h3>
					<p className="text-3xl font-bold text-gray-900">{points}</p>
				</div>
			</div>

			{/* Actions */}
			<div className="mt-12 flex flex-col gap-4 sm:flex-row">
				<Link href={`/${locale}/profile/achievements`} legacyBehavior>
					<Button size="lg" variant="outline">
						{t('viewProfile')}
					</Button>
				</Link>
				<Link href={`/${locale}/circuits`} legacyBehavior>
					<Button size="lg">{t('backToCircuits')}</Button>
				</Link>
			</div>
		</div>
	);
}