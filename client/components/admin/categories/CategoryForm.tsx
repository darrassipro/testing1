'use client';

import { LocalizedInputs } from '../shared/LocalizedInputs';
import { Checkbox } from '../shared/Checkbox';
import { FormActions } from '../shared/FormActions';
import { FileUpload } from '../shared/FileUpload';
import { IaNameTraduction } from '../shared/IaNameTraduction';
import { Info, ImageIcon } from 'lucide-react';

interface CategoryFormProps {
  formData: {
    localizations: {
      fr: { name: string; desc: string };
      ar: { name: string; desc: string };
      en: { name: string; desc: string };
    };
    isActive: boolean;
  };
  onFormDataChange: (data: any) => void;
  onIconChange: (file: File) => void;
  iconPreview?: string;
  selectedCategory: any;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  parseLoc: (loc: any) => { name: string; desc?: string };
}

export function CategoryForm({
  formData,
  onFormDataChange,
  onIconChange,
  iconPreview,
  selectedCategory,
  onSubmit,
  onCancel,
  isSubmitting,
}: CategoryFormProps) {
  const handleLocalizationChange = (
    lang: 'fr' | 'ar' | 'en',
    field: string,
    value: string
  ) => {
    onFormDataChange((prevData: any) => ({
      ...prevData,
      localizations: {
        ...prevData.localizations,
        [lang]: {
          ...prevData.localizations[lang],
          [field]: value,
        },
      },
    }));
  };

  const localizationFields = [
    { key: 'name', label: 'Nom', type: 'input' as const, required: true },
    { key: 'desc', label: 'Description', type: 'textarea' as const, rows: 3 },
  ];

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-medium mb-1">Information importante:</p>
          <p>
            Les catégories sont utilisées pour organiser les points d'intérêt (POIs).
            Assurez-vous de remplir les trois langues pour une meilleure expérience utilisateur.
          </p>
        </div>
      </div>

      {/* AI Translation for Name */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-700">Traduction IA - Nom</h3>
        <IaNameTraduction
          fieldName="name"
          onChange={handleLocalizationChange}
          localizations={formData.localizations}
        />
      </div>

      {/* AI Translation for Description */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-700">Traduction IA - Description</h3>
        <IaNameTraduction
          fieldName="desc"
          onChange={handleLocalizationChange}
          localizations={formData.localizations}
        />
      </div>

      {/* Localized Inputs */}
      <LocalizedInputs
        localizations={formData.localizations}
        onChange={handleLocalizationChange}
        fields={localizationFields}
      />

      {/* Icon Upload */}
      <div className="border-t pt-6">
        <FileUpload
          label="Icône de la catégorie"
          accept="image/*"
          preview={iconPreview || selectedCategory?.icon}
          onChange={onIconChange}
          icon={<ImageIcon className="w-4 h-4" />}
        />

      </div>

      {/* Status Checkbox */}
      <div className="flex items-center space-x-6 pt-4 border-t">
        <Checkbox
          label="Actif"
          checked={formData.isActive}
          onChange={(checked) =>
            onFormDataChange({ ...formData, isActive: checked })
          }
        />
      </div>

      {/* Form Actions */}
      <FormActions
        onCancel={onCancel}
        isSubmitting={isSubmitting}
        isEdit={!!selectedCategory}
      />
    </form>
  );
}