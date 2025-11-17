'use client';

import React, { useState, use } from 'react';
import { useTranslations } from 'next-intl';
import { useGetFilteredPOIsQuery, GetPOIsParams } from '@/services/api/PoiApi';
import { useSearchParams } from 'next/navigation';

import POIFilters from '@/components/pois/POIFilters';
import POICard from '@/components/pois/POICard';
import PaginationControls from '@/components/shared/PaginationControls';
import { LoadingState } from '@/components/admin/shared/LoadingState';
import { ErrorState } from '@/components/admin/shared/ErrorState';
import { EmptyState } from '@/components/admin/shared/EmptyState';

interface PoisPageProps {
    params: Promise<{
        locale: string;
    }>;
}

export default function PoisPage({ params }: PoisPageProps) {
    const { locale } = use(params);
    const t = useTranslations('PoisPage');
    const searchParams = useSearchParams();

    // Capture BOTH parameters from URL
    const initialSearch = searchParams.get('search') || '';
    const initialCategory = searchParams.get('category') || undefined;

    // Initialize filters with both values
    const [filters, setFilters] = useState<GetPOIsParams>({ 
        page: 1, 
        limit: 12,
        search: initialSearch || undefined,
        category: initialCategory 
    });

    const { data, isLoading, isError, error } = useGetFilteredPOIsQuery(filters);

    const handleFilterChange = (newFilters: Omit<GetPOIsParams, 'page'>) => {
        setFilters((prev) => ({
            ...prev,
            ...newFilters,
            page: 1, 
        }));
    };

    const handlePageChange = (newPage: number) => {
        setFilters((prev) => ({
            ...prev,
            page: newPage,
        }));
    };

    const renderContent = () => {
        if (isLoading) return <LoadingState message={t('loading')} />;
        if (isError) {
            console.error('Error loading POIs:', error);
            return <ErrorState error={t('error')} onRetry={() => {}} />;
        }
        if (!data || data.data.pois.length === 0) {
            return <EmptyState title={t('noPois')} />;
        }

        return (
            <>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {data.data.pois.map((poi) => (
                        <POICard key={poi.id} poi={poi} locale={locale} />
                    ))}
                </div>
                <PaginationControls
                    currentPage={data.data.currentPage}
                    totalPages={data.data.totalPages}
                    onPageChange={handlePageChange}
                />
            </>
        );
    };

    return (
        <div className="container mx-auto max-w-7xl px-4 py-8">
            <header className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">{t('title')}</h1>
                <p className="mt-1 text-lg text-gray-600">{t('subtitle')}</p>
            </header>

            <section className="mb-8">
                {/* Pass both initial values to the filters component */}
                <POIFilters 
                    locale={locale} 
                    onFilterChange={handleFilterChange} 
                    initialSearch={initialSearch}
                    initialCategory={initialCategory}
                />
            </section>

            <section>{renderContent()}</section>
        </div>
    );
}