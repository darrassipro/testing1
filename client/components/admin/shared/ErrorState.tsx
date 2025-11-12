'use client';

import { AlertCircle } from 'lucide-react';

interface ErrorStateProps {
  error: any;
  onRetry?: () => void;
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
      <div className="flex items-start space-x-3">
        <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-red-600 font-medium mb-2">Erreur lors du chargement</p>
          <pre className="text-xs text-red-800 bg-red-100 p-3 rounded overflow-auto">
            {JSON.stringify(error, null, 2)}
          </pre>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Réessayer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}