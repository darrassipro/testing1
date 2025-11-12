'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  useGetPendingReviewsQuery,
  useApproveReviewMutation,
  useDenyReviewMutation,
  useDeleteReviewMutation,
} from '@/services/api/ReviewApi';
import { useDebounce } from '@/hooks/useDebounce';

export function useReviewManagement() {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: 'pending' as 'pending' | 'accepted' | 'denied',
  });

  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [isDenyModalOpen, setIsDenyModalOpen] = useState(false);
  const [denyReason, setDenyReason] = useState('');

  // Fetch reviews
  const { data: reviewsData, isLoading, error, refetch } = useGetPendingReviewsQuery(filters);

  // Mutations
  const [approveReview, { isLoading: isApproving }] = useApproveReviewMutation();
  const [denyReview, { isLoading: isDenying }] = useDenyReviewMutation();
  const [deleteReview, { isLoading: isDeleting }] = useDeleteReviewMutation();

  const reviews = reviewsData?.data?.reviews || [];
  const pagination = reviewsData?.data
    ? {
        totalCount: reviewsData.data.totalItems,
        currentPage: reviewsData.data.currentPage,
        totalPages: reviewsData.data.totalPages,
        hasNextPage: reviewsData.data.currentPage < reviewsData.data.totalPages,
        hasPreviousPage: reviewsData.data.currentPage > 1,
      }
    : null;

  // Helper to parse localized fields
  const parseLoc = (val: any) => {
    if (!val) return null;
    if (typeof val === 'string') {
      try {
        return JSON.parse(val);
      } catch {
        return null;
      }
    }
    return typeof val === 'object' ? val : null;
  };

  // Handle approve
  const handleApprove = async (reviewId: string) => {
    try {
      await approveReview(reviewId).unwrap();
      toast.success('Avis approuvé avec succès');
      refetch();
    } catch (error: any) {
      console.error('Error approving review:', error);
      toast.error(error?.data?.message || 'Erreur lors de l\'approbation de l\'avis');
    }
  };

  // Open deny modal
  const openDenyModal = (review: any) => {
    setSelectedReview(review);
    setDenyReason('');
    setIsDenyModalOpen(true);
  };

  // Handle deny
  const handleDeny = async () => {
    if (!selectedReview || !denyReason.trim()) {
      toast.error('Veuillez fournir une raison de refus');
      return;
    }

    try {
      await denyReview({
        reviewId: selectedReview.id,
        reason: denyReason.trim(),
      }).unwrap();
      toast.success('Avis refusé avec succès');
      setIsDenyModalOpen(false);
      setSelectedReview(null);
      setDenyReason('');
      refetch();
    } catch (error: any) {
      console.error('Error denying review:', error);
      toast.error(error?.data?.message || 'Erreur lors du refus de l\'avis');
    }
  };

  // Handle delete
  const handleDelete = async (reviewId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet avis définitivement ?')) {
      return;
    }

    try {
      await deleteReview(reviewId).unwrap();
      toast.success('Avis supprimé avec succès');
      refetch();
    } catch (error: any) {
      console.error('Error deleting review:', error);
      toast.error(error?.data?.message || 'Erreur lors de la suppression de l\'avis');
    }
  };

  return {
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
  };
}
