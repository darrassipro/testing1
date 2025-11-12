'use client';

import { useState } from 'react';
import { FormField } from '../shared/FormField';
import { FileUpload } from '../shared/FileUpload';
import { Checkbox } from '../shared/Checkbox';
import { FormActions } from '../shared/FormActions';
import { IaNameTraduction } from '../shared/IaNameTraduction';
import MapSelector from '../pois/MapSelector';
import { ImageIcon, MapPin, Globe, Info } from 'lucide-react';

interface CityFormProps {
  formData: any;
  onFormDataChange: (data: any) => void;
  onImageChange: (file: File) => void;
  onLocationSelect: (location: { lat: number; lng: number; address?: string }) => void;
  imagePreview: string | null;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  selectedCity: any;
}

export function CityForm({
  formData,
  onFormDataChange,
  onImageChange,
  onLocationSelect,
  imagePreview,
  onSubmit,
  onCancel,
  isSubmitting,
  selectedCity,
}: CityFormProps) {
  const [showMap, setShowMap] = useState(true);

  const currentLocation = formData.latitude && formData.longitude
    ? {
        lat: parseFloat(formData.latitude),
        lng: parseFloat(formData.longitude),
      }
    : null;

  // Handler for AI translation component
  const handleLocalizationChange = (lang: 'fr' | 'ar' | 'en', field: string, value: string) => {
    onFormDataChange((prevData: any) => {
      if (field === 'name') {
        return {
          ...prevData,
          [lang === 'fr' ? 'name' : lang === 'ar' ? 'nameAr' : 'nameEn']: value,
        };
      } else if (field === 'address') {
        return {
          ...prevData,
          [lang === 'fr' ? 'address' : lang === 'ar' ? 'addressAr' : 'addressEn']: value,
        };
      }
      return prevData;
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-medium mb-1">Information importante:</p>
          <p>Remplissez les noms de la ville en français, arabe et anglais. Sélectionnez la position sur la carte.</p>
        </div>
      </div>

      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Informations de base
        </h3>

        {/* AI Translation for City Name */}
        <IaNameTraduction
          fieldName="name"
          onChange={handleLocalizationChange}
          localizations={{
            fr: { name: formData.name || '' },
            ar: { name: formData.nameAr || '' },
            en: { name: formData.nameEn || '' },
          }}
        />

        <div className="grid grid-cols-3 gap-4">
          <FormField label="Nom (Français)" required>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              placeholder="Ex: Fès"
            />
          </FormField>

          <FormField label="الاسم (بالعربية)" required>
            <input
              type="text"
              value={formData.nameAr}
              onChange={(e) => onFormDataChange({ ...formData, nameAr: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              placeholder="مثال: فاس"
              dir="rtl"
            />
          </FormField>

          <FormField label="Name (English)" required>
            <input
              type="text"
              value={formData.nameEn}
              onChange={(e) => onFormDataChange({ ...formData, nameEn: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              placeholder="Ex: Fez"
            />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Pays" required>
            <input
              type="text"
              value={formData.country}
              onChange={(e) => onFormDataChange({ ...formData, country: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              placeholder="Ex: Maroc"
            />
          </FormField>

          <FormField label="Rayon (km)" required>
            <input
              type="number"
              step="0.01"
              value={formData.radius}
              onChange={(e) => onFormDataChange({ ...formData, radius: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              placeholder="Ex: 10.5"
            />
          </FormField>
        </div>
      </div>

      {/* Image Upload */}
      <FileUpload
        label="Image de la ville"
        accept="image/*"
        preview={imagePreview || selectedCity?.image}
        required={!selectedCity}
        onChange={onImageChange}
        icon={<ImageIcon className="w-4 h-4" />}
      />

      {/* Location Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Position géographique
            <span className="text-red-500">*</span>
          </label>
          <button
            type="button"
            onClick={() => setShowMap(!showMap)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
          >
            <MapPin className="w-4 h-4" />
            {showMap ? 'Masquer la carte' : 'Afficher la carte'}
          </button>
        </div>

        {showMap && (
          <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
            <MapSelector
              onLocationSelect={onLocationSelect}
              selectedLocation={currentLocation}
              height="400px"
            />
          </div>
        )}

        {/* Coordinate Fields */}
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Latitude" required>
            <input
              type="number"
              step="any"
              value={formData.latitude}
              onChange={(e) => onFormDataChange({ ...formData, latitude: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              placeholder="34.0331"
              readOnly={showMap}
            />
          </FormField>

          <FormField label="Longitude" required>
            <input
              type="number"
              step="any"
              value={formData.longitude}
              onChange={(e) => onFormDataChange({ ...formData, longitude: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              placeholder="-4.9998"
              readOnly={showMap}
            />
          </FormField>
        </div>

        {/* AI Translation for Address */}
        <IaNameTraduction
          fieldName="address"
          onChange={handleLocalizationChange}
          localizations={{
            fr: { name: '', address: formData.address || '' },
            ar: { name: '', address: formData.addressAr || '' },
            en: { name: '', address: formData.addressEn || '' },
          }}
        />

        {/* Address Fields */}
        <div className="grid grid-cols-3 gap-4">
          <FormField label="Adresse (Français)">
            <input
              type="text"
              value={formData.address}
              onChange={(e) => onFormDataChange({ ...formData, address: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: Médina de Fès"
            />
          </FormField>

          <FormField label="العنوان (بالعربية)">
            <input
              type="text"
              value={formData.addressAr}
              onChange={(e) => onFormDataChange({ ...formData, addressAr: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="مثال: مدينة فاس"
              dir="rtl"
            />
          </FormField>

          <FormField label="Address (English)">
            <input
              type="text"
              value={formData.addressEn}
              onChange={(e) => onFormDataChange({ ...formData, addressEn: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: Fez Medina"
            />
          </FormField>
        </div>
      </div>

      {/* Status Checkbox */}
      <div className="flex items-center space-x-6 pt-4 border-t">
        <Checkbox
          label="Ville active"
          checked={formData.isActive}
          onChange={(checked) => onFormDataChange({ ...formData, isActive: checked })}
        />
      </div>

      {/* Form Actions */}
      <FormActions
        onCancel={onCancel}
        isSubmitting={isSubmitting}
        isEdit={!!selectedCity}
      />
    </form>
  );
}