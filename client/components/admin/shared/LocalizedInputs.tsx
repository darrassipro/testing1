'use client';

import { Globe } from 'lucide-react';

interface LocalizationData {
  name: string;
  description?: string;
  desc?: string;
  address?: string;
}

interface LocalizedInputsProps {
  localizations: {
    fr: LocalizationData;
    ar: LocalizationData;
    en: LocalizationData;
  };
  onChange: (lang: 'fr' | 'ar' | 'en', field: string, value: string) => void;
  fields?: Array<{ key: string; label: string; type?: 'input' | 'textarea'; rows?: number; required?: boolean }>;
}

const DEFAULT_FIELDS = [
  { key: 'name', label: 'Nom', type: 'input' as const, required: true },
  { key: 'description', label: 'Description', type: 'textarea' as const, rows: 3 },
];

export function LocalizedInputs({ localizations, onChange, fields = DEFAULT_FIELDS }: LocalizedInputsProps) {
  const languages = [
    { code: 'fr' as const, label: 'Français' },
    { code: 'ar' as const, label: 'Arabe' },
    { code: 'en' as const, label: 'Anglais' },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {languages.map(({ code, label }) => (
        <div key={code} className="space-y-3 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
            <Globe className="w-4 h-4" />
            <span>{label}</span>
          </h4>
          {fields.map((field) => (
            <div key={field.key}>
              {field.type === 'textarea' ? (
                <textarea
                  placeholder={`${field.label}${field.required ? ' *' : ''}`}
                  value={(localizations[code] as any)[field.key] || ''}
                  onChange={(e) => onChange(code, field.key, e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={field.rows || 3}
                  required={field.required}
                />
              ) : (
                <input
                  type="text"
                  placeholder={`${field.label}${field.required ? ' *' : ''}`}
                  value={(localizations[code] as any)[field.key] || ''}
                  onChange={(e) => onChange(code, field.key, e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required={field.required}
                />
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
        