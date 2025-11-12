'use client';

import { useRef, useState } from 'react';
import { Upload, X, Plus, Loader2,CheckCircle } from 'lucide-react';
import { compressImageByType } from '../../../utils/imageCompression';
import { toast } from 'sonner';

interface MultipleFileUploadProps {
  label: string;
  accept?: string;
  files: File[];
  onChange: (file: File) => void;
  onRemove: (index: number) => void;
  icon?: React.ReactNode;
  maxFiles?: number;
  existingFileUrl?: string; // --- J'ai gardé ceci de notre correction précédente ---
}

export function MultipleFileUpload({
  label,
  accept = 'image/*',
  files,
  onChange,
  onRemove,
  icon,
  maxFiles = 10,
  existingFileUrl, // --- J'ai gardé ceci de notre correction précédente ---
}: MultipleFileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // --- MODIFICATION: Renommé en 'isProcessing' pour être plus générique ---
  const [isProcessing, setIsProcessing] = useState(false);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  // --- MODIFICATION: La fonction 'handleFileChange' est mise à jour ---
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file && files.length < maxFiles) {
      setIsProcessing(true); // Activer le chargement
      
      try {
        // --- FIX: NE COMPRESSER QUE LES IMAGES ---
        if (accept === 'image/*') {
          // C'est une image, on la compresse
          const compressedResult = await compressImageByType(file, {
            maxSizeKB: 512, 
          });
          onChange(compressedResult.file);
        } else {
          // C'est un audio ou une vidéo, on l'envoie tel quel
          onChange(file);
        }
        
      } catch (err) {
        console.error("Erreur de compression ou de fichier:", err);
        // L'erreur que vous voyiez venait d'ici
        toast.error(`Erreur de fichier: ${(err as Error).message}`);
      } finally {
        setIsProcessing(false); // Désactiver le chargement
      }

      // Réinitialiser l'input pour permettre de sélectionner le même fichier
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // --- Logique pour l'affichage (inchangée) ---
  const hasExistingFile = !!existingFileUrl;
  const hasNewFiles = files.length > 0;
  
  const showUploadButton = maxFiles === 1 
    ? !hasExistingFile && !hasNewFiles 
    : files.length < maxFiles;

  const buttonDisabled = isProcessing || 
    (maxFiles === 1 && (hasExistingFile || hasNewFiles)) || 
    files.length >= maxFiles;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 flex items-center space-x-2">
        {icon || <Upload className="w-4 h-4" />}
        <span>{label}</span>
        <span className="text-xs text-gray-500">
          {maxFiles === 1 && (hasExistingFile || hasNewFiles) ? '(1/1)' : `(${files.length}/${maxFiles})`}
        </span>
      </label>

      {/* --- Affichage du fichier existant (pour audio) --- */}
      {maxFiles === 1 && hasExistingFile && (
        <div className="flex items-center justify-between bg-green-50 p-2 rounded text-sm border border-green-200">
          <div className="flex-1 min-w-0 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
            <p className="truncate text-green-800 font-medium">Fichier actuel</p>
          </div>
        </div>
      )}

      {/* --- Zone d'upload --- */}
      {showUploadButton && (
        <button
          type="button"
          onClick={handleClick}
          className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-500 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
          disabled={buttonDisabled}
        >
          {isProcessing ? ( // --- MODIFICATION: Utilise 'isProcessing' ---
            <>
              <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
              {/* --- MODIFICATION: Texte mis à jour --- */}
              <span className="text-sm text-gray-600">Traitement...</span>
            </>
          ) : (
            <>
              <Plus className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-600">
                {buttonDisabled ? 'Limite atteinte' : 'Ajouter un fichier'}
              </span>
            </>
          )}
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        disabled={buttonDisabled}
      />

      {/* Liste des *nouveaux* fichiers */}
      {files.length > 0 && (
        <div className="space-y-2 mt-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-gray-50 p-2 rounded text-sm"
            >
              <div className="flex-1 min-w-0">
                <p className="truncate text-gray-700">{file.name}</p>
                <p className="text-xs text-gray-500">
                  {/* Afficher la taille du fichier */}
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="ml-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                title="Supprimer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}