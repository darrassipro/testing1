// client/components/custom-circuits/POISelector.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from '@hello-pangea/dnd';
import { useGetAllPOIsQuery } from '@/services/api/PoiApi';
import { POI } from '@/lib/types';
import { useDebounce } from '@/hooks/useDebounce';
import { useTranslations } from 'next-intl';

// Import UI components
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LoadingState } from '@/components/admin/shared/LoadingState';
import { GripVertical, Plus, X } from 'lucide-react';

interface POISelectorProps {
	locale: string;
	initialSelectedPoiIds?: string[];
	onSelectionChange: (selectedPoiIds: string[]) => void;
}

// Sous-composant pour un item POI
const PoiItem: React.FC<{
	poi: POI;
	locale: string;
	isSelected?: boolean;
	onToggleSelect?: (poiId: string) => void;
	provided?: any; // Pour react-beautiful-dnd
	isDragging?: boolean;
}> = ({ poi, locale, isSelected, onToggleSelect, provided, isDragging }) => {
	const name =
		poi[locale as 'fr' | 'en' | 'ar']?.name || poi.frLocalization?.name || 'N/A';
	const address =
		poi[locale as 'fr' | 'en' | 'ar']?.address || poi.frLocalization?.address;

	return (
		<div
			ref={provided?.innerRef}
			{...provided?.draggableProps}
			className={`mb-2 flex items-center justify-between rounded-md border p-3 ${
				isDragging ? 'bg-blue-100 shadow-md' : 'bg-white'
			}`}
		>
			<div className="flex items-center gap-3 overflow-hidden">
				{provided?.dragHandleProps && (
					<div {...provided.dragHandleProps} className="cursor-grab text-gray-400">
						<GripVertical className="h-5 w-5" />
					</div>
				)}
				<div>
					<p className="truncate font-medium">{name}</p>
					{address && (
						<p className="truncate text-sm text-gray-500">{address}</p>
					)}
				</div>
			</div>
			{onToggleSelect && (
				<Button
					variant="ghost"
					size="icon"
					onClick={() => onToggleSelect(poi.id)}
					className={`ml-2 h-8 w-8 flex-shrink-0 rounded-full ${
						isSelected
							? 'bg-red-100 text-red-600 hover:bg-red-200'
							: 'bg-green-100 text-green-600 hover:bg-green-200'
					}`}
				>
					{isSelected ? (
						<X className="h-4 w-4" />
					) : (
						<Plus className="h-4 w-4" />
					)}
				</Button>
			)}
		</div>
	);
};

