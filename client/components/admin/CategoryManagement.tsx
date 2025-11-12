'use client';

import Modal from './shared/Modal';
import SearchBar from './shared/SearchBar';
import { LoadingState } from './shared/LoadingState';
import { ErrorState } from './shared/ErrorState';
import { EmptyState } from './shared/EmptyState';
import { PageHeader } from './shared/PageHeader';
import { CardGrid } from './shared/CardGrid';
import { CategoryCard } from './categories/CategoryCard';
import { CategoryForm } from './categories/CategoryForm';
import { useCategoryManagement } from './categories/useCategoryManagement';
import { Folder, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CategoryManagement() {
  const {
    categories,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    isModalOpen,
    setIsModalOpen,
    formData,
    setFormData,
    iconPreview,
    isCreating,
    isUpdating,
    isDeleting,
    parseLoc,
    handleSubmit,
    handleDelete,
    handleEdit,
    handleIconChange,
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
  } = useCategoryManagement();

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  if (isLoading) return <LoadingState message="Chargement des catégories..." />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Catégories"
        count={totalCount}
        onAdd={() => {
          resetForm();
          setIsModalOpen(true);
        }}
        addLabel="Nouvelle Catégorie"
      />

      <SearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Rechercher une catégorie..."
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
          <option value="id">Par ID</option>
          <option value="name">Par nom</option>
          <option value="newest">Plus récentes</option>
          <option value="oldest">Plus anciennes</option>
        </select>
      </div>

      {categories.length === 0 ? (
        <EmptyState
          icon={<Folder className="w-16 h-16 text-gray-400 mx-auto" />}
          title="Aucune catégorie trouvée"
          description={searchTerm ? 'Aucun résultat pour votre recherche' : 'Aucune catégorie disponible'}
          action={
            !searchTerm
              ? {
                  label: 'Créer la première catégorie',
                  onClick: () => setIsModalOpen(true),
                }
              : undefined
          }
        />
      ) : (
        <>
          <CardGrid columns={4}>
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onEdit={() => handleEdit(category)}
                onDelete={() => handleDelete(category.id)}
                isDeleting={isDeleting}
                parseLoc={parseLoc}
              />
            ))}
          </CardGrid>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t pt-4">
              <div className="text-sm text-gray-700">
                Page {currentPage} sur {totalPages} • {totalCount} catégorie{totalCount > 1 ? 's' : ''}
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
        title={selectedCategory ? 'Modifier la Catégorie' : 'Nouvelle Catégorie'}
        size="max-w-3xl"
      >
        <CategoryForm
          formData={formData}
          onFormDataChange={setFormData}
          onIconChange={handleIconChange}
          iconPreview={iconPreview}
          selectedCategory={selectedCategory}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false);
            resetForm();
          }}
          isSubmitting={isCreating || isUpdating}
          parseLoc={parseLoc}
        />
      </Modal>
    </div>
  );
}