'use client';

import { FormField } from '../shared/FormField';
import { LocalizedInputs } from '../shared/LocalizedInputs';
import { FileUpload } from '../shared/FileUpload';
import { Checkbox } from '../shared/Checkbox';
import { FormActions } from '../shared/FormActions';
import { ImageIcon } from 'lucide-react';
import MapView from '../../map/map';
import { IaNameTraduction } from '../shared/IaNameTraduction';

interface CircuitFormProps {
  formData: {
    cityId: string;
    duration: string;
    distance: string;
    isPremium: boolean;
    isActive: boolean;
    themeIds: string[];
    poiIds: string[];
    localizations: {
      fr: { name: string; description: string };
      ar: { name: string; description: string };
      en: { name: string; description: string };
    };
  };
  onFormDataChange: (data: any) => void;
  onSelectedPOIsChange?: (poiIds: string[]) => void;
  onSelectedPOIsDetailsChange?: (details: any[]) => void;
  onImageChange: (file: File) => void;
  imagePreview: string | null;
  cities: any[];
  themes: any[];
  pois: any[];
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  selectedCircuit: any;
  parseLoc: (loc: any) => { name: string; description: string };
}

export function CircuitForm({
  formData,
  onFormDataChange,
  onSelectedPOIsChange,
  onSelectedPOIsDetailsChange,
  onImageChange,
  imagePreview,
  cities,
  themes,
  pois,
  onSubmit,
  onCancel,
  isSubmitting,
  selectedCircuit,
  parseLoc,
}: CircuitFormProps) {
  const updateSelectedPois = (newPoiIds: string[]) => {
    onFormDataChange({
      ...formData,
      poiIds: newPoiIds,
    });
    if (onSelectedPOIsChange) onSelectedPOIsChange(newPoiIds);
  };

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
    { key: 'description', label: 'Description', type: 'textarea' as const, rows: 3 },
  ];

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* City and Image Section */}
      <div className="grid grid-cols-2 gap-6">
        <FormField label="Ville" required>
          <select
            value={formData.cityId}
            onChange={(e) => onFormDataChange({ ...formData, cityId: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Sélectionner une ville</option>
            {cities.map((city: any) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>
        </FormField>

        <FileUpload
          label="Image"
          accept="image/*"
          preview={imagePreview || selectedCircuit?.image}
          required={!selectedCircuit}
          onChange={onImageChange}
          icon={<ImageIcon className="w-4 h-4" />}
        />
      </div>

      {/* Duration and Distance Section */}
{/* Duration, Distance, Price Section */}
      <div className="grid grid-cols-3 gap-6">
        <FormField label="Durée (heures)" required>
          <input
            type="number"
            step="0.1"
            value={formData.duration}
            onChange={(e) => onFormDataChange({ ...formData, duration: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
            placeholder="Ex: 2.5"
          />
        </FormField>
        <FormField label="Distance (km)" required>
          <input
            type="number"
            step="0.1"
            value={formData.distance}
            onChange={(e) => onFormDataChange({ ...formData, distance: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
            placeholder="Ex: 5.3"
          />
        </FormField>
        <FormField label="Prix (MAD)">
          <input
            type="number"
            step="0.01"
            value={(formData as any).price || ''}
            onChange={(e) => onFormDataChange({ ...formData, price: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ex: 150.00"
          />
        </FormField>
      </div>

      {/* Start/End Points Section */}
      <div className="grid grid-cols-2 gap-6">
        <FormField label="Point de départ">
          <select
            value={(formData as any).startPoint || ''}
            onChange={(e) => onFormDataChange({ ...formData, startPoint: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Sélectionner un POI</option>
            {pois.map((poi: any) => (
              <option key={poi.id} value={poi.id}>
                {poi.frLocalization?.name || `POI ${poi.id.substring(0, 8)}`}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Point d'arrivée">
          <select
            value={(formData as any).endPoint || ''}
            onChange={(e) => onFormDataChange({ ...formData, endPoint: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Sélectionner un POI</option>
            {pois.map((poi: any) => (
              <option key={poi.id} value={poi.id}>
                {poi.frLocalization?.name || `POI ${poi.id.substring(0, 8)}`}
              </option>
            ))}
          </select>
        </FormField>
      </div>
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
          fieldName="description"
        />
      </div>

      {/* Localized Inputs Section */}
      <LocalizedInputs
        localizations={formData.localizations}
        onChange={handleLocalizationChange}
        fields={localizationFields}
      />

      {/* Thèmes (ligne 1, pleine largeur) */}
      <div className="grid grid-cols-1 gap-6">
        <FormField label="Thèmes" required>
          <select
            multiple
            value={formData.themeIds}
            onChange={(e) =>
              onFormDataChange({
                ...formData,
                themeIds: Array.from(e.target.selectedOptions, (o) => o.value),
              })
            }
            className="w-full px-4 py-2 border rounded-lg h-32 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            {themes.map((theme: any) => (
              <option key={theme.id} value={theme.id}>
                {parseLoc(theme.fr).name || 'Sans nom'}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Maintenez Ctrl/Cmd pour sélectionner plusieurs thèmes
          </p>
        </FormField>
      </div>

      {/* MapView (ligne 2) */}
      <div className="w-full">
        <MapView
          latitude={34.0331}
          longitude={-4.9998}
          zoom={12}
          pois={pois}
          defaultSelectedPoiIds={formData.poiIds}
          onSelectedPOIsChange={(ids: string[]) => updateSelectedPois(ids)}
          onSelectedPOIsDetailsChange={(details: any[]) => {
            if (onSelectedPOIsDetailsChange) onSelectedPOIsDetailsChange(details);
          }}
        />
      </div>

      {/* Selected Items Display */}
      <div className="grid grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg">
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            Thèmes sélectionnés ({formData.themeIds.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {formData.themeIds.map((themeId) => {
              const theme = themes.find((t) => t.id === themeId);
              if (!theme) return null;
              return (
                <span
                  key={themeId}
                  className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                >
                  {parseLoc(theme.fr).name || 'Sans nom'}
                </span>
              );
            })}
            {formData.themeIds.length === 0 && (
              <span className="text-xs text-gray-400">Aucun thème sélectionné</span>
            )}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            POIs sélectionnés ({formData.poiIds.length})
          </h4>
          {formData.poiIds.length === 0 ? (
            <span className="text-xs text-gray-400">Aucun POI sélectionné</span>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-xs px-2 py-1 rounded border border-gray-300 hover:bg-gray-100"
                  onClick={() => {
                    const sorted = [...formData.poiIds].sort((a, b) => {
                      const pa = pois.find((p: any) => p.id === a);
                      const pb = pois.find((p: any) => p.id === b);
                      const na = (pa?.frLocalization?.name || a).toLowerCase();
                      const nb = (pb?.frLocalization?.name || b).toLowerCase();
                      return na.localeCompare(nb);
                    });
                    updateSelectedPois(sorted);
                  }}
                >
                  Trier automatiquement (nom)
                </button>
              </div>
              <ul className="divide-y divide-gray-200 rounded-md border border-gray-200 bg-white">
                {formData.poiIds.map((poiId, index) => {
                  const poi = pois.find((p: any) => p.id === poiId);
                  const name = poi?.frLocalization?.name || `POI ${poiId.substring(0, 8)}`;
                  return (
                    <li key={poiId} className="flex items-center justify-between px-3 py-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xs font-semibold text-gray-600 w-6 text-center">{index + 1}</span>
                        <div className="min-w-0">
                          <div className="text-sm text-gray-900 truncate">{name}</div>
                          <div className="text-xs text-gray-500 truncate">ID: {poiId}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="px-2 py-1 text-xs rounded border border-gray-300 disabled:opacity-50 hover:bg-gray-50"
                          onClick={() => {
                            if (index === 0) return;
                            const arr = [...formData.poiIds];
                            [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
                            updateSelectedPois(arr);
                          }}
                          disabled={index === 0}
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          className="px-2 py-1 text-xs rounded border border-gray-300 disabled:opacity-50 hover:bg-gray-50"
                          onClick={() => {
                            if (index === formData.poiIds.length - 1) return;
                            const arr = [...formData.poiIds];
                            [arr[index + 1], arr[index]] = [arr[index], arr[index + 1]];
                            updateSelectedPois(arr);
                          }}
                          disabled={index === formData.poiIds.length - 1}
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          className="px-2 py-1 text-xs rounded border border-red-300 text-red-700 hover:bg-red-50"
                          onClick={() => {
                            const arr = formData.poiIds.filter((id) => id !== poiId);
                            updateSelectedPois(arr);
                          }}
                        >
                          Retirer
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <p className="text-xs text-gray-500">Les numéros d'ordre se mettent à jour automatiquement.</p>
            </div>
          )}
        </div>
      </div>

      {/* Checkboxes Section */}
      <div className="flex items-center space-x-6">
        <Checkbox
          label="Actif"
          checked={formData.isActive}
          onChange={(checked) => onFormDataChange({ ...formData, isActive: checked })}
        />
        <Checkbox
          label="Premium"
          checked={formData.isPremium}
          onChange={(checked) => onFormDataChange({ ...formData, isPremium: checked })}
        />
      </div>

      {/* Form Actions */}
      <FormActions onCancel={onCancel} isSubmitting={isSubmitting} isEdit={!!selectedCircuit} />
    </form>
  );
}