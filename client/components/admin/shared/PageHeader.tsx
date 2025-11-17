'use client';

import { Plus } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  count?: number;
  onAdd?: () => void;
  addLabel?: string;
}

export function PageHeader({ title, count, onAdd, addLabel = 'Nouveau' }: PageHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
        {count !== undefined && (
          <p className="text-gray-600 mt-1">{count} au total</p>
        )}
      </div>
      {onAdd && (
        <button
          onClick={onAdd}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>{addLabel}</span>
        </button>
      )}
    </div>
  );
}