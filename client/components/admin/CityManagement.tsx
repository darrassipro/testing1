'use client';

import Modal from './shared/Modal';
import SearchBar from './shared/SearchBar';
import { LoadingState } from './shared/LoadingState';
import { ErrorState } from './shared/ErrorState';
import { EmptyState } from './shared/EmptyState';
import { PageHeader } from './shared/PageHeader';
import { CardGrid } from './shared/CardGrid';
import { CityCard } from './cities/CityCard';
import { CityForm } from './cities/CityForm';
import { useCityManagement } from './cities/useCityManagement';
import { MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CitiesPageProps {
  locale?: string;
}
export default function CityManagement({ locale = 'fr' }: CitiesPageProps) {
  const {
    cities,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    selectedCity,
    isModalOpen,
    setIsModalOpen,
    formData,
    setFormData,
    imagePreview,
    isCreating,
    isUpdating,
    isDeleting,
    handleImageChange,
    handleSubmit,
    handleDelete,
    handleEdit,
    handleLocationSelect,
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
  } = useCityManagement();

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  if (isLoading) return <LoadingState message="Chargement des villes..." />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Villes"
        count={totalCount}
        onAdd={() => {
          resetForm();
          setIsModalOpen(true);
        }}
        addLabel="Nouvelle Ville"
      />

      <SearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Rechercher une ville..."
      />

      {/* Filter controls */}
      <div className="flex gap-4 flex-wrap">
        <select
          value={filters.isActive === undefined ? '' : filters.isActive ? 'true' : 'false'}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              isActive: e.target.value === '' ? undefined : e.target.value === 'true',
              page: 1,
            }))
          }
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tous les statuts</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>

        <select
          value={filters.sortBy}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, sortBy: e.target.value as any, page: 1 }))
          }
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="name">Par nom</option>
          <option value="newest">Plus récentes</option>
          <option value="oldest">Plus anciennes</option>
        </select>
      </div>

      {cities.length === 0 ? (
        <EmptyState
          icon={<MapPin className="w-16 h-16 text-gray-400 mx-auto" />}
          title="Aucune ville trouvée"
          description={searchTerm ? 'Aucun résultat pour votre recherche' : 'Aucune ville disponible'}
          action={
            !searchTerm
              ? {
                  label: 'Créer la première ville',
                  onClick: () => setIsModalOpen(true),
                }
              : undefined
          }
        />
      ) : (
        <>
          <CardGrid columns={3}>
            {cities.map((city) => (
              <CityCard
                key={city.id}
                city={city}
                onEdit={() => handleEdit(city)}
                onDelete={() => handleDelete(city.id)}
                isDeleting={isDeleting}
              />
            ))}
          </CardGrid>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t pt-4">
              <div className="text-sm text-gray-700">
                Page {currentPage} sur {totalPages} • {totalCount} ville{totalCount > 1 ? 's' : ''}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!hasPreviousPage}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Précédent
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!hasNextPage}
                >
                  Suivant
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
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
        title={selectedCity ? 'Modifier la Ville' : 'Nouvelle Ville'}
        size="max-w-5xl"
      >
        <CityForm
          formData={formData}
          onFormDataChange={setFormData}
          onImageChange={handleImageChange}
          onLocationSelect={handleLocationSelect}
          imagePreview={imagePreview}
          selectedCity={selectedCity}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false);
            resetForm();
          }}
          isSubmitting={isCreating || isUpdating}
        />
      </Modal>
    </div>
  );
}