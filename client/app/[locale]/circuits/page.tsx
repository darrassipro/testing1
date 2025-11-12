// client/app/[locale]/circuits/page.tsx
'use client';

import React, { use, useState } from 'react'; // Importer 'use' et 'useState'
import { useTranslations } from 'next-intl';
import Link from 'next/link';

// Import both APIs
import { useGetAllCircuitsQuery } from '@/services/api/CircuitApi';
import { useGetUserCustomCircuitsQuery } from '@/services/api/CustomCircuitApi';

import { LoadingState } from '@/components/admin/shared/LoadingState';
import { ErrorState } from '@/components/admin/shared/ErrorState';
import CircuitCard from '@/components/circuits/CircuitCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Route, Sparkles } from 'lucide-react';

interface CircuitsPageProps {
	params: Promise<{
		locale: string;
	}>;
}

export default function CircuitsPage({ params }: CircuitsPageProps) {
	const { locale } = use(params);
	const t = useTranslations('CircuitsPage');
	const [activeTab, setActiveTab] = useState('all');

	// Fetch regular circuits
	const { 
		data: circuitsData, 
		isLoading: circuitsLoading, 
		isError: circuitsError, 
		error: circuitsErrorData 
	} = useGetAllCircuitsQuery();

	// Fetch custom circuits
	const { 
		data: customCircuitsData, 
		isLoading: customCircuitsLoading, 
		isError: customCircuitsError, 
		error: customCircuitsErrorData 
	} = useGetUserCustomCircuitsQuery();

	const renderCircuits = (circuits: any[], isLoading: boolean, isError: boolean, error: any, emptyMessage: string) => {
		if (isLoading) {
			return <LoadingState message={t('loading')} />;
		}

		if (isError) {
			return (
				<ErrorState
					error={(error as any)?.data?.message || t('error')}
					onRetry={() => {}}
				/>
			);
		}

		if (circuits.length === 0) {
			return <p className="text-center text-gray-500 py-8">{emptyMessage}</p>;
		}

		return (
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				{circuits.map((circuit: any) => (
					<CircuitCard key={circuit.id} circuit={circuit} locale={locale} />
				))}
			</div>
		);
	};

	const regularCircuits = circuitsData?.data || [];
	const customCircuits = customCircuitsData?.data || [];
	const allCircuits = [...regularCircuits, ...customCircuits];

	return (
		<main className="container mx-auto max-w-7xl px-4 py-24">
			<div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">
						{t('title')}
					</h1>
					<p className="mt-2 text-lg text-gray-600">
						{t('subtitle')}
					</p>
				</div>
				<Button asChild>
					<Link href={`/${locale}/circuits/create-custom`}>
						<Plus className="mr-2 h-4 w-4" />
						{t('createButton')}
					</Link>
				</Button>
			</div>

			<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
				<TabsList className="grid w-full grid-cols-3 mb-8">
					<TabsTrigger value="all" className="flex items-center gap-2">
						<Route className="h-4 w-4" />
						{t('allCircuits') || 'All Circuits'}
					</TabsTrigger>
					<TabsTrigger value="official" className="flex items-center gap-2">
						<Route className="h-4 w-4" />
						{t('officialCircuits') || 'Official Circuits'}
					</TabsTrigger>
					<TabsTrigger value="custom" className="flex items-center gap-2">
						<Sparkles className="h-4 w-4" />
						{t('customCircuits') || 'My Custom Circuits'}
					</TabsTrigger>
				</TabsList>

				<TabsContent value="all">
					{renderCircuits(
						allCircuits, 
						circuitsLoading || customCircuitsLoading,
						circuitsError && customCircuitsError,
						circuitsErrorData || customCircuitsErrorData,
						t('noCircuits') || 'No circuits available'
					)}
				</TabsContent>

				<TabsContent value="official">
					{renderCircuits(
						regularCircuits, 
						circuitsLoading,
						circuitsError,
						circuitsErrorData,
						t('noOfficialCircuits') || 'No official circuits available'
					)}
				</TabsContent>

				<TabsContent value="custom">
					{renderCircuits(
						customCircuits, 
						customCircuitsLoading,
						customCircuitsError,
						customCircuitsErrorData,
						t('noCustomCircuits') || 'No custom circuits yet. Create your first one!'
					)}
				</TabsContent>
			</Tabs>
		</main>
	);
}