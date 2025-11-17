'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { GetPOIsParams } from '@/services/api/PoiApi';
import { useDebounce } from '@/hooks/useDebounce';
import { useGetAllCategoriesQuery } from '@/services/api/CategoryApi';
import { useGetAllCitiesQuery } from '@/services/api/CityApi';

import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface POIFiltersProps {
    locale: string;
    onFilterChange: (filters: GetPOIsParams) => void;
    initialSearch?: string;     // New Prop
    initialCategory?: string;   // New Prop
}

const POIFilters: React.FC<POIFiltersProps> = ({
    locale,
    onFilterChange,
    initialSearch = '',
    initialCategory = undefined,
}) => {
    const t = useTranslations('PoiFilters');

    // Initialize state with props
    const [search, setSearch] = useState(initialSearch);
    const [categoryId, setCategoryId] = useState<string | undefined>(initialCategory);
    const [cityId, setCityId] = useState<string | undefined>(undefined);
    const [isPremium, setIsPremium] = useState(false);

    const debouncedSearch = useDebounce(search, 300);

    const { data: categoriesData } = useGetAllCategoriesQuery();
    const { data: citiesData } = useGetAllCitiesQuery();

    // React to external changes (e.g. URL changes or navigation)
    useEffect(() => {
        if (initialSearch !== undefined) setSearch(initialSearch);
    }, [initialSearch]);

    useEffect(() => {
        if (initialCategory !== undefined) setCategoryId(initialCategory);
    }, [initialCategory]);

    useEffect(() => {
        onFilterChange({
            search: debouncedSearch || undefined,
            category: categoryId,
            cityId: cityId,
            isPremium: isPremium,
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearch, categoryId, cityId, isPremium]);

    const getCategoryName = (category: any) => {
        if (!category) return '—';
        let locData = category[locale] || category.fr || category.en || category.ar;
        if (typeof locData === 'string') {
            try {
                locData = JSON.parse(locData);
            } catch (e) {
                return '—';
            }
        }
        return locData?.name || '—';
    };

    return (
        <div className="grid grid-cols-1 gap-4 rounded-lg border bg-white p-4 shadow-sm md:grid-cols-4">
            <div className="md:col-span-2">
                <Input
                    placeholder={t('searchPlaceholder')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div>
                <Select
                    value={categoryId || 'all'}
                    onValueChange={(value) =>
                        setCategoryId(value === 'all' ? undefined : value)
                    }
                >
                    <SelectTrigger>
                        <SelectValue placeholder={t('categoryPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t('allCategories')}</SelectItem>
                        {categoriesData?.data?.map((category: any) => (
                            <SelectItem key={category.id} value={category.id}>
                                {getCategoryName(category)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div>
                <Select
                    onValueChange={(value) =>
                        setCityId(value === 'all' ? undefined : value)
                    }
                >
                    <SelectTrigger>
                        <SelectValue placeholder={t('cityPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t('allCities')}</SelectItem>
                        {citiesData?.data?.map((city: any) => (
                            <SelectItem key={city.id} value={city.id}>
                                {city.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex items-center space-x-2 md:col-start-4">
                <Checkbox
                    id="premium"
                    checked={isPremium}
                    onCheckedChange={(checked) => setIsPremium(checked as boolean)}
                />
                <Label htmlFor="premium" className="font-medium">
                    {t('premiumOnly')}
                </Label>
            </div>
        </div>
    );
};

export default POIFilters;