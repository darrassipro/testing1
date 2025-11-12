// client/app/[locale]/profile/page.tsx
'use client';

import React, { Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { useGetGamificationProfileQuery } from '@/services/api/GamificationApi';
import { useGetUserProfileQuery } from '@/services/api/UserApi'; // Assuming this exists based on UserApi.js
import { useGetUserRoutesQuery } from '@/services/api/RouteApi';

// Import Components (based on README and achievements page)
import Header from '@/components/header/header';
import PointsDisplay from '@/components/gamification/PointsDisplay';
import LevelProgress from '@/components/gamification/LevelProgress';
import BadgeGrid from '@/components/gamification/BadgeGrid';
import { LoadingState } from '@/components/admin/shared/LoadingState';
import { ErrorState } from '@/components/admin/shared/ErrorState';
import { useGetUserReviewsQuery } from '@/services/api/ReviewApi';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'; // Using shadcn Avatar
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Pencil, MapPin, Route as RouteIcon, Award } from 'lucide-react'; // Icon for edit button

interface ProfilePageProps {
	// Change params type to Promise
	params: Promise<{
		locale: string;
	}>;
}

function ProfileContent({ locale }: { locale: string }) {
	const t = useTranslations('GamificationProfile'); // Using GamificationProfile translations for now
	const router = useRouter();
	
	// Check if user is authenticated
	const { user: authUser, token } = useSelector((state: RootState) => state.auth);
	
	// Redirect to login if not authenticated
	React.useEffect(() => {
		if (!authUser || !token) {
			router.push(`/${locale}/login`);
		}
	}, [authUser, token, locale, router]);

	// Fetch Gamification Data
	const {
		data: gamificationData,
		isLoading: isLoadingGamification,
		isError: isGamificationError,
		error: gamificationError,
	} = useGetGamificationProfileQuery();

	// Fetch User Profile Data (Assuming useGetUserProfileQuery exists)
	// You might need to adjust this based on your actual UserApi implementation
	const {
		data: userData,
		isLoading: isLoadingUser,
		isError: isUserError,
		error: userError,
		refetch: refetchUser,
	} = useGetUserProfileQuery(undefined);

	// Fetch User Routes
	const {
		data: routesData,
		isLoading: isLoadingRoutes,
	} = useGetUserRoutesQuery();

	// Handle Loading States
	if (isLoadingGamification || isLoadingUser) {
		return (
			<div className="container mx-auto max-w-7xl px-4 py-8">
				<LoadingState message={t('loading')} />
			</div>
		);
	}

	// Handle Error States
	if (isGamificationError || !gamificationData?.data) {
		return (
			<div className="container mx-auto max-w-7xl px-4 py-8">
				<ErrorState error={gamificationError} onRetry={() => window.location.reload()} />
			</div>
		);
	}
	if (isUserError || !userData) {
		return (
			<div className="container mx-auto max-w-7xl px-4 py-8">
				<ErrorState error={userError} onRetry={() => refetchUser()} />
			</div>
		);
	}

	const { points, badges } = gamificationData.data;
	const user = userData;

	// Get route stats
	const routeStats = {
		totalPoints: routesData?.data?.totalPoints || 0,
		totalRoutes: routesData?.data?.totalRoutes || 0,
		totalDistance: routesData?.data?.totalDistance || 0,
		recentRoutes: routesData?.data?.routes?.slice(0, 3) || [],
	};

	// Prepare user display info
	const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Utilisateur';
	const userInitials = `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}` || 'U';

	// Handle language change
	const handleLanguageChange = (lang: 'en' | 'fr' | 'ar') => {
		router.push(`/${lang}/profile`);
	};

	// Determine if RTL based on locale
	const isRTL = locale === 'ar';

	return (
		<>
			{/* Header */}
			<Header 
				locale={locale}
				isRTL={isRTL}
				onLanguageChange={handleLanguageChange}
			/>
			
			<div className="container mx-auto max-w-7xl px-4 py-8 mt-24">
			{/* User Header */}
			<header className="mb-8 flex flex-col items-center gap-4 border-b pb-6 sm:flex-row">
				<Avatar className="h-24 w-24 border-2 border-primary sm:h-32 sm:w-32">
					<AvatarImage src={user.profileImage} alt={userName} />
					<AvatarFallback className="text-3xl sm:text-4xl">
						{userInitials}
					</AvatarFallback>
				</Avatar>
				<div className="flex-1 text-center sm:text-left">
					<h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
						{userName}
					</h1>
					{/* Add email or phone if available */}
					{user.email && (
						<p className="mt-1 text-lg text-gray-600">{user.email}</p>
					)}
					{/* Edit Profile Button */}
					<Button 
						variant="outline" 
						size="sm" 
						className="mt-4 gap-2"
						onClick={() => router.push(`/${locale}/profile/settings`)}
					>
						<Pencil className="h-4 w-4" /> Modifier le profil
					</Button>
				</div>
				{/* Quick links */}
										<nav className="mt-4 flex flex-wrap justify-center gap-2 sm:mt-0 sm:flex-col sm:items-end">
											<Link href={`/${locale}/profile/achievements`}>
												<Button variant="link">{t('myBadges')}</Button>
											</Link>
											<Link href={`/${locale}/profile/leaderboard`}>
												<Button variant="link">{t('Leaderboard.title')}</Button>
											</Link>
											<Link href={`/${locale}/profile/routes`}>
												<Button variant="link">My Routes</Button>
											</Link>
					{/* Add link to history if available */}
					{/* <Link href={`/${locale}/profile/history`} passHref legacyBehavior>
            <Button variant="link">Historique</Button>
          </Link> */}
				</nav>
			</header>

			{/* Gamification Section */}
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				{/* Column 1: Points */}
				<div className="lg:col-span-1">
					<PointsDisplay totalPoints={points?.totalPoints || 0} />
				</div>

				{/* Column 2: Level */}
				<div className="lg:col-span-2">
					<LevelProgress
						level={points?.level || 1}
						totalPoints={points?.totalPoints || 0}
					/>
				</div>
			</div>

			{/* Routes Section */}
			<div className="mt-8">
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-2xl font-semibold">Route Activity</h2>
					<Link href={`/${locale}/profile/routes`}>
						<Button variant="outline" size="sm">View All</Button>
					</Link>
				</div>
				
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
					<div className="bg-white rounded-lg border p-4 shadow-sm">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 bg-[#007036]/10 rounded-full flex items-center justify-center">
								<Award className="w-5 h-5 text-[#007036]" />
							</div>
							<div>
								<p className="text-sm text-gray-600">Route Points</p>
								<p className="text-xl font-bold text-gray-900">{routeStats.totalPoints}</p>
							</div>
						</div>
					</div>
					
					<div className="bg-white rounded-lg border p-4 shadow-sm">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
								<RouteIcon className="w-5 h-5 text-blue-600" />
							</div>
							<div>
								<p className="text-sm text-gray-600">Routes Completed</p>
								<p className="text-xl font-bold text-gray-900">{routeStats.totalRoutes}</p>
							</div>
						</div>
					</div>
					
					<div className="bg-white rounded-lg border p-4 shadow-sm">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
								<MapPin className="w-5 h-5 text-purple-600" />
							</div>
							<div>
								<p className="text-sm text-gray-600">Distance Traveled</p>
								<p className="text-xl font-bold text-gray-900">{routeStats.totalDistance.toFixed(1)} km</p>
							</div>
						</div>
					</div>
				</div>

				{/* Recent Routes */}
				{routeStats.recentRoutes.length > 0 && (
					<div className="bg-white rounded-lg border shadow-sm overflow-hidden">
						<div className="p-4 border-b">
							<h3 className="font-semibold">Recent Routes</h3>
						</div>
						<div className="divide-y">
							{routeStats.recentRoutes.map((route: any) => (
								<div key={route.id} className="p-4 flex items-center gap-4 hover:bg-gray-50">
									<img 
										src={route.poiImage || 'https://placehold.co/60x60?text=POI'} 
										alt={route.poiName}
										className="w-12 h-12 rounded-lg object-cover"
									/>
									<div className="flex-1">
										<p className="font-medium text-gray-900">{route.poiName}</p>
										<p className="text-sm text-gray-600">
											{route.distance} km • {route.duration} min • +{route.pointsEarned} pts
										</p>
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				{routeStats.recentRoutes.length === 0 && !isLoadingRoutes && (
					<div className="bg-white rounded-lg border shadow-sm p-8 text-center">
						<RouteIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
						<p className="text-gray-600">No routes completed yet</p>
						<Link href={`/${locale}`}>
							<Button className="mt-4 bg-[#007036] hover:bg-[#005a2b]">Start Exploring</Button>
						</Link>
					</div>
				)}
			</div>

			{/* Section Badges */}
			<div className="mt-8">
				<BadgeGrid badges={badges || []} locale={locale} />
			</div>

			{/* My Reviews */}
			<div className="mt-8">
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-2xl font-semibold">My Reviews</h2>
					<Link href={`/${locale}/profile`}> 
						{/* Placeholder: could go to a full reviews page */}
						<Button variant="outline" size="sm">View All</Button>
					</Link>
				</div>

				<UserReviews locale={locale} />
			</div>

			{/* Placeholder for Activity History */}
			{/* <section className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Historique Récent</h2>
        <div className="rounded-lg border bg-white p-6 shadow-sm text-center text-gray-500">
          (ActivityHistoryList.tsx) - Afficher les dernières actions gamifiées.
        </div>
      </section> */}
			</div>
		</>
	);
}

export default function ProfilePage({ params }: ProfilePageProps) {
	const resolvedParams = React.use(params);
	const { locale } = resolvedParams;

	return (
		<Suspense fallback={
			<div className="container mx-auto max-w-7xl px-4 py-8 mt-24">
				<LoadingState message="Loading profile..." />
			</div>
		}>
			<ProfileContent locale={locale} />
		</Suspense>
	);
}

function UserReviews({ locale }: { locale: string }) {
	const { data, isLoading, isError, error, refetch } = useGetUserReviewsQuery({ page: 1, limit: 5 });

	if (isLoading) {
		return <div className="bg-white rounded-lg border p-6"><LoadingState message="Loading reviews..." /></div>;
	}

	if (isError) {
		return (
			<div className="bg-white rounded-lg border p-6">
				<ErrorState error={error} onRetry={() => refetch()} />
			</div>
		);
	}

	const reviews = data?.data?.reviews || [];

	if (reviews.length === 0) {
		return (
			<div className="bg-white rounded-lg border p-6 text-center text-gray-600">
				You haven't submitted any reviews yet.
			</div>
		);
	}

	return (
		<div className="bg-white rounded-lg border shadow-sm">
			<div className="divide-y">
				{reviews.map((r: any) => (
					<div key={r.id} className="p-4 flex gap-4 items-start">
						<div className="flex-1">
							<div className="flex items-center justify-between">
								<div>
									<p className="font-medium text-gray-900">{r.poi?.fr || r.poi?.en || r.poi?.name || 'POI'}</p>
									<p className="text-sm text-gray-600">{new Date(r.createdAt).toLocaleDateString()}</p>
								</div>
								<div>
									{r.isAccepted ? (
										<span className="text-xs font-semibold bg-green-100 text-green-800 px-2 py-1 rounded">Approved</span>
									) : r.aiReport ? (
										<span className="text-xs font-semibold bg-red-100 text-red-800 px-2 py-1 rounded">Denied</span>
									) : (
										<span className="text-xs font-semibold bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Pending</span>
									)}
								</div>
							</div>

							<div className="mt-2">
								<div className="flex items-center gap-2">
									<div className="text-lg font-bold">{r.rating?.toFixed ? r.rating.toFixed(1) : r.rating}</div>
									<div className="text-sm text-gray-500">/ 5</div>
								</div>
								{r.comment && <p className="mt-2 text-gray-700">{r.comment}</p>}
								{r.aiReport && (
									<p className="mt-2 text-sm text-red-600">Reason: {r.aiReport}</p>
								)}
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}