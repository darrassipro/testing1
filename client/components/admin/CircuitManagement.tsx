'use client';

import Modal from './shared/Modal';
import SearchBar from './shared/SearchBar';
import { LoadingState } from './shared/LoadingState';
import { ErrorState } from './shared/ErrorState';
import { EmptyState } from './shared/EmptyState';
import { PageHeader } from './shared/PageHeader';
import { CardGrid } from './shared/CardGrid';
import { CircuitCard } from './circuits/CircuitCard';
import { CircuitForm } from './circuits/CircuitForm';
import { useCircuitManagement } from './circuits/useCircuitManagement';
import { Route, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CircuitManagementProps {
  locale?: string;
}

export default function CircuitManagement({ locale = 'fr' }: CircuitManagementProps) {
  const {
    circuits,
    cities,
    themes,
    pois,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    selectedCircuit,
    isModalOpen,
    setIsModalOpen,
    formData,
    setFormData,
    imagePreview,
    isCreating,
    isUpdating,
    isDeleting,
    parseLoc,
    handleImageChange,
    handleSubmit,
    handleDelete,
    handleEdit,
    resetForm,
    refetch,
    // Pagination
    totalPages,
    currentPage,
    totalCount,
    hasNextPage,
    hasPreviousPage,
    setFilters,
    filters,
  } = useCircuitManagement();

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  if (isLoading) return <LoadingState message="Chargement des circuits..." />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  // Trier les POIs de chaque circuit par CircuitPOI.order avant affichage/utilisation
  const sortedCircuits = circuits.map((c: any) => ({
    ...c,
    pois: [...(c.pois || [])].sort(
      (a: any, b: any) => (a?.CircuitPOI?.order ?? 0) - (b?.CircuitPOI?.order ?? 0)
    ),
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Circuits"
        count={totalCount}
        onAdd={() => {
          resetForm();
          setIsModalOpen(true);
        }}
        addLabel="Nouveau Circuit"
      />

      <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Rechercher un circuit..." />

      {/* Filter controls */}
      <div className="flex gap-4 flex-wrap">
        <select
          value={filters.themeId || ''}
          onChange={(e) => setFilters((prev) => ({ ...prev, themeId: e.target.value || undefined, page: 1 }))}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tous les thèmes</option>
          {themes.map((theme: any) => {
            const themeName = parseLoc(theme.fr).name || parseLoc(theme.en).name || parseLoc(theme.ar).name || 'Sans nom';
            return (
              <option key={theme.id} value={theme.id}>
                {themeName}
              </option>
            );
          })}
        </select>

        <select
          value={filters.cityId || ''}
          onChange={(e) => setFilters((prev) => ({ ...prev, cityId: e.target.value || undefined, page: 1 }))}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Toutes les villes</option>
          {cities.map((city: any) => (
            <option key={city.id} value={city.id}>
              {city.name}
            </option>
          ))}
        </select>

        <select
          value={filters.isActive === undefined ? '' : filters.isActive ? 'true' : 'false'}
          onChange={(e) => setFilters((prev) => ({ 
            ...prev, 
            isActive: e.target.value === '' ? undefined : e.target.value === 'true',
            page: 1 
          }))}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tous les statuts</option>
          <option value="true">Actifs</option>
          <option value="false">Inactifs</option>
        </select>

        <select
          value={filters.isPremium === undefined ? '' : filters.isPremium ? 'true' : 'false'}
          onChange={(e) => setFilters((prev) => ({ 
            ...prev, 
            isPremium: e.target.value === '' ? undefined : e.target.value === 'true',
            page: 1 
          }))}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Premium / Standard</option>
          <option value="true">Premium</option>
          <option value="false">Standard</option>
        </select>

        <select
          value={filters.sortBy || 'newest'}
          onChange={(e) => setFilters((prev) => ({ 
            ...prev, 
            sortBy: e.target.value as 'newest' | 'popular' | 'rating',
            page: 1 
          }))}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="newest">Plus récents</option>
          <option value="popular">Plus populaires</option>
          <option value="rating">Mieux notés</option>
        </select>
      </div>

      {circuits.length === 0 ? (
        <EmptyState
          icon={<Route className="w-16 h-16 text-gray-400 mx-auto" />}
          title="Aucun circuit trouvé"
          action={
            !searchTerm && !filters.themeId && !filters.cityId
              ? {
                  label: 'Créer le premier circuit',
                  onClick: () => setIsModalOpen(true),
                }
              : undefined
          }
        />
      ) : (  
        <>
          <CardGrid>
            {sortedCircuits.map((circuit) => (
              <CircuitCard
                key={circuit.id}
                circuit={circuit}
                onEdit={() => handleEdit(circuit)}
                onDelete={() => handleDelete(circuit.id)}
                isDeleting={isDeleting}
                parseLoc={parseLoc}
              />
            ))}
          </CardGrid>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6">
              <div className="flex flex-1 justify-between sm:hidden">
                <Button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!hasPreviousPage}
                  variant="outline"
                >
                  Précédent
                </Button>
                <Button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!hasNextPage}
                  variant="outline"
                >
                  Suivant
                </Button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Affichage de <span className="font-medium">{(currentPage - 1) * (filters.limit || 100) + 1}</span> à{' '}
                    <span className="font-medium">{Math.min(currentPage * (filters.limit || 100), totalCount)}</span> sur{' '}
                    <span className="font-medium">{totalCount}</span> résultats
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <Button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={!hasPreviousPage}
                      variant="outline"
                      className="relative inline-flex items-center rounded-l-md px-2 py-2"
                    >
                      <span className="sr-only">Précédent</span>
                      <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                    </Button>
                    
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <Button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          className="relative inline-flex items-center px-4 py-2 text-sm"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}

                    <Button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={!hasNextPage}
                      variant="outline"
                      className="relative inline-flex items-center rounded-r-md px-2 py-2"
                    >
                      <span className="sr-only">Suivant</span>
                      <ChevronRight className="h-5 w-5" aria-hidden="true" />
                    </Button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={selectedCircuit ? 'Modifier le Circuit' : 'Nouveau Circuit'}
        size="max-w-5xl"
      >
        <CircuitForm
          formData={formData}
          onFormDataChange={setFormData}
          onSelectedPOIsChange={(list) => setFormData((prev: any) => ({ ...prev, poiIds: list }))}
          onSelectedPOIsDetailsChange={(details: any[]) => setFormData((prev: any) => ({ ...prev, selectedPOIs: details }))}
          onImageChange={handleImageChange}
          imagePreview={imagePreview}
          cities={cities}
          themes={themes}
          pois={pois}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false);
            resetForm();
          }}
          isSubmitting={isCreating || isUpdating}
          selectedCircuit={selectedCircuit}
          parseLoc={parseLoc}
        />
      </Modal>
    </div>
  );
}