'use client';

import { Key, MessageSquare, Check, X, Cpu, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface IAModelFormProps {
  formData: {
    provider: 'gemini' | 'grok' | 'openai';
    models_list: string[];
    selected_model: string;
    api_key: string;
    prompt: string;
    is_default: boolean;
    is_active: boolean;
  };
  editingModel: any | null;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  onFormDataChange: (data: any) => void;
}

// Suggested models for each provider (not enforced)
const SUGGESTED_MODELS = {
  gemini: [
    'gemini-2.0-flash-exp',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-pro'
  ],
  grok: [
    'grok-beta',
    'grok-2-latest',
    'grok-2-vision-1212'
  ],
  openai: [
    'gpt-4o',
    'gpt-4o-mini',
    'gpt-4-turbo',
    'gpt-4',
    'gpt-3.5-turbo'
  ]
};

// Default prompts optimized for batch translation
const DEFAULT_PROMPTS = {
  gemini: 'You are a professional multilingual translator. Translate text accurately to multiple languages simultaneously. Return ONLY a JSON object with language codes as keys and translations as values.',
  grok: 'You are an expert translator. Translate the given text to multiple languages with speed and accuracy. Respond with a clean JSON object containing language codes and their translations.',
  openai: 'You are a professional translator. Translate text to multiple languages precisely. Return only a JSON object with language codes as keys and accurate translations as values.'
};

export function IAModelForm({
  formData,
  editingModel,
  onSubmit,
  onCancel,
  onFormDataChange
}: IAModelFormProps) {
  const [newModel, setNewModel] = useState('');

  const handleProviderChange = (newProvider: 'gemini' | 'grok' | 'openai') => {
    onFormDataChange({
      ...formData,
      provider: newProvider,
      models_list: SUGGESTED_MODELS[newProvider],
      selected_model: SUGGESTED_MODELS[newProvider][0],
      prompt: DEFAULT_PROMPTS[newProvider]
    });
  };

  const handleAddModel = () => {
    if (newModel.trim() && !formData.models_list.includes(newModel.trim())) {
      const updatedList = [...formData.models_list, newModel.trim()];
      onFormDataChange({
        ...formData,
        models_list: updatedList
      });
      setNewModel('');
    }
  };

  const handleRemoveModel = (modelToRemove: string) => {
    const updatedList = formData.models_list.filter(m => m !== modelToRemove);
    onFormDataChange({
      ...formData,
      models_list: updatedList,
      // If removing the selected model, select the first one
      selected_model: modelToRemove === formData.selected_model && updatedList.length > 0
        ? updatedList[0]
        : formData.selected_model
    });
  };

  const handleLoadSuggested = () => {
    onFormDataChange({
      ...formData,
      models_list: SUGGESTED_MODELS[formData.provider],
      selected_model: SUGGESTED_MODELS[formData.provider][0]
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {/* Provider Selection */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border-2 border-blue-200">
        <label className="block text-sm font-semibold text-gray-800 mb-3">
          🤖 Fournisseur IA *
        </label>
        <select
          value={formData.provider}
          onChange={(e) => handleProviderChange(e.target.value as 'gemini' | 'grok' | 'openai')}
          className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white font-medium text-gray-800 shadow-sm transition-all"
          required
          disabled={!!editingModel}
        >
          <option value="gemini">✨ Gemini (Google AI) - Recommended</option>
          <option value="grok">🚀 Grok (X.AI) - Fast & Efficient</option>
          <option value="openai">🤖 OpenAI (ChatGPT) - Premium</option>
        </select>
        {editingModel && (
          <p className="text-xs text-gray-600 mt-2 bg-yellow-100 px-3 py-2 rounded-lg">
            ⚠️ Le fournisseur ne peut pas être modifié après la création
          </p>
        )}
      </div>

      {/* Models List Management */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border-2 border-purple-200">
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-semibold text-gray-800 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-purple-600" />
            Liste des Modèles
          </label>
          <button
            type="button"
            onClick={handleLoadSuggested}
            className="text-xs px-3 py-1 bg-purple-200 text-purple-700 rounded-lg hover:bg-purple-300 transition-colors"
          >
            📋 Charger suggérés
          </button>
        </div>

        {/* Add New Model */}
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newModel}
            onChange={(e) => setNewModel(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddModel())}
            className="flex-1 px-3 py-2 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
            placeholder="Nom du modèle (ex: gpt-4o)"
          />
          <button
            type="button"
            onClick={handleAddModel}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
        </div>

        {/* Models List */}
        <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
          {formData.models_list.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-4">Aucun modèle. Ajoutez-en un ou chargez les suggérés.</p>
          ) : (
            formData.models_list.map((model) => (
              <div
                key={model}
                className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-purple-200"
              >
                <span className="text-sm font-medium text-gray-800">{model}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveModel(model)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Selected Model */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Modèle Sélectionné *
          </label>
          <select
            value={formData.selected_model || ''}
            onChange={(e) => onFormDataChange({ ...formData, selected_model: e.target.value })}
            className="w-full px-4 py-2 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white font-medium text-gray-800 shadow-sm transition-all"
            required
            disabled={formData.models_list.length === 0}
          >
            {formData.models_list.length === 0 ? (
              <option value="">Aucun modèle disponible</option>
            ) : (
              formData.models_list.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))
            )}
          </select>
        </div>

        <div className="mt-3 text-xs text-gray-600 bg-white px-3 py-2 rounded-lg">
          {formData.provider === 'gemini' && '💡 gemini-2.0-flash-exp is fastest and most cost-effective'}
          {formData.provider === 'grok' && '💡 grok-beta offers excellent speed and accuracy'}
          {formData.provider === 'openai' && '💡 gpt-4o-mini provides best balance of speed and quality'}
        </div>
      </div>

      {/* API Key */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border-2 border-green-200">
        <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Key className="w-5 h-5 text-green-600" />
          Clé API *
        </label>
        <input
          type="password"
          value={formData.api_key}
          onChange={(e) => onFormDataChange({ ...formData, api_key: e.target.value })}
          className="w-full px-4 py-3 border-2 border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 font-mono bg-white shadow-sm transition-all"
          placeholder="Entrez votre clé API secrète..."
          required
        />
        <div className="mt-3 text-xs bg-white px-3 py-2 rounded-lg">
          {formData.provider === 'gemini' && (
            <a href="https://ai.google.dev" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 font-medium">
              🔗 Obtenir une clé API Gemini →
            </a>
          )}
          {formData.provider === 'grok' && (
            <a href="https://x.ai/api" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 font-medium">
              🔗 Obtenir une clé API Grok →
            </a>
          )}
          {formData.provider === 'openai' && (
            <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 font-medium">
              🔗 Obtenir une clé API OpenAI →
            </a>
          )}
        </div>
      </div>

      {/* Custom Prompt */}
      <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-xl border-2 border-orange-200">
        <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-orange-600" />
          Prompt de traduction (System Prompt) *
        </label>
        <textarea
          value={formData.prompt}
          onChange={(e) => onFormDataChange({ ...formData, prompt: e.target.value })}
          className="w-full px-4 py-3 border-2 border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-mono text-sm bg-white shadow-sm transition-all"
          rows={5}
          placeholder="Instructions pour le modèle IA..."
          required
        />
        <div className="mt-3 text-xs text-gray-700 bg-white px-3 py-2 rounded-lg space-y-1">
          <p className="font-medium">💡 Conseils pour un prompt efficace :</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Demandez un objet JSON avec codes de langue comme clés</li>
            <li>Spécifiez "ONLY JSON, no explanations" pour des réponses rapides</li>
            <li>Mentionnez "accurate and fast translation" pour la qualité</li>
          </ul>
        </div>
      </div>

      {/* Settings */}
      <div className="flex items-center gap-6 bg-gray-50 p-4 rounded-xl border-2 border-gray-200">
        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={formData.is_default}
            onChange={(e) => onFormDataChange({ ...formData, is_default: e.target.checked })}
            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
          />
          <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
            ⭐ Par défaut
          </span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={formData.is_active}
            onChange={(e) => onFormDataChange({ ...formData, is_active: e.target.checked })}
            className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
          />
          <span className="text-sm font-semibold text-gray-700 group-hover:text-green-600 transition-colors">
            ✅ Actif
          </span>
        </label>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all flex items-center justify-center gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <Check className="w-5 h-5" />
          {editingModel ? 'Mettre à jour le modèle' : 'Créer le modèle'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all flex items-center gap-2 font-semibold shadow-md hover:shadow-lg"
        >
          <X className="w-5 h-5" />
          Annuler
        </button>
      </div>
    </form>
  );
}
