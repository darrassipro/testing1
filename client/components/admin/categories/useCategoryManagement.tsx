'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  useGetFilteredCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  type Category,
} from '@/services/api/CategoryApi';
import { logError } from "@/lib/logger";

interface CategoryFormData {
  localizations: {
    fr: { name: string; desc: string };
    ar: { name: string; desc: string };
    en: { name: string; desc: string };
  };
  isActive: boolean;
}

const initialFormData: CategoryFormData = {
  localizations: {
    fr: { name: '', desc: '' },
    ar: { name: '', desc: '' },
    en: { name: '', desc: '' },
  },
  isActive: true,
};

export function useCategoryManagement() {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 100,
    search: '',
    isActive: undefined as boolean | undefined,
    sortBy: 'id' as 'id' | 'name' | 'newest' | 'oldest',
  });

  const { data: categoriesData, isLoading, error, refetch } = useGetFilteredCategoriesQuery(filters);
  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<CategoryFormData>(initialFormData);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string>('');

  // Update search filter with debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchTerm, page: 1 }));
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const categories = categoriesData?.data?.categories || [];
  const totalCount = categoriesData?.data?.totalCount || 0;
  const totalPages = categoriesData?.data?.totalPages || 1;
  const currentPage = categoriesData?.data?.currentPage || 1;
  const hasNextPage = categoriesData?.data?.hasNextPage || false;
  const hasPreviousPage = categoriesData?.data?.hasPreviousPage || false;

  // Parser les localisations
const parseLoc = (loc: string | any): { name: string; desc: string } => {
  if (typeof loc === 'string') {
    try {
      const cleaned = loc.replace(/^"+|"+$/g, '');
      const unescaped = cleaned.replace(/\\"/g, '"');
      const parsed = JSON.parse(unescaped);
      return {
        name: parsed.name || '',
        desc: parsed.desc || '',
      };
    } catch (err) {
      console.warn('Failed to parse localization:', loc, err);
      return { name: '', desc: '' };
    }
  }

  return {
    name: loc?.name || '',
    desc: loc?.desc || '',
  };
};

  // Gestion de l'icône
  const handleIconChange = (file: File) => {
    setIconFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setIconPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation: Au moins un nom requis
    if (
      !formData.localizations.fr.name &&
      !formData.localizations.ar.name &&
      !formData.localizations.en.name
    ) {
      toast.error('Au moins un nom de localisation est requis (FR, AR ou EN)');
      return;
    }

    try {
      const formPayload = new FormData();
      formPayload.append('localizations[fr]', JSON.stringify(formData.localizations.fr));
      formPayload.append('localizations[ar]', JSON.stringify(formData.localizations.ar));
      formPayload.append('localizations[en]', JSON.stringify(formData.localizations.en));
      formPayload.append('isActive', String(formData.isActive));
      if (iconFile) {
        formPayload.append('icon', iconFile);
      }

      if (selectedCategory) {
        await updateCategory({ id: selectedCategory.id, formData: formPayload }).unwrap();
        toast.success('Catégorie mise à jour avec succès');
      } else {
        await createCategory(formPayload).unwrap();
        toast.success('Catégorie créée avec succès');
      }

      refetch();
      setIsModalOpen(false);
      resetForm();
    } catch (error: any) {
      logError("Failed to save category", error);
      toast.error(error?.data?.message || "Erreur lors de l'enregistrement");
    }
  };

  // Suppression d'une catégorie
  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) return;

    try {
      await deleteCategory(id).unwrap();
      toast.success('Catégorie supprimée avec succès');
      refetch();
    } catch (error: any) {
      console.error('Error deleting category:', error);
      toast.error(error?.data?.message || 'Erreur lors de la suppression');
    }
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setSelectedCategory(null);
    setFormData(initialFormData);
    setIconFile(null);
    setIconPreview('');
  };

  // Éditer une catégorie
  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setFormData({
      localizations: {
        fr: parseLoc(category.fr),
        ar: parseLoc(category.ar),
        en: parseLoc(category.en),
      },
      isActive: category.isActive,
    });
    setIconPreview(category.icon || '');
    setIconFile(null);
    setIsModalOpen(true);
  };

  return {
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
  };
}