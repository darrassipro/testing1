// client/app/[locale]/partners/qr-scan/page.tsx
'use client';

import React, { use } from 'react';
import { useTranslations } from 'next-intl';
import QRScanner from '@/components/partners/QRScanner';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

interface QrScanPageProps {
    params: Promise<{
        locale: string;
    }>;
}

export default function QrScanPage({ params }: QrScanPageProps) {
    const { locale } = use(params);
	const t = useTranslations('QRScannerPage');

	return (
		<div className="container mx-auto max-w-7xl px-4 py-8">
			<header className="mb-6 flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight text-gray-900">
						{t('title')}
					</h1>
					<p className="mt-1 text-lg text-gray-600">{t('subtitle')}</p>
				</div>
				<Link href={`/${locale}/partners`} legacyBehavior>
					<Button variant="outline" className="gap-1">
						<ChevronLeft className="h-4 w-4" />
						{t('backToPartners')}
					</Button>
				</Link>
			</header>

			<section className="flex justify-center">
				<QRScanner />
			</section>
		</div>
	);
}