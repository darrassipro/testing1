'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  useGetFilteredPOIsQuery,
  useCreatePOIWithFilesMutation,
  useUpdatePOIMutation,
  useDeletePOIMutation,
  type POI,
  type GetPOIsParams,
} from '@/services/api/PoiApi';
import { useGetAllCategoriesQuery } from '@/services/api/CategoryApi';
import { useGetAllCitiesQuery } from '@/services/api/CityApi';
import { compressImageByType } from '@/utils/imageCompression';

interface POIFormData {
  category: string;
  cityId: string;
  latitude: string;
  longitude: string;
  address: string;
  practicalInfo: string;
  virtualTourUrl: string;
  isActive: boolean;
  isVerified: boolean;
  isPremium: boolean;
  frLocalization: {
    name: string;
    description: string;
    address: string;
  };
  arLocalization: {
    name: string;
    description: string;
    address: string;
  };
  enLocalization: {
    name: string;
    description: string;
    address: string;
  };
  filesToRemove?: string[];
  audioToRemove?: {
    fr: boolean;
    ar: boolean;
    en: boolean;
  };
}

const initialFormData: POIFormData = {
  category: '',
  cityId: '',
  latitude: '',
  longitude: '',
  address: '',
  practicalInfo: '{}',
  virtualTourUrl: '',
  isActive: true,
  isVerified: false,
  isPremium: false,
  frLocalization: { name: '', description: '', address: '' },
  arLocalization: { name: '', description: '', address: '' },
  enLocalization: { name: '', description: '', address: '' },
  filesToRemove: [], 
  audioToRemove: { fr: false, ar: false, en: false },
};

export function usePOIManagement() {
  // State for filters and pagination
  const [filters, setFilters] = useState<GetPOIsParams>({
    page: 1,
    limit: 100, // Show more items in admin
    sortBy: 'newest',
  });

  const { data: poisData, isLoading, error, refetch } = useGetFilteredPOIsQuery(filters);
  const { data: categoriesData } = useGetAllCategoriesQuery();
  const { data: citiesData } = useGetAllCitiesQuery();

  const [createPOIWithFiles, { isLoading: isCreating }] = useCreatePOIWithFilesMutation();
  const [updatePOI, { isLoading: isUpdating }] = useUpdatePOIMutation();
  const [deletePOI, { isLoading: isDeleting }] = useDeletePOIMutation();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPOI, setSelectedPOI] = useState<POI | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<POIFormData>(initialFormData);
  const [files, setFiles] = useState<Record<string, File[]>>({});

  const pois = poisData?.data?.pois || [];
  const categories = categoriesData?.data || [];
  const cities = citiesData?.data || [];

const getCategoryName = (categoryId: string): string => {
    const category = categories.find((c: any) => c.id === categoryId);
    if (!category) return 'Non catégorisé';

    // Helper pour extraire le nom, gère string, {name: string} et JSON stringifié
    const parseCategoryName = (langField: any): string | null => {
      if (!langField) return null;

      // Cas 1: C'est déjà un objet { name: "..." }
      if (typeof langField === 'object' && langField.name) {
        return langField.name;
      }

      // Cas 2: C'est une chaîne de caractères
      if (typeof langField === 'string') {
        try {
          // On tente un premier parse (pour "{\"name\":\"test\"}")
          let parsed = JSON.parse(langField);

          // Cas 3: C'est une chaîne "double-encodée" ("\"{\\\"name\\\":\\\"test\\\"}\"")
          // Le premier parse aura donné une *nouvelle* chaîne : "{\"name\":\"test\"}"
          if (typeof parsed === 'string') {
            parsed = JSON.parse(parsed); // On parse une deuxième fois
          }
          
          // Si on a un objet avec un 'name', on le retourne
          if (typeof parsed === 'object' && parsed.name) {
            return parsed.name;
          }

        } catch (e) {
          // Si le parsing échoue, c'est une chaîne simple comme "Histoire"
          if (langField.trim()) {
            return langField;
          }
        }
      }
      return null;
    };

    // On essaie le français, puis l'anglais, puis l'arabe
    const frName = parseCategoryName(category.fr);
    if (frName) return frName;

    const enName = parseCategoryName(category.en);
    if (enName) return enName;

    const arName = parseCategoryName(category.ar);
    if (arName) return arName;

    // Fallback
    return 'Sans nom';
  };


  // Helper pour récupérer le nom de ville
  const getCityName = (cityId: string): string => {
    const city = cities.find((c: any) => c.id === cityId);
    return city?.name || 'Inconnue';
  };

  // Gestion des fichiers multiples avec compression
  const handleFileChange = async (file: File, key: string) => {
    try {
      let processedFile = file;
      
      // Compresser les images uniquement
      if (key === 'image' && file.type.startsWith('image/')) {
        const compressed = await compressImageByType(file);
        processedFile = compressed.file;
        toast.success('Image compressée avec succès');
      } else {
        toast.success('Fichier chargé avec succès');
      }

      // Ajouter le fichier au tableau existant ou créer un nouveau tableau
      setFiles((prev) => ({
        ...prev,
        [key]: prev[key] ? [...prev[key], processedFile] : [processedFile],
      }));
    } catch (error) {
      toast.error('Erreur lors du chargement du fichier');
    }
  };

  // Supprimer un fichier spécifique
