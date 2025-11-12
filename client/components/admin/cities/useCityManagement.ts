'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  useGetFilteredCitiesQuery,
  useCreateCityWithImageMutation,
  useUpdateCityWithImageMutation,
  useDeleteCityMutation,
  type City,
} from '@/services/api/CityApi';
import { compressImageByType } from '@/utils/imageCompression';

interface CityFormData {
  name: string;
  nameAr: string;
  nameEn: string;
  country: string;
  radius: string;
  address: string;
  addressAr: string;
  addressEn: string;
  latitude: string;
  longitude: string;
  isActive: boolean;
}

const initialFormData: CityFormData = {
  name: '',
  nameAr: '',
  nameEn: '',
  country: '',
  radius: '',
  address: '',
  addressAr: '',
  addressEn: '',
  latitude: '',
  longitude: '',
  isActive: true,
};

export function useCityManagement() {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 100,
    search: '',
    country: undefined as string | undefined,
    isActive: undefined as boolean | undefined,
    sortBy: 'name' as 'name' | 'newest' | 'oldest',
  });

  const { data: citiesData, isLoading, error, refetch } = useGetFilteredCitiesQuery(filters);
  const [createCity, { isLoading: isCreating }] = useCreateCityWithImageMutation();
  const [updateCity, { isLoading: isUpdating }] = useUpdateCityWithImageMutation();
  const [deleteCity, { isLoading: isDeleting }] = useDeleteCityMutation();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<CityFormData>(initialFormData);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Update search filter with debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchTerm, page: 1 }));
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const cities = citiesData?.data?.cities || [];
  const totalCount = citiesData?.data?.totalCount || 0;
  const totalPages = citiesData?.data?.totalPages || 1;
  const currentPage = citiesData?.data?.currentPage || 1;
  const hasNextPage = citiesData?.data?.hasNextPage || false;
  const hasPreviousPage = citiesData?.data?.hasPreviousPage || false;

  // Gestion de l'image
  const handleImageChange = async (file: File) => {
    try {
      const compressed = await compressImageByType(file);
      setImageFile(compressed.file);
      const previewUrl = URL.createObjectURL(compressed.file);
      setImagePreview(previewUrl);
      toast.success('Image compressée avec succès');
    } catch (error) {
      toast.error("Erreur lors de la compression de l'image");
    }
  };

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.nameAr || !formData.nameEn || !formData.country || !formData.radius) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (!formData.latitude || !formData.longitude) {
      toast.error('Veuillez sélectionner une position sur la carte');
      return;
    }

    if (!selectedCity && !imageFile) {
      toast.error('Veuillez sélectionner une image');
      return;
    }

    const apiFormData = new FormData();
    
    // Ajouter tous les champs
    apiFormData.append('name', formData.name);
    apiFormData.append('nameAr', formData.nameAr);
    apiFormData.append('nameEn', formData.nameEn);
    apiFormData.append('country', formData.country);
    apiFormData.append('radius', formData.radius);
    apiFormData.append('address', formData.address);
    apiFormData.append('adressAr', formData.addressAr); // Note: backend uses 'adressAr'
    apiFormData.append('adressEn', formData.addressEn); // Note: backend uses 'adressEn'
    apiFormData.append('latitude', formData.latitude);
    apiFormData.append('longitude', formData.longitude);
    apiFormData.append('isActive', String(formData.isActive));

    if (imageFile) {
      apiFormData.append('image', imageFile);
    }

    try {
      if (selectedCity) {
        await updateCity({ id: selectedCity.id, formData: apiFormData }).unwrap();
        toast.success('Ville mise à jour avec succès');
      } else {
        await createCity(apiFormData).unwrap();
        toast.success('Ville créée avec succès');
      }
      refetch();
      setIsModalOpen(false);
      resetForm();
    } catch (error: any) {
      console.error('Error saving city:', error);
      toast.error(error?.data?.message || "Erreur lors de l'enregistrement");
    }
  };

  // Suppression d'une ville
  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette ville ?')) return;

    try {
      await deleteCity(id).unwrap();
      toast.success('Ville supprimée avec succès');
      refetch();
    } catch (error: any) {
      console.error('Error deleting city:', error);
      toast.error(error?.data?.message || 'Erreur lors de la suppression');
    }
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setSelectedCity(null);
    setImageFile(null);
    setImagePreview(null);
    setFormData(initialFormData);
  };

  // Éditer une ville
  const handleEdit = (city: City) => {
    setSelectedCity(city);
    setImagePreview(city.image);
    setFormData({
      name: city.name,
      nameAr: city.nameAr,
      nameEn: city.nameEn,
      country: city.country,
      radius: String(city.radius),
      address: city.coordinates?.address || '',
      addressAr: city.coordinates?.addressAr || '',
      addressEn: city.coordinates?.addressEn || '',
      latitude: String(city.coordinates?.latitude || ''),
      longitude: String(city.coordinates?.longitude || ''),
      isActive: city.isActive,
    });
    setIsModalOpen(true);
  };

  // Gérer les changements de localisation
  const handleLocationSelect = (location: { lat: number; lng: number; address?: string }) => {
    setFormData({
      ...formData,
      latitude: location.lat.toString(),
      longitude: location.lng.toString(),
      address: location.address || formData.address,
    });
  };

  return {
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
  };
}