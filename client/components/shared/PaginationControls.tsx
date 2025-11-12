// client/components/shared/PaginationControls.tsx
'use client';

import React from 'react';
// Assumant l'utilisation de shadcn/ui Button
import { Button } from '@/components/ui/button'; 
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationControlsProps {
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
	currentPage,
	totalPages,
	onPageChange,
}) => {
	const canGoPrev = currentPage > 1;
	const canGoNext = currentPage < totalPages;

	if (totalPages <= 1) {
		return null; // Ne rien afficher s'il n'y a qu'une page
	}

	return (
		<div className="flex items-center justify-center gap-4 py-8">
			<Button
				variant="outline"
				size="icon"
				onClick={() => onPageChange(currentPage - 1)}
				disabled={!canGoPrev}
				aria-label="Previous Page"
			>
				<ChevronLeft className="h-4 w-4" />
			</Button>
			<span className="text-sm font-medium">
				Page {currentPage} sur {totalPages}
			</span>
			<Button
				variant="outline"
				size="icon"
				onClick={() => onPageChange(currentPage + 1)}
				disabled={!canGoNext}
				aria-label="Next Page"
			>
				<ChevronRight className="h-4 w-4" />
			</Button>
		</div>
	);
};

export default PaginationControls;