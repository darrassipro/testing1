'use client';

import { FormField } from '../shared/FormField';
import { LocalizedInputs } from '../shared/LocalizedInputs';
import { FileUpload } from '../shared/FileUpload';
import { Checkbox } from '../shared/Checkbox';
import { FormActions } from '../shared/FormActions';
import { ImageIcon } from 'lucide-react';
import { IaNameTraduction } from '../shared/IaNameTraduction';

interface ThemeFormProps {
  formData: any;
  onFormDataChange: (data: any) => void;
  onIconChange: (file: File) => void;
  onImageChange: (file: File) => void;
  iconPreview: string | null;
  imagePreview: string | null;
  selectedTheme: any;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function ThemeForm({
  formData,
  onFormDataChange,
  onIconChange,
  onImageChange,
  iconPreview,
  imagePreview,
  selectedTheme,
  onSubmit,
  onCancel,
  isSubmitting,
}: ThemeFormProps) {
  const handleLocalizationChange = (lang: 'fr' | 'ar' | 'en', field: string, value: string) => {
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
      {/* AI Translation Component for Name */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-700">Traduction IA - Nom</h3>
        <IaNameTraduction
          localizations={{
            fr: formData.localizations.fr,
            ar: formData.localizations.ar,
            en: formData.localizations.en,
          }}
          onChange={handleLocalizationChange}
          fieldName="name"
        />
      </div>

      {/* AI Translation Component for Description */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-700">Traduction IA - Description</h3>
        <IaNameTraduction
          localizations={{
            fr: formData.localizations.fr,
            ar: formData.localizations.ar,
            en: formData.localizations.en,
          }}
          onChange={handleLocalizationChange}
          fieldName="desc"
        />
      </div>

      <LocalizedInputs
        localizations={formData.localizations}
        onChange={handleLocalizationChange}
        fields={localizationFields}
      />

      <div className="grid grid-cols-3 gap-6">
        <FormField label="Couleur du thème">
          <input
            type="color"
            value={formData.color}
            onChange={(e) => onFormDataChange({ ...formData, color: e.target.value })}
            className="w-full h-12 rounded-lg border cursor-pointer"
          />
        </FormField>

        <FileUpload
          label="Icône"
          accept="image/*"
          preview={iconPreview || selectedTheme?.icon}
          required={!selectedTheme}
          onChange={onIconChange}
          icon={<ImageIcon className="w-4 h-4" />}
        />

        <FileUpload
          label="Image"
          accept="image/*"
          preview={imagePreview || selectedTheme?.image}
          required={!selectedTheme}
          onChange={onImageChange}
          icon={<ImageIcon className="w-4 h-4" />}
        />
      </div>

      <Checkbox
        label="Actif"
        checked={formData.isActive}
        onChange={(checked) => onFormDataChange({ ...formData, isActive: checked })}
      />

      <FormActions
        onCancel={onCancel}
        isSubmitting={isSubmitting}
        isEdit={!!selectedTheme}
      />
    </form>
  );
}
