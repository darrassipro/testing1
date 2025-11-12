'use client';

import Modal from './shared/Modal';
import SearchBar from './shared/SearchBar';
import { LoadingState } from './shared/LoadingState';
import { ErrorState } from './shared/ErrorState';
import { EmptyState } from './shared/EmptyState';
import { PageHeader } from './shared/PageHeader';
import { CardGrid } from './shared/CardGrid';
import { POICard } from './pois/POICard';
import { POIForm } from './pois/POIForm';
import { usePOIManagement } from './pois/usePOIManagement';
import { Map, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function POIManagement() {
  const {
    pois,
    categories,
    cities,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    selectedPOI,
    isModalOpen,
    setIsModalOpen,
    formData,
    setFormData,
    isCreating,
    isUpdating,
    isDeleting,
    handleFileChange,
    handleRemoveFile,
    files,
    handleSubmit,
    handleDelete,
    handleEdit,
    resetForm,
    refetch,
    getCategoryName,
    getCityName,
    // Pagination
    totalPages,
    currentPage,
    totalCount,
    hasNextPage,
    hasPreviousPage,
    setFilters,
    filters,
  } = usePOIManagement();

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  if (isLoading) return <LoadingState message="Chargement des POIs..." />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Points d'Intérêt"
        count={totalCount}
        onAdd={() => {
          resetForm();
          setIsModalOpen(true);
        }}
        addLabel="Nouveau POI"
      />

      <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Rechercher un POI..." />

      {/* Filter controls */}
      <div className="flex gap-4 flex-wrap">
        <select
          value={filters.category || ''}
          onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value || undefined, page: 1 }))}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Toutes les catégories</option>
          {categories.map((cat: any) => (
            <option key={cat.id} value={cat.id}>
              {getCategoryName(cat.id)}
            </option>
          ))}
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
            sortBy: e.target.value as 'newest' | 'oldest' | 'name',
            page: 1 
          }))}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="newest">Plus récents</option>
          <option value="oldest">Plus anciens</option>
          <option value="name">Par nom</option>
        </select>
      </div>

      {pois.length === 0 ? (
        <EmptyState
          icon={<Map className="w-16 h-16 text-gray-400 mx-auto" />}
          title="Aucun POI trouvé"
          action={
            !searchTerm && !filters.category && !filters.cityId
              ? {
                  label: 'Créer le premier POI',
                  onClick: () => setIsModalOpen(true),
                }
              : undefined
          }
        />
      ) : (
        <>
          <CardGrid>
            {pois.map((poi) => (
              <POICard 
                getCityName={getCityName}
                getCategoryName={getCategoryName}
                key={poi.id}
                poi={poi}
                onEdit={() => handleEdit(poi)}
                onDelete={() => handleDelete(poi.id)}
                isDeleting={isDeleting}
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
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        variant={currentPage === page ? "default" : "outline"}
                        className="relative inline-flex items-center px-4 py-2 text-sm"
                      >
                        {page}
                      </Button>
                    ))}

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
        title={selectedPOI ? 'Modifier le POI' : 'Nouveau POI'}
        size="max-w-6xl"
      >
        <POIForm
          formData={formData}
          onFormDataChange={setFormData}
          onFileChange={handleFileChange}
          onRemoveFile={handleRemoveFile}
          files={files}
          categories={categories}
          cities={cities}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false);
            resetForm();
          }}
          isSubmitting={isCreating || isUpdating}
          selectedPOI={selectedPOI}
        />
      </Modal>
    </div>
  );
}