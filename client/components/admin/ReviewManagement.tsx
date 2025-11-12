'use client';

import React from 'react';
import { MessageSquare, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { LoadingState } from './shared/LoadingState';
import { ErrorState } from './shared/ErrorState';
import { EmptyState } from './shared/EmptyState';
import { PageHeader } from './shared/PageHeader';
import { ReviewCard } from './reviews/ReviewCard';
import { useReviewManagement } from './reviews/useReviewManagement';
import Modal from './shared/Modal';

export default function ReviewManagement() {
  const {
    reviews,
    pagination,
    isLoading,
    error,
    filters,
    setFilters,
    selectedReview,
    isDenyModalOpen,
    setIsDenyModalOpen,
    denyReason,
    setDenyReason,
    isApproving,
    isDenying,
    isDeleting,
    parseLoc,
    handleApprove,
    openDenyModal,
    handleDeny,
    handleDelete,
    refetch,
  } = useReviewManagement();

  if (isLoading) return <LoadingState message="Chargement des avis..." />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestion des Avis"
        count={pagination?.totalCount || 0}
      />

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setFilters({ ...filters, status: 'pending', page: 1 })}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filters.status === 'pending'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            En attente
          </button>
          <button
            onClick={() => setFilters({ ...filters, status: 'accepted', page: 1 })}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filters.status === 'accepted'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Approuvés
          </button>
          <button
            onClick={() => setFilters({ ...filters, status: 'denied', page: 1 })}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filters.status === 'denied'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Refusés
          </button>
        </div>

        <select
          value={filters.limit}
          onChange={(e) =>
            setFilters({
              ...filters,
              limit: parseInt(e.target.value),
              page: 1,
            })
          }
          className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={10}>10 par page</option>
          <option value={20}>20 par page</option>
          <option value={50}>50 par page</option>
        </select>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <EmptyState
          icon={<MessageSquare className="w-16 h-16 text-gray-400 mx-auto" />}
          title={
            filters.status === 'pending'
              ? 'Aucun avis en attente'
              : filters.status === 'accepted'
              ? 'Aucun avis approuvé'
              : 'Aucun avis refusé'
          }
        />
      ) : (
        <>
          <div className="space-y-4">
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onApprove={handleApprove}
                onDeny={openDenyModal}
                onDelete={handleDelete}
                isApproving={isApproving}
                isDenying={isDenying}
                isDeleting={isDeleting}
                parseLoc={parseLoc}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t pt-4">
              <p className="text-sm text-gray-600">
                Page {pagination.currentPage} sur {pagination.totalPages} ({pagination.totalCount}{' '}
                avis)
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

      {/* Deny Modal */}
      <Modal
        isOpen={isDenyModalOpen}
        onClose={() => {
          setIsDenyModalOpen(false);
          setDenyReason('');
        }}
        title="Refuser l'avis"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Veuillez fournir une raison pour le refus de cet avis. Cette raison sera visible par
            l'utilisateur.
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Raison du refus *
            </label>
            <textarea
              value={denyReason}
              onChange={(e) => setDenyReason(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Contenu inapproprié, spam, hors sujet, etc."
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4">
            <button
              onClick={() => {
                setIsDenyModalOpen(false);
                setDenyReason('');
              }}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              onClick={handleDeny}
              disabled={isDenying || !denyReason.trim()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isDenying ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Refus en cours...
                </>
              ) : (
                <>
                  <X className="w-4 h-4" />
                  Confirmer le refus
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
