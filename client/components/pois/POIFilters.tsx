// client/components/pois/POIFilters.tsx
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
}

const POIFilters: React.FC<POIFiltersProps> = ({
	locale,
	onFilterChange,
}) => {
	const t = useTranslations('PoiFilters');

	const [search, setSearch] = useState('');
	const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
	const [cityId, setCityId] = useState<string | undefined>(undefined);
	const [isPremium, setIsPremium] = useState(false);

	const debouncedSearch = useDebounce(search, 300);

	const { data: categoriesData } = useGetAllCategoriesQuery();
	const { data: citiesData } = useGetAllCitiesQuery();

	useEffect(() => {
		onFilterChange({
			search: debouncedSearch || undefined,
			category: categoryId,
			cityId: cityId,
			isPremium: isPremium,
		});
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [debouncedSearch, categoryId, cityId, isPremium]);

    // ✅ Helper to safely extract category name
    const getCategoryName = (category: any) => {
        if (!category) return '—';

        // Try to access the localized object (fr, en, ar)
        // It might be directly accessible or inside category[locale]
        let locData = category[locale] || category.fr || category.en || category.ar;

        // If it's a string (JSON), parse it
        if (typeof locData === 'string') {
            try {
                locData = JSON.parse(locData);
            } catch (e) {
                return '—';
            }
        }

        // Return name if object exists
        if (locData && typeof locData === 'object' && 'name' in locData) {
            return locData.name;
        }

        return '—';
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