const handleRemoveFile = (key: string, index: number) => {
  setFiles((prev) => {
    const fileToRemove = prev[key][index];

    // Extract filePublicId if available
    const publicId = (fileToRemove as any)?.filePublicId;

    // Track it for deletion if it's an existing file (not a new upload)
    if (publicId) {
      setFormData((prevForm) => ({
        ...prevForm,
        filesToRemove: [...(prevForm.filesToRemove || []), publicId],
      }));
    }

    return {
      ...prev,
      [key]: prev[key].filter((_, i) => i !== index),
    };
  });

  toast.success('Fichier supprimé');
};


  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.category || !formData.cityId || !formData.latitude || !formData.longitude) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Validation: Au moins un nom de localisation requis
    if (
      !formData.frLocalization.name &&
      !formData.arLocalization.name &&
      !formData.enLocalization.name
    ) {
      toast.error('Au moins un nom de localisation est requis (FR, AR ou EN)');
      return;
    }

    // Valider le JSON practicalInfo
    if (formData.practicalInfo && formData.practicalInfo !== '{}') {
      try {
        JSON.parse(formData.practicalInfo);
      } catch (e) {
        toast.error('Format JSON invalide pour les informations pratiques');
        return;
      }
    }

    try {
      const apiFormData = new FormData();

      // Coordonnées
      apiFormData.append(
        'coordinates',
        JSON.stringify({
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
          address: formData.address || '',
        })
      );

      // Champs basiques
      apiFormData.append('category', formData.category);
      apiFormData.append('cityId', formData.cityId);

      // Informations pratiques
      if (formData.practicalInfo && formData.practicalInfo !== '{}') {
        apiFormData.append('practicalInfo', formData.practicalInfo);
      }

      // Lien de visite virtuelle
      if (formData.virtualTourUrl) {
        apiFormData.append('virtualTourUrl', formData.virtualTourUrl);
      }
if (formData.audioToRemove) {
  apiFormData.append('audioToRemove', JSON.stringify(formData.audioToRemove));
}

      // Localisations (envoyer même si vides pour que le backend les gère)
      apiFormData.append('arLocalization', JSON.stringify(formData.arLocalization));
      apiFormData.append('frLocalization', JSON.stringify(formData.frLocalization));
      apiFormData.append('enLocalization', JSON.stringify(formData.enLocalization));

      // Status flags
      apiFormData.append('isActive', String(formData.isActive));
      apiFormData.append('isVerified', String(formData.isVerified));
      apiFormData.append('isPremium', String(formData.isPremium));

      // Fichiers multiples
      Object.entries(files).forEach(([key, fileArray]) => {
        fileArray.forEach((file) => {
          apiFormData.append(key, file);
        });
      });

      // --- DEBUT DES MODIFICATIONS ---

      // Ajoute la liste des fichiers à supprimer (uniquement en mode édition)
      if (selectedPOI && formData.filesToRemove && formData.filesToRemove.length > 0) {
        apiFormData.append('filesToRemove', JSON.stringify(formData.filesToRemove));
      }



      // --- FIN DES MODIFICATIONS ---

      if (selectedPOI) {
        await updatePOI({ id: selectedPOI.id, data: apiFormData }).unwrap();
        toast.success('POI mis à jour avec succès');
      } else {
        await createPOIWithFiles(apiFormData).unwrap();
        toast.success('POI créé avec succès');
      }

      refetch();
      setIsModalOpen(false);
      resetForm();
    } catch (error: any) {
      console.error('Error saving POI:', error);
      if (error?.data?.errors) {
        console.error('Validation errors:', error.data.errors);
        error.data.errors.forEach((err: any) => {
          toast.error(`${err.path || err.param}: ${err.msg}`);
        });
      } else {
        toast.error(error?.data?.message || "Erreur lors de l'enregistrement");
      }
    }
  };

  // Suppression d'un POI
  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce POI ?')) return;

    try {
      await deletePOI(id).unwrap();
      toast.success('POI supprimé avec succès');
      refetch();
    } catch (error: any) {
      console.error('Error deleting POI:', error);
      toast.error(error?.data?.message || 'Erreur lors de la suppression');
    }
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setSelectedPOI(null);
    // ✅ 'initialFormData' contient déjà la réinitialisation pour 'audioToRemove'
    setFormData(initialFormData);
    setFiles({});
  };

  // Éditer un POI
  const handleEdit = (poi: POI) => {
    setSelectedPOI(poi);
    // Trouver le lien de visite virtuelle dans les fichiers
    const virtualTourFile = poi.files?.find((f: any) => f.type === 'virtualtour');
    const virtualTourUrl = virtualTourFile?.fileUrl || '';

    // Parse coordinates if it's a string (backward compatibility)
    let coordinates = poi.coordinates;
    if (typeof coordinates === 'string') {
      try {
        coordinates = JSON.parse(coordinates);
      } catch (e) {
        console.error('Error parsing coordinates:', e);
        coordinates = { latitude: 0, longitude: 0, address: '' };
      }
    }

    // Handle both coordinate formats
    let latitude: string, longitude: string, address: string;
    if (coordinates && typeof coordinates === 'object' && 'latitude' in coordinates) {
      latitude = String(coordinates.latitude);
      longitude = String(coordinates.longitude);
      address = coordinates.address || '';
    } else if (coordinates && typeof coordinates === 'object' && 'coordinates' in coordinates) {
      // GeoJSON format
      longitude = String(coordinates.coordinates[0]);
      latitude = String(coordinates.coordinates[1]);
      address = '';
    } else {
      // Fallback
      latitude = '0';
      longitude = '0';
      address = '';
    }

    setFormData({
      category: poi.category,
      cityId: poi.cityId,
      latitude,
      longitude,
      address,
      practicalInfo: JSON.stringify(poi.practicalInfo || {}, null, 2),
      virtualTourUrl,
      isActive: poi.isActive,
      isVerified: poi.isVerified,
      isPremium: poi.isPremium,
      frLocalization: poi.frLocalization || { name: '', description: '', address: '' },
      arLocalization: poi.arLocalization || { name: '', description: '', address: '' },
      enLocalization: poi.enLocalization || { name: '', description: '', address: '' },
      filesToRemove: [], // Important pour le formulaire
      // ✅ AJOUT: Réinitialiser les flags de suppression audio à chaque ouverture
      audioToRemove: { fr: false, ar: false, en: false }, 
    });
    setFiles({}); 
    setIsModalOpen(true);
  };

  // Filtrer les POIs par terme de recherche (now using backend search)
  const handleSearchChange = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
    setFilters((prev) => ({
      ...prev,
      search: newSearchTerm || undefined,
      page: 1, // Reset to first page when searching
    }));
  };

  return {
    pois: pois, // Already filtered by backend
    categories,
    cities,
    isLoading,
    error,
    searchTerm,
    setSearchTerm: handleSearchChange,
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
    // Pagination data
    totalPages: poisData?.data?.totalPages || 1,
    currentPage: poisData?.data?.currentPage || 1,
    totalCount: poisData?.data?.totalCount || 0,
    hasNextPage: poisData?.data?.hasNextPage || false,
    hasPreviousPage: poisData?.data?.hasPreviousPage || false,
    // Filter functions
    setFilters,
    filters,
  };
}