'use client';

import Modal from './shared/Modal';
import SearchBar from './shared/SearchBar';
import { LoadingState } from './shared/LoadingState';
import { ErrorState } from './shared/ErrorState';
import { EmptyState } from './shared/EmptyState';
import { PageHeader } from './shared/PageHeader';
import { CardGrid } from './shared/CardGrid';
import { ThemeCard } from './themes/ThemeCard';
import { ThemeForm } from './themes/ThemeForm';
import { useThemeManagement } from './themes/useThemeManagement';
import { ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ThemeManagement() {
  const {
    themes,
    pagination,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    selectedTheme,
    isModalOpen,
    setIsModalOpen,
    formData,
    setFormData,
    iconPreview,
    imagePreview,
    isCreating,
    isUpdating,
    isDeleting,
    parseLoc,
    handleFileChange,
    handleSubmit,
    handleDelete,
    handleEdit,
    resetForm,
    refetch,
  } = useThemeManagement();

  if (isLoading) return <LoadingState message="Chargement des thèmes..." />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Thèmes"
        count={pagination?.totalCount || 0}
        onAdd={() => {
          resetForm();
          setIsModalOpen(true);
        }}
        addLabel="Nouveau Thème"
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Rechercher un thème..." />

        <div className="flex gap-2">
          <select
            value={filters.isActive === undefined ? '' : filters.isActive.toString()}
            onChange={(e) =>
              setFilters({
                ...filters,
                isActive: e.target.value === '' ? undefined : e.target.value === 'true',
                page: 1,
              })
            }
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous les statuts</option>
            <option value="true">Actifs</option>
            <option value="false">Inactifs</option>
          </select>

          <select
            value={filters.sortBy || ''}
            onChange={(e) =>
              setFilters({
                ...filters,
                sortBy: e.target.value as 'newest' | 'oldest' | 'name' | undefined,
                page: 1,
              })
            }
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="newest">Plus récents</option>
            <option value="oldest">Plus anciens</option>
            <option value="name">Par nom</option>
          </select>
        </div>
      </div>

      {themes.length === 0 ? (
        <EmptyState
          icon={<ImageIcon className="w-16 h-16 text-gray-400 mx-auto" />}
          title="Aucun thème trouvé"
          action={
            !searchTerm
              ? {
                  label: 'Créer le premier thème',
                  onClick: () => setIsModalOpen(true),
                }
              : undefined
          }
        />
      ) : (
        <>
          <CardGrid columns={4}>
            {themes.map((theme) => (
              <ThemeCard
                key={theme.id}
                theme={theme}
                onEdit={() => handleEdit(theme)}
                onDelete={() => handleDelete(theme.id)}
                isDeleting={isDeleting}
                parseLoc={parseLoc}
              />
            ))}
          </CardGrid>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t pt-4">
              <p className="text-sm text-gray-600">
                Page {pagination.currentPage} sur {pagination.totalPages} ({pagination.totalCount} thèmes)
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                  disabled={!pagination.hasPreviousPage}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Précédent
                </button>
                <button
                  onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                  disabled={!pagination.hasNextPage}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 flex items-center gap-2"
                >
                  Suivant
                  <ChevronRight className="w-4 h-4" />
                </button>
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
        title={selectedTheme ? 'Modifier le Thème' : 'Nouveau Thème'}
        size="max-w-4xl"
      >
        <ThemeForm
          formData={formData}
          onFormDataChange={setFormData}
          onIconChange={(file) => handleFileChange(file, 'icon')}
          onImageChange={(file) => handleFileChange(file, 'image')}
          iconPreview={iconPreview}
          imagePreview={imagePreview}
          selectedTheme={selectedTheme}
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
