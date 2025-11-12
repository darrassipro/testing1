'use client';

import Image from 'next/image';
import { StatusBadge } from '../shared/StatusBadge';
import { ActionButtons } from '../shared/ActionButtons';
import { Folder } from 'lucide-react';

interface CategoryCardProps {
  category: any;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
  parseLoc: (loc: any) => { name: string; desc?: string };
}

export function CategoryCard({
  category,
  onEdit,
  onDelete,
  isDeleting,
  parseLoc,
}: CategoryCardProps) {
  const frLoc = parseLoc(category.fr);
  const nbPois = category.nbPois || 0;

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden border border-gray-100">
      <div className="relative h-32 overflow-hidden">
        {category.icon ? (
          <Image
            src={category.icon}
            alt={frLoc.name || 'Catégorie'}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-50 flex items-center justify-center">
            <Folder className="w-16 h-16 text-blue-600" />
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-900 mb-1">
          {frLoc.name || 'Sans nom'}
        </h3>
        
        {frLoc.desc && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {frLoc.desc}
          </p>
        )}

        <div className="text-sm text-gray-500 mb-3">
          <div className="flex items-center gap-2">
            <span>📍</span>
            <strong>POIs:</strong>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
              {nbPois}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t">
          <StatusBadge active={category.isActive} />
          <ActionButtons
            onEdit={onEdit}
            onDelete={onDelete}
            isDeleting={isDeleting}
          />
        </div>
      </div>
    </div>
  );
}