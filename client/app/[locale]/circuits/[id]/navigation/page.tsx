// Redirect page - Navigation feature removed (Leaflet removed, using MapTiler only)
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface NavigationPageProps {
	params: Promise<{
		locale: string;
		id: string;
	}>;
}

export default function NavigationPage({ params }: NavigationPageProps) {
	const router = useRouter();
	
	useEffect(() => {
		// Redirect back to circuit detail page
		params.then(({ locale, id }) => {
			router.replace(`/${locale}/circuits/${id}`);
		});
	}, [router, params]);

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50">
			<div className="text-center">
				<h1 className="text-2xl font-bold text-gray-900 mb-4">Redirecting...</h1>
				<p className="text-gray-600">Navigation feature has been removed.</p>
			</div>
		</div>
	);
}
