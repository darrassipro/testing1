'use client';

import { Edit2, Trash2 } from 'lucide-react';

interface IAModel {
  id: number;
  provider: 'gemini' | 'grok' | 'openai';
  models_list: string[];
  selected_model: string;
  api_key: string | null;
  prompt: string;
  is_default: boolean;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface IAModelTableProps {
  models: IAModel[];
  onEdit: (model: IAModel) => void;
  onDelete: (id: number) => void;
}

const getProviderColor = (provider: string) => {
  switch (provider.toLowerCase()) {
    case 'gemini':
      return 'bg-blue-100 text-blue-800';
    case 'grok':
      return 'bg-blue-100 text-blue-800';
    case 'openai':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getProviderIcon = (provider: string) => {
  switch (provider.toLowerCase()) {
    case 'gemini':
      return '✨';
    case 'grok':
      return '🚀';
    case 'openai':
      return '🤖';
    default:
      return '🔮';
  }
};

export function IAModelTable({ models, onEdit, onDelete }: IAModelTableProps) {
  if (models.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-500">
        Aucun modèle IA configuré. Cliquez sur "Nouveau Modèle" pour commencer.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-300">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Fournisseur
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Modèle Sélectionné
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Prompt
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {models.map((model) => (
              <tr key={model.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{getProviderIcon(model.provider)}</span>
                    <div>
                      <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${getProviderColor(model.provider)} shadow-sm`}>
                        {model.provider.toUpperCase()}
                      </span>
                      {model.is_default && (
                        <span className="ml-2 px-3 py-1 bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 text-xs font-bold rounded-full shadow-sm">
                          ⭐ Par défaut
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-bold text-gray-900 bg-gradient-to-r from-purple-100 to-pink-100 px-3 py-1.5 rounded-lg inline-block">
                      🎯 {model.selected_model}
                    </span>
                    <span className="text-xs text-gray-500">
                      {model.models_list?.length || 0} modèles disponibles
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  <div className="max-w-md truncate font-mono text-xs bg-gray-50 px-3 py-2 rounded-lg border border-gray-200" title={model.prompt}>
                    {model.prompt.substring(0, 60)}{model.prompt.length > 60 ? '...' : ''}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col gap-2">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${
                      model.is_active 
                        ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800' 
                        : 'bg-gradient-to-r from-red-100 to-red-200 text-red-800'
                    }`}>
                      {model.is_active ? '✅ Actif' : '❌ Inactif'}
                    </span>
                    {model.api_key ? (
                      <span className="px-3 py-1.5 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 text-xs font-bold rounded-full shadow-sm">
                        🔑 API OK
                      </span>
                    ) : (
                      <span className="px-3 py-1.5 bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 text-xs font-bold rounded-full shadow-sm">
                        ⚠️ Pas d'API
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onEdit(model)}
                      className="p-2.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-all shadow-sm hover:shadow-md"
                      title="Modifier"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => onDelete(model.id)}
                      className="p-2.5 text-red-600 hover:bg-red-100 rounded-lg transition-all shadow-sm hover:shadow-md"
                      title="Supprimer"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
