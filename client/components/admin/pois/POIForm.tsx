'use client';

import { useState, useEffect } from 'react';
import { FormField } from '../shared/FormField';
import { LocalizedInputs } from '../shared/LocalizedInputs';
import { MultipleFileUpload } from '../shared/MultipleFileUpload';
import { Checkbox } from '../shared/Checkbox';
import { FormActions } from '../shared/FormActions';
import MapSelector from './MapSelector';
import { ImageIcon, Video, Map as Map360, Music, Info, MapPin, Plus, ChevronRight, ChevronLeft, Trash2, X } from 'lucide-react';
import { POIFile as ApiPOIFile, POI } from '@/services/api/PoiApi'; // ✅ Import POI types
import { toast } from 'sonner'; // ✅ Import toast
import { IaNameTraduction } from '../shared/IaNameTraduction';

interface POIFormProps {
  formData: any;
  onFormDataChange: (data: any) => void;
  onFileChange: (file: File, key: string) => void;
  onRemoveFile?: (key: string, index: number) => void;
  files?: Record<string, File[]>;
  categories: any[];
  cities: any[];
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  selectedPOI: POI | null; // ✅ Updated type from 'any'
}

export function POIForm({
  formData,
  onFormDataChange,
  onFileChange,
  onRemoveFile,
  files = {},
  categories,
  cities,
  onSubmit,
  onCancel,
  isSubmitting,
  selectedPOI,
}: POIFormProps) {
  const [showMap, setShowMap] = useState(true);
  const [showPracticalInfo, setShowPracticalInfo] = useState(false);
  const [showSummary, setShowSummary] = useState(true);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
  const [newFieldKey, setNewFieldKey] = useState('');
  const [newFieldValue, setNewFieldValue] = useState('');
  const [existingFiles, setExistingFiles] = useState<ApiPOIFile[]>([]); // ✅ Use imported type
  
  const practicalInfoTemplate = {
    horaires: { checkin: '', checkout: '', reception: '' },
    prix: { chambre_simple: '', chambre_double: '', suite: '', petit_dejeuner: '' },
    services: [''],
    contact: { telephone: '', email: '', site_web: '' },
    equipements: [''],
    politiques: { annulation: '', animaux: '', fumeurs: '' },
    localisation: { proche: [''] },
    langues: [''],
    paiement: [''],
    capacite: { chambres: '', personnes_max: '' },
  };

  const categoriesKeys = Object.keys(practicalInfoTemplate);
  const getCurrentCategoryKey = () => categoriesKeys[currentCategoryIndex];
  const getCurrentFields = () => {
    const parsed = getParsedPracticalInfo();
    const categoryKey = getCurrentCategoryKey();
    return parsed[categoryKey] || practicalInfoTemplate[categoryKey];
  };

  const getParsedPracticalInfo = () => {
    try {
      const parsed = JSON.parse(formData.practicalInfo || '{}');
      return typeof parsed === 'object' && parsed !== null ? parsed : {}; // Handle null case
    } catch {
      return {};
    }
  };

  // ✅ HELPER: Parse le nouveau/ancien format audio
  const getAudioUrl = (locAudioFiles: string | null | undefined): string | null => {
    if (!locAudioFiles) return null;
    try {
      // Nouveau format: [{ "url": "...", "publicId": "..." }]
      const parsed = JSON.parse(locAudioFiles);
      return parsed[0]?.url || null;
    } catch {
      // Ancien format (fallback): ["..."]
      try {
        const oldParsed = JSON.parse(locAudioFiles);
        return Array.isArray(oldParsed) ? oldParsed[0] : null;
      } catch (e) {
        return null;
      }
    }
  };


  const handleFieldChange = (categoryKey: string, fieldKey: string, value: any, index?: number) => {
    const parsed = getParsedPracticalInfo();
    if (!parsed[categoryKey]) parsed[categoryKey] = practicalInfoTemplate[categoryKey] || {};

    if (Array.isArray(parsed[categoryKey][fieldKey])) {
      if (index !== undefined) {
        parsed[categoryKey][fieldKey][index] = value;
      }
    } else {
      parsed[categoryKey][fieldKey] = value;
    }

    onFormDataChange({
      ...formData,
      practicalInfo: JSON.stringify(parsed),
    });
  };

  useEffect(() => {
    if (selectedPOI) {
      // We are in "Edit" mode
      const files: ApiPOIFile[] = selectedPOI.files || []; // ✅ Use imported type
      const tour = files.find((f) => f.type === 'virtualtour');

      setExistingFiles(files);

      onFormDataChange({
        // Pre-populate all fields from selectedPOI
        frLocalization: selectedPOI.frLocalization || { name: '', description: '', address: '' },
        arLocalization: selectedPOI.arLocalization || { name: '', description: '', address: '' },
        enLocalization: selectedPOI.enLocalization || { name: '', description: '', address: '' },
        
        latitude:
          (typeof (selectedPOI as any).coordinates === 'object' && (selectedPOI as any).coordinates?.latitude != null)
            ? String((selectedPOI as any).coordinates.latitude)
            : ((selectedPOI as any).coordinates?.type === 'Point')
              ? String(((selectedPOI as any).coordinates.coordinates?.[1]) ?? '')
              : '',
        longitude:
          (typeof (selectedPOI as any).coordinates === 'object' && (selectedPOI as any).coordinates?.longitude != null)
            ? String((selectedPOI as any).coordinates.longitude)
            : ((selectedPOI as any).coordinates?.type === 'Point')
              ? String(((selectedPOI as any).coordinates.coordinates?.[0]) ?? '')
              : '',
        address: selectedPOI.frLocalization?.address || '', // Use fr address as the default "address"
        
        category: selectedPOI.category || '',
        cityId: selectedPOI.cityId || '',
        
        isActive: selectedPOI.isActive || false,
        isVerified: selectedPOI.isVerified || false,
        isPremium: selectedPOI.isPremium || false,
        
        practicalInfo: JSON.stringify(selectedPOI.practicalInfo || {}, null, 2),
        virtualTourUrl: tour ? tour.fileUrl : '',
        
        filesToRemove: [], // Start with an empty list
        audioToRemove: { fr: false, ar: false, en: false }, // ✅ Reset flags
      });
    } else {
      // We are in "Create" mode, reset the form
      setExistingFiles([]);
      onFormDataChange({
        frLocalization: { name: '', description: '', address: '' },
        arLocalization: { name: '', description: '', address: '' },
        enLocalization: { name: '', description: '', address: '' },
        latitude: '',
        longitude: '',
        address: '',
        category: '',
        cityId: '',
        isActive: true,
        isVerified: false,
        isPremium: false,
        practicalInfo: '{}',
        virtualTourUrl: '',
        filesToRemove: [], 
        audioToRemove: { fr: false, ar: false, en: false }, // ✅ Reset flags
      });
    }
  }, [selectedPOI, onFormDataChange]); // --- MODIFICATION: Added onFormDataChange to deps ---

  const handleFieldKeyRename = (categoryKey: string, oldKey: string, newKey: string) => {
    const parsed = getParsedPracticalInfo();
    if (!parsed[categoryKey]) return;

    const categoryData = parsed[categoryKey];
    if (!newKey.trim() || newKey === oldKey || categoryData[newKey]) return;

    categoryData[newKey] = categoryData[oldKey];
    delete categoryData[oldKey];

    onFormDataChange({
      ...formData,
      practicalInfo: JSON.stringify(parsed),
    });
  };

  // Filter existing files for rendering
  const existingImages = existingFiles.filter(f => f.type === 'image');
  const existingVideos = existingFiles.filter(f => f.type === 'video');

  // Get existing audio URLs from formData (which was populated in useEffect)
  // ✅ Use the new helper
  const existingFrAudio = getAudioUrl(formData.frLocalization?.audioFiles);
  const existingArAudio = getAudioUrl(formData.arLocalization?.audioFiles);
  const existingEnAudio = getAudioUrl(formData.enLocalization?.audioFiles);

  // --- MODIFICATION: Add handler to remove existing files ---
  const handleRemoveExistingFile = (fileId: string) => {
    // 1. Remove from visual state
    setExistingFiles(prev => prev.filter(f => f.id !== fileId));
    // 2. Add to parent's state to be submitted for deletion
    onFormDataChange({
      ...formData,
      filesToRemove: [...(formData.filesToRemove || []), fileId],
    });
    toast.info('Image/Vidéo marquée pour suppression.');
  };

  // ✅ AJOUTÉ: Handler to remove existing audio files
  const handleRemoveExistingAudio = (lang: 'fr' | 'ar' | 'en') => {
    onFormDataChange({
      ...formData,
      // 1. Signaler au backend de supprimer ce fichier
      audioToRemove: { ...formData.audioToRemove, [lang]: true },
      // 2. Mettre à jour la localisation pour vider le champ audio (met à jour l'UI)
      [`${lang}Localization`]: {
        ...formData[`${lang}Localization`],
        audioFiles: null 
      }
    });
    toast.info(`Audio ${lang.toUpperCase()} marqué pour suppression.`);
  };
  
  const handleAddCustomField = (categoryKey: string, key: string, value: string) => {
    if (!key.trim()) return;

    const parsed = getParsedPracticalInfo();
    if (!parsed[categoryKey]) parsed[categoryKey] = {};

    if (parsed[categoryKey][key]) {
      alert(`La clé "${key}" existe déjà dans ${categoryKey}`);
      return;
    }

    parsed[categoryKey][key] = value;
    onFormDataChange({
      ...formData,
      practicalInfo: JSON.stringify(parsed),
    });
    setNewFieldKey('');
    setNewFieldValue('');
  };

  const handleRemoveField = (categoryKey: string, fieldKey: string) => {
    const parsed = getParsedPracticalInfo();
    if (!parsed[categoryKey]) return;

    delete parsed[categoryKey][fieldKey];
    
    onFormDataChange({
      ...formData,
      practicalInfo: JSON.stringify(parsed),
    });
  };

  const addNextField = () => {
    const fields = Object.keys(getCurrentFields());
    if (currentFieldIndex < fields.length - 1) {
      setCurrentFieldIndex(currentFieldIndex + 1);
    } else if (currentCategoryIndex < categoriesKeys.length - 1) {
      setCurrentCategoryIndex(currentCategoryIndex + 1);
      setCurrentFieldIndex(0);
    }
  };

  const goBackField = () => {
    if (currentFieldIndex > 0) {
      setCurrentFieldIndex(currentFieldIndex - 1);
    } else if (currentCategoryIndex > 0) {
      const parsed = getParsedPracticalInfo();
      const prevCategoryKey = categoriesKeys[currentCategoryIndex - 1];
      const prevFields = Object.keys(parsed[prevCategoryKey] || practicalInfoTemplate[prevCategoryKey]);
      setCurrentCategoryIndex(currentCategoryIndex - 1);
      setCurrentFieldIndex(prevFields.length - 1);
    }
  };

  const handleLocalizationChange = (lang: 'fr' | 'ar' | 'en', field: string, value: string) => {
    onFormDataChange((prevData: any) => ({
      ...prevData,
      [`${lang}Localization`]: {
        ...prevData[`${lang}Localization`],
        [field]: value,
      },
    }));
  };

  const handleLocationSelect = (location: { lat: number; lng: number; address?: string }) => {
    onFormDataChange({
      ...formData,
      latitude: location.lat.toString(),
      longitude: location.lng.toString(),
      address: location.address || formData.address,
    });
  };

  const currentLocation = formData.latitude && formData.longitude
    ? { lat: parseFloat(formData.latitude), lng: parseFloat(formData.longitude) }
    : null;

  const localizationFields = [
    { key: 'name', label: 'Nom', type: 'input' as const, required: true },
    { key: 'description', label: 'Description', type: 'textarea' as const, rows: 2 },
    { key: 'address', label: 'Adresse', type: 'input' as const },
  ];

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-medium mb-1">Information importante:</p>
          <p>Les localisations seront gérées directement par le backend. Remplissez tous les champs requis pour créer un POI complet.</p>
        </div>
      </div>

      {/* Category and City */}
      <div className="grid grid-cols-2 gap-6">
        <FormField label="Catégorie" required>
          <select
            value={formData.category}
            onChange={(e) => onFormDataChange({ ...formData, category: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Sélectionner</option>
            {/* --- MODIFICATION : Logique de parsing pour le dropdown --- */}
            {categories.map((cat: any) => {
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

              const categoryName = parseCategoryName(cat.fr) || parseCategoryName(cat.en) || parseCategoryName(cat.ar) || 'Sans nom';
              
              return (
                <option key={cat.id} value={cat.id}>
                  {categoryName}
                </option>
              );
            })}
            {/* --- FIN DE LA MODIFICATION --- */}
          </select>
        </FormField>

        <FormField label="Ville" required>
          <select
            value={formData.cityId}
            onChange={(e) => onFormDataChange({ ...formData, cityId: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Sélectionner</option>
            {cities.map((city: any) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      {/* Coordinates */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Position (Latitude, Longitude)
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
              onLocationSelect={handleLocationSelect}
              selectedLocation={currentLocation}
              height="400px"
            />
          </div>
        )}

        <div className="grid grid-cols-3 gap-4">
          <FormField label="Latitude" required>
            <input
              type="number"
              step="any"
              value={formData.latitude}
              onChange={(e) => onFormDataChange({ ...formData, latitude: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              placeholder="34.0626"
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
              placeholder="-5.0077"
              readOnly={showMap}
            />
          </FormField>

          <FormField label="Adresse">
            <input
              type="text"
              value={formData.address}
              onChange={(e) => onFormDataChange({ ...formData, address: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Rue principale"
            />
          </FormField>
        </div>
      </div>

      {/* AI Translation Component for Name */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-700">Traduction IA - Nom</h3>
        <IaNameTraduction
          localizations={{
            fr: formData.frLocalization,
            ar: formData.arLocalization,
            en: formData.enLocalization,
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
            fr: formData.frLocalization,
            ar: formData.arLocalization,
            en: formData.enLocalization,
          }}
          onChange={handleLocalizationChange}
          fieldName="description"
        />
      </div>

      {/* AI Translation Component for Address */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-700">Traduction IA - Adresse</h3>
        <IaNameTraduction
          localizations={{
            fr: formData.frLocalization,
            ar: formData.arLocalization,
            en: formData.enLocalization,
          }}
          onChange={handleLocalizationChange}
          fieldName="address"
        />
      </div>

      {/* Localized Inputs */}
      <LocalizedInputs
        localizations={{
          fr: formData.frLocalization,
          ar: formData.arLocalization,
          en: formData.enLocalization,
        }}
        onChange={handleLocalizationChange}
        fields={localizationFields}
      />

      {/* --- SECTION "Media Files" --- */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">Fichiers multimédias</h3>
        
        {/* --- Affichage des Images Existantes --- */}
        {existingImages.length > 0 && (
          <div className="space-y-2 mb-4">
            <label className="block text-sm font-medium text-gray-500">Images actuelles</label>
            <div className="flex flex-wrap gap-4">
              {existingImages.map(file => (
                <div key={file.id} className="relative w-32 h-20">
                  <img src={file.fileUrl} alt="Image POI" className="w-full h-full object-cover rounded-lg border" />
                  <button
                    type="button"
                    onClick={() => handleRemoveExistingFile(file.id)}
                    className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition-colors"
                    title="Supprimer cette image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* --- Affichage des Vidéos Existantes --- */}
        {existingVideos.length > 0 && (
          <div className="space-y-2 mb-4">
            <label className="block text-sm font-medium text-gray-500">Vidéos actuelles</label>
            <div className="flex flex-wrap gap-4">
              {existingVideos.map(file => (
                <div key={file.id} className="relative w-32 h-20 bg-black rounded-lg flex items-center justify-center">
                  <Video className="w-8 h-8 text-white" />
                  <button
                    type="button"
                    onClick={() => handleRemoveExistingFile(file.id)}
                    className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition-colors"
                    title="Supprimer cette vidéo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- Grille pour l'ajout de NOUVEAUX fichiers --- */}
        <div className="grid grid-cols-3 gap-4">
          <MultipleFileUpload
            label="Ajouter Images"
            accept="image/*"
            files={files.image || []}
            onChange={(file) => onFileChange(file, 'image')}
            onRemove={(index) => onRemoveFile && onRemoveFile('image', index)}
            icon={<ImageIcon className="w-4 h-4" />}
          />
          <MultipleFileUpload
            label="Ajouter Vidéos"
            accept="video/*"
            files={files.video || []}
            onChange={(file) => onFileChange(file, 'video')}
            onRemove={(index) => onRemoveFile && onRemoveFile('video', index)}
            icon={<Video className="w-4 h-4" />}
          />
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 flex items-center space-x-2">
              <Map360 className="w-4 h-4" />
              <span>Lien Visite 360°</span>
            </label>
            <input
              type="url"
              placeholder="https://example.com/360tour"
              value={formData.virtualTourUrl || ''}
              onChange={(e) => onFormDataChange({ ...formData, virtualTourUrl: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500">
              Entrez un lien vers une visite virtuelle 360° (iframe)
            </p>
          </div>
        </div>
      </div>
      {/* --- FIN DE LA SECTION --- */}


      {/* ✅ --- SECTION AUDIO MISE À JOUR --- */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Music className="w-5 h-5" />
          Guides audio (optionnel)
        </h3>
        <div className="grid grid-cols-3 gap-4">
          
          {/* Audio Français */}
          <div className="space-y-1">
            <MultipleFileUpload
              label="Audio Français"
              accept="audio/*"
              files={files.fr_audio || []}
              onChange={(file) => onFileChange(file, 'fr_audio')}
              onRemove={(index) => onRemoveFile && onRemoveFile('fr_audio', index)}
              icon={<Music className="w-4 h-4" />}
              maxFiles={1}
              existingFileUrl={existingFrAudio}
            />
            {existingFrAudio && (
              <button
                type="button"
                onClick={() => handleRemoveExistingAudio('fr')}
                className="w-full text-xs p-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors flex items-center justify-center gap-1"
              >
                <Trash2 className="w-3 h-3" /> Supprimer l'audio actuel
              </button>
            )}
          </div>

          {/* Audio Arabe */}
          <div className="space-y-1">
            <MultipleFileUpload
              label="Audio Arabe"
              accept="audio/*"
              files={files.ar_audio || []}
              onChange={(file) => onFileChange(file, 'ar_audio')}
              onRemove={(index) => onRemoveFile && onRemoveFile('ar_audio', index)}
              icon={<Music className="w-4 h-4" />}
              maxFiles={1}
              existingFileUrl={existingArAudio}
            />
            {existingArAudio && (
              <button
                type="button"
                onClick={() => handleRemoveExistingAudio('ar')}
                className="w-full text-xs p-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors flex items-center justify-center gap-1"
              >
                <Trash2 className="w-3 h-3" /> Supprimer l'audio actuel
              </button>
            )}
          </div>

          {/* Audio Anglais */}
          <div className="space-y-1">
            <MultipleFileUpload
              label="Audio Anglais"
              accept="audio/*"
              files={files.en_audio || []}
              onChange={(file) => onFileChange(file, 'en_audio')}
              onRemove={(index) => onRemoveFile && onRemoveFile('en_audio', index)}
              icon={<Music className="w-4 h-4" />}
              maxFiles={1}
              existingFileUrl={existingEnAudio}
            />
            {existingEnAudio && (
              <button
                type="button"
                onClick={() => handleRemoveExistingAudio('en')}
                className="w-full text-xs p-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors flex items-center justify-center gap-1"
              >
                <Trash2 className="w-3 h-3" /> Supprimer l'audio actuel
              </button>
            )}
          </div>
          
        </div>
      </div>
      {/* ✅ --- FIN DE LA SECTION AUDIO --- */}


      {/* Practical Info Progressive */}
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => setShowPracticalInfo(!showPracticalInfo)}
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-500 text-white rounded-lg flex items-center gap-2 hover:from-blue-600 hover:to-blue-600 transition-all"
        >
          <Plus className="w-4 h-4" />
          {showPracticalInfo ? 'Masquer Infos pratiques' : 'Ajouter Infos pratiques'}
        </button>

        {showPracticalInfo && (
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-4">
            <h4 className="font-bold text-sm uppercase text-blue-700">{getCurrentCategoryKey()}</h4>

            {Object.keys(getCurrentFields()).map((fieldKey, idx) => {
              if (idx > currentFieldIndex) return null;
              const parsed = getParsedPracticalInfo();
              const value = parsed?.[getCurrentCategoryKey()]?.[fieldKey] || '';

              return (
                <div key={fieldKey} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={fieldKey}
                    onChange={(e) =>
                      handleFieldKeyRename(getCurrentCategoryKey(), fieldKey, e.target.value)
                    }
                    className="w-32 px-2 py-1 border rounded-lg text-xs focus:ring-1 focus:ring-blue-400 focus:border-transparent"
                  />
                  <input
                    type="text"
                    value={value}
                    onChange={(e) =>
                      handleFieldChange(getCurrentCategoryKey(), fieldKey, e.target.value)
                    }
                    className="flex-1 px-2 py-1 border rounded-lg text-sm focus:ring-1 focus:ring-blue-400 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveField(getCurrentCategoryKey(), fieldKey)}
                    className="px-2 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              );
            })}

            {/* Add Custom Field */}
            <div className="flex items-center gap-2 mt-4">
              <input
                type="text"
                placeholder="Nouvelle clé"
                value={newFieldKey}
                onChange={(e) => setNewFieldKey(e.target.value)}
                className="w-32 px-2 py-1 border rounded-lg text-xs focus:ring-1 focus:ring-blue-400 focus:border-transparent"
              />
              <input
                type="text"
                placeholder="Nouvelle valeur"
                value={newFieldValue}
                onChange={(e) => setNewFieldValue(e.target.value)}
                className="flex-1 px-2 py-1 border rounded-lg text-sm focus:ring-1 focus:ring-blue-400 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => handleAddCustomField(getCurrentCategoryKey(), newFieldKey, newFieldValue)}
                className="px-3 py-1 bg-green-500 text-white rounded-lg text-xs hover:bg-green-600"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={goBackField}
                className="px-3 py-1 bg-gray-200 rounded-lg text-xs flex items-center gap-1 hover:bg-gray-300"
                disabled={currentCategoryIndex === 0 && currentFieldIndex === 0}
              >
                <ChevronLeft className="w-3 h-3" /> Retour
              </button>
              <button
                type="button"
                onClick={addNextField}
                className="px-3 py-1 bg-blue-500 text-white rounded-lg text-xs flex items-center gap-1 hover:bg-blue-600"
              >
                Suivant <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Summary of Practical Info */}
      {showPracticalInfo && Object.keys(getParsedPracticalInfo()).length > 0 && (
        <div className="mt-6 border border-blue-200 rounded-lg bg-blue-50 overflow-hidden">
          <button
            type="button"
            onClick={() => setShowSummary(!showSummary)}
            className="w-full px-4 py-3 text-left font-semibold text-blue-700 hover:bg-blue-100 transition-colors flex items-center justify-between"
          >
            <span className="text-sm">Résumé des infos pratiques</span>
            <ChevronRight className={`w-4 h-4 transition-transform ${showSummary ? 'rotate-90' : ''}`} />
          </button>
          
          {showSummary && (
            <div className="px-4 pb-4 text-sm text-gray-800 space-y-3">
              {Object.entries(getParsedPracticalInfo()).map(([category, fields]) => (
                <div key={category} className="bg-white p-3 rounded-lg">
                  <p className="font-medium text-blue-600 mb-2">{category}</p>
                  <ul className="ml-4 space-y-1">
                    {typeof fields === 'object' && fields !== null &&
                      Object.entries(fields).map(([key, value]) => (
                        <li key={key} className="text-xs">
                          <span className="font-semibold">{key}:</span>{' '}
                          {Array.isArray(value) ? value.join(', ') : value || '—'}
                        </li>
                      ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Status Checkboxes */}
      <div className="flex items-center space-x-6 pt-4 border-t">
        <Checkbox
          label="Actif"
          checked={formData.isActive}
          onChange={(checked) => onFormDataChange({ ...formData, isActive: checked })}
        />
        <Checkbox
          label="Vérifié"
          checked={formData.isVerified}
          onChange={(checked) => onFormDataChange({ ...formData, isVerified: checked })}
        />
        <Checkbox
          label="Premium"
          checked={formData.isPremium}
          onChange={(checked) => onFormDataChange({ ...formData, isPremium: checked })}
        />
      </div>

      {/* Form Actions */}
      <FormActions onCancel={onCancel} isSubmitting={isSubmitting} isEdit={!!selectedPOI} />
    </form>
  );
}