'use client';

import { useState } from 'react';
import { ImageIcon, X } from 'lucide-react';
import ImagePreview from './ImagePreview';

interface FileUploadProps {
  label: string;
  accept?: string;
  preview?: string | null;
  required?: boolean;
  onChange: (file: File) => void;
  onClearPreview?: () => void;
  icon?: React.ReactNode;
}

export function FileUpload({
  label,
  accept = 'image/*',
  preview,
  required,
  onChange,
  onClearPreview,
  icon,
}: FileUploadProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
        {icon || <ImageIcon className="w-4 h-4" />}
        <span>
          {label} {required && <span className="text-red-500">*</span>}
        </span>
      </label>
      <input
        type="file"
        accept={accept}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onChange(file);
        }}
        className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        required={required}
      />
      {preview && (
        <div className="mt-3 relative">
          {onClearPreview && (
            <button
              type="button"
              onClick={onClearPreview}
              className="absolute top-2 right-2 z-10 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <ImagePreview src={preview} alt="Preview" className="w-full h-32" />
        </div>
      )}
    </div>
  );
}