// Composant principal
const POISelector: React.FC<POISelectorProps> = ({
	locale,
	initialSelectedPoiIds = [],
	onSelectionChange,
}) => {
	const t = useTranslations('CustomCircuitCreate');
	const [search, setSearch] = useState('');
	const debouncedSearch = useDebounce(search, 300);

	// Garder une map pour un accès rapide aux détails des POIs sélectionnés
	const [selectedPoisMap, setSelectedPoisMap] = useState<Map<string, POI>>(
		new Map()
	);
	// Garder l'ordre des IDs sélectionnés
	const [orderedSelectedIds, setOrderedSelectedIds] = useState<string[]>(
		initialSelectedPoiIds
	);

	// Récupérer tous les POIs (ou ceux filtrés par la recherche)
	// Use getAllPOIs without pagination to get ALL POIs (no limit)
	const { data: poiData, isLoading } = useGetAllPOIsQuery({ 
		search: debouncedSearch || undefined,
		isActive: true // Only show active POIs
	});
	const availablePois = poiData?.pois || [];

	// Initialiser la map des POIs sélectionnés (si initialSelectedPoiIds est fourni)
	// Cet effet pourrait nécessiter d'ajuster l'API pour récupérer les détails des POIs initiaux
	useEffect(() => {
		// Placeholder: Normalement, il faudrait fetch les détails des POIs initiaux ici
		// et les mettre dans selectedPoisMap si `initialSelectedPoiIds` n'est pas vide.
		// Pour l'instant, on suppose qu'ils seront ajoutés lors de la sélection.
	}, [initialSelectedPoiIds]);

	// Mettre à jour la map et appeler onSelectionChange quand l'ordre change
	useEffect(() => {
		onSelectionChange(orderedSelectedIds);
		// Mettre à jour la map si des éléments sont ajoutés/supprimés
		const newMap = new Map<string, POI>();
		orderedSelectedIds.forEach((id) => {
			const poi =
				selectedPoisMap.get(id) || availablePois.find((p) => p.id === id);
			if (poi) {
				newMap.set(id, poi);
			}
		});
		setSelectedPoisMap(newMap);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [orderedSelectedIds, onSelectionChange]);

	// Ajouter/Supprimer un POI
	const handleToggleSelect = (poiId: string) => {
		const poi = availablePois.find((p) => p.id === poiId);
		if (!poi) return;

		setOrderedSelectedIds((prevIds) => {
			if (prevIds.includes(poiId)) {
				// Supprimer
				return prevIds.filter((id) => id !== poiId);
			} else {
				// Ajouter à la fin
				return [...prevIds, poiId];
			}
		});
	};

	// Gérer le Drag & Drop
	const onDragEnd = (result: DropResult) => {
		const { source, destination } = result;
		// Ignorer si déposé hors de la liste
		if (!destination) return;
		// Ignorer si déposé au même endroit
		if (
			destination.droppableId === source.droppableId &&
			destination.index === source.index
		) {
			return;
		}

		// Réordonner la liste des IDs sélectionnés
		const newOrderedIds = Array.from(orderedSelectedIds);
		const [reorderedItem] = newOrderedIds.splice(source.index, 1);
		newOrderedIds.splice(destination.index, 0, reorderedItem);

		setOrderedSelectedIds(newOrderedIds);
	};

	return (
		<DragDropContext onDragEnd={onDragEnd}>
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
				{/* Colonne Gauche: POIs Disponibles */}
				<div>
					<h3 className="mb-2 text-lg font-semibold">
						{t('availablePois')}
					</h3>
					<Input
						placeholder={t('searchPois')}
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="mb-4"
					/>
					<ScrollArea className="h-[400px] rounded-md border p-4">
						{isLoading ? (
							<LoadingState />
						) : availablePois.length === 0 ? (
							<p className="text-center text-gray-500">
								{t('noPoisFound')}
							</p>
						) : (
							availablePois.map((poi) => (
								<PoiItem
									key={poi.id}
									poi={poi}
									locale={locale}
									isSelected={orderedSelectedIds.includes(poi.id)}
									onToggleSelect={handleToggleSelect}
								/>
							))
						)}
					</ScrollArea>
				</div>

				{/* Colonne Droite: POIs Sélectionnés */}
				<div>
					<h3 className="mb-4 text-lg font-semibold">
						{t('selectedPois')} ({orderedSelectedIds.length})
					</h3>
					<Droppable droppableId="selectedPois">
						{(provided, snapshot) => (
							<ScrollArea
								ref={provided.innerRef}
								{...provided.droppableProps}
								className={`h-[400px] rounded-md border p-4 ${
									snapshot.isDraggingOver ? 'bg-blue-50' : 'bg-gray-50'
								}`}
							>
								{orderedSelectedIds.length === 0 ? (
									<p className="text-center text-gray-500">
										{t('dragPoisHere')}
									</p>
								) : (
									orderedSelectedIds.map((poiId, index) => {
										const poi = selectedPoisMap.get(poiId);
										// Afficher un placeholder si les détails ne sont pas encore chargés
										if (!poi) return null;
										return (
											<Draggable
												key={poi.id}
												draggableId={poi.id}
												index={index}
											>
												{(provided, snapshot) => (
													<PoiItem
														poi={poi}
														locale={locale}
														provided={provided}
														isDragging={snapshot.isDragging}
														// On ne permet pas de désélectionner depuis cette liste
													/>
												)}
											</Draggable>
										);
									})
								)}
								{provided.placeholder}
							</ScrollArea>
						)}
					</Droppable>
					<p className="mt-2 text-xs text-gray-500">
						{t('reorderHint')}
					</p>
				</div>
			</div>
		</DragDropContext>
	);
};

export default POISelector;