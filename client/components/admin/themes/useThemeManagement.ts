'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  useGetFilteredThemesQuery,
  useCreateThemeMutation,
  useUpdateThemeMutation,
  useDeleteThemeMutation,
  type Theme,
} from '@/services/api/ThemeApi';
import { compressImageByType } from '@/utils/imageCompression';
import { useDebounce } from '@/hooks/useDebounce';

interface ThemeFormData {
  localizations: {
    fr: { name: string; desc: string };
    ar: { name: string; desc: string };
    en: { name: string; desc: string };
  };
  color: string;
  isActive: boolean;
}

const initialFormData: ThemeFormData = {
  localizations: {
    fr: { name: '', desc: '' },
    ar: { name: '', desc: '' },
    en: { name: '', desc: '' },
  },
  color: '#4f46e5',
  isActive: true,
};

export function useThemeManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    isActive: undefined as boolean | undefined,
    sortBy: 'newest' as 'newest' | 'oldest' | 'name' | undefined,
  });

  const debouncedSearch = useDebounce(searchTerm, 300);

  useEffect(() => {
    setFilters(prev => ({ ...prev, search: debouncedSearch, page: 1 }));
  }, [debouncedSearch]);

  const { data: themesData, isLoading, error, refetch } = useGetFilteredThemesQuery(filters);
  const [createTheme, { isLoading: isCreating }] = useCreateThemeMutation();
  const [updateTheme, { isLoading: isUpdating }] = useUpdateThemeMutation();
  const [deleteTheme, { isLoading: isDeleting }] = useDeleteThemeMutation();

  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<ThemeFormData>(initialFormData);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const themes = themesData?.data || [];
  const pagination = themesData?.pagination;

  const parseLoc = (loc: any): { name: string; desc: string } => {
    if (typeof loc === 'string') {
      try {
        return JSON.parse(loc);
      } catch {
        return { name: '', desc: '' };
      }
    }
    return loc || { name: '', desc: '' };
  };

  const handleFileChange = async (file: File, type: 'icon' | 'image') => {
    try {
      const compressed = await compressImageByType(file);
      const previewUrl = URL.createObjectURL(compressed.file);
      
      if (type === 'icon') {
        setIconFile(compressed.file);
        setIconPreview(previewUrl);
      } else {
        setImageFile(compressed.file);
        setImagePreview(previewUrl);
      }
    } catch (error) {
      toast.error('Erreur lors de la compression du fichier');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.localizations.fr.name || !formData.localizations.ar.name || !formData.localizations.en.name) {
      toast.error('Veuillez remplir tous les noms de localisation');
      return;
    }

    if (!iconFile && !selectedTheme) {
      toast.error("L'icône est requise");
      return;
    }

    if (!imageFile && !selectedTheme) {
      toast.error("L'image est requise");
      return;
    }

    const apiFormData = new FormData();
    apiFormData.append('data', JSON.stringify(formData));
    if (iconFile) apiFormData.append('icon', iconFile);
    if (imageFile) apiFormData.append('image', imageFile);

    try {
      if (selectedTheme) {
        await updateTheme({ id: selectedTheme.id, formData: apiFormData }).unwrap();
        toast.success('Thème mis à jour avec succès');
      } else {
        await createTheme(apiFormData).unwrap();
        toast.success('Thème créé avec succès');
      }
      refetch();
      setIsModalOpen(false);
      resetForm();
    } catch (error: any) {
      console.error('Error saving theme:', error);
      toast.error(error?.data?.message || "Erreur lors de l'enregistrement");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce thème ?')) return;

    try {
      await deleteTheme(id).unwrap();
      toast.success('Thème supprimé avec succès');
      refetch();
    } catch (error: any) {
      console.error('Error deleting theme:', error);
      toast.error(error?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const resetForm = () => {
    setSelectedTheme(null);
    setFormData(initialFormData);
    setIconFile(null);
    setImageFile(null);
    setIconPreview(null);
    setImagePreview(null);
  };

  const handleEdit = (theme: Theme) => {
    setSelectedTheme(theme);
    setFormData({
      localizations: {
        fr: parseLoc(theme.fr),
        ar: parseLoc(theme.ar),
        en: parseLoc(theme.en),
      },
      color: theme.color || '#4f46e5',
      isActive: theme.isActive,
    });
    setIsModalOpen(true);
  };

  return {
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
  };
}