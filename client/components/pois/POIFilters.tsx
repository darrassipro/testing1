// client/components/pois/POIFilters.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { GetPOIsParams } from '@/services/api/PoiApi';
import { useDebounce } from '@/hooks/useDebounce';
import { useGetAllCategoriesQuery } from '@/services/api/CategoryApi';
import { useGetAllCitiesQuery } from '@/services/api/CityApi';

// Supposant que vous utilisez shadcn/ui
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
	locale: string; // Pour afficher la bonne langue
	onFilterChange: (filters: GetPOIsParams) => void;
}

const POIFilters: React.FC<POIFiltersProps> = ({
	locale,
	onFilterChange,
}) => {
	const t = useTranslations('PoiFilters');

	// États locaux pour les filtres
	const [search, setSearch] = useState('');
	const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
	const [cityId, setCityId] = useState<string | undefined>(undefined);
	const [isPremium, setIsPremium] = useState(false);

	// Valeur débriéfée pour la recherche
	const debouncedSearch = useDebounce(search, 300);

	// Récupérer les catégories et les villes pour les dropdowns
	const { data: categoriesData } = useGetAllCategoriesQuery();
	const { data: citiesData } = useGetAllCitiesQuery();

	// Quand un filtre change, appeler la fonction parente
	useEffect(() => {
		onFilterChange({
			search: debouncedSearch || undefined,
			category: categoryId,
			cityId: cityId,
			isPremium: isPremium,
		});
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [debouncedSearch, categoryId, cityId, isPremium]);

	return (
		<div className="grid grid-cols-1 gap-4 rounded-lg border bg-white p-4 shadow-sm md:grid-cols-4">
			{/* 1. Barre de recherche */}
			<div className="md:col-span-2">
				<Input
					placeholder={t('searchPlaceholder')}
					value={search}
					onChange={(e) => setSearch(e.target.value)}
				/>
			</div>

			{/* 2. Filtre Catégorie */}
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
                        {categoriesData?.data?.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                                {(category as any)[locale as 'fr' | 'en' | 'ar']?.name || (category as any).fr?.name || (category as any).name || '—'}
                            </SelectItem>
                        ))}
					</SelectContent>
				</Select>
			</div>

			{/* 3. Filtre Ville */}
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
						{citiesData?.data?.map((city) => (
							<SelectItem key={city.id} value={city.id}>
								{city.name} {/* Ajustez si la ville a des localisations */}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{/* 4. Filtre Premium */}
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