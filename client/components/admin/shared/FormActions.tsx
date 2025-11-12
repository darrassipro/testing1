'use client';

import { Loader2 } from 'lucide-react';

interface FormActionsProps {
  onCancel: () => void;
  onSubmit?: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
  isEdit?: boolean;
}

export function FormActions({
  onCancel,
  isSubmitting,
  submitLabel,
  isEdit,
}: FormActionsProps) {
  return (
    <div className="flex justify-end space-x-3 pt-4 border-t">
      <button
        type="button"
        onClick={onCancel}
        className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        Annuler
      </button>
      <button
        type="submit"
        disabled={isSubmitting}
        className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center space-x-2"
      >
        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
        <span>
          {submitLabel || (isEdit ? 'Mettre à jour' : 'Créer')}
        </span>
      </button>
    </div>
  );
}