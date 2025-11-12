'use client';

import React from 'react';
import { Star, Check, X, Trash2, MapPin, User } from 'lucide-react';
import Image from 'next/image';

interface ReviewCardProps {
  review: any;
  onApprove: (id: string) => void;
  onDeny: (review: any) => void;
  onDelete: (id: string) => void;
  isApproving: boolean;
  isDenying: boolean;
  isDeleting: boolean;
  parseLoc: (val: any) => any;
}

export function ReviewCard({
  review,
  onApprove,
  onDeny,
  onDelete,
  isApproving,
  isDenying,
  isDeleting,
  parseLoc,
}: ReviewCardProps) {
  // Get POI name from localization
  const poiName = review.poi?.frLocalization?.name || 
                  review.poi?.enLocalization?.name || 
                  review.poi?.arLocalization?.name || 
                  'POI inconnu';
  const userName = `${review.user?.firstName || ''} ${review.user?.lastName || ''}`.trim() || 'Utilisateur';
  
  // Parse photos if they exist
  let photos: string[] = [];
  if (review.photos) {
    try {
      photos = typeof review.photos === 'string' ? JSON.parse(review.photos) : review.photos;
    } catch (e) {
      console.error('Error parsing photos:', e);
    }
  }

  // Get status badge
  const getStatusBadge = () => {
    if (review.isAccepted) {
      return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Approuvé</span>;
    } else if (review.aiReport) {
      return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Refusé</span>;
    } else {
      return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">En attente</span>;
    }
  };

  return (
    <div className="bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1">
          {/* User Avatar */}
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
            {review.user?.profileImage ? (
              <Image
                src={review.user.profileImage}
                alt={userName}
                width={40}
                height={40}
                className="object-cover"
              />
            ) : (
              <User className="w-5 h-5 text-gray-500" />
            )}
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-medium text-gray-900">{userName}</h3>
              {getStatusBadge()}
            </div>
            <p className="text-sm text-gray-500">{review.user?.email || ''}</p>
            
            {/* POI Info */}
            <div className="flex items-center gap-1 mt-1 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{poiName}</span>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1 mt-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                  }`}
                />
              ))}
              <span className="ml-1 text-sm font-medium">{review.rating}</span>
            </div>
          </div>
        </div>

        {/* Date */}
        <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
          {new Date(review.created_at).toLocaleDateString('fr-FR')}
        </span>
      </div>

      {/* Comment */}
      {review.comment && (
        <div className="mb-4">
          <p className="text-gray-700 text-sm">{review.comment}</p>
        </div>
      )}

      {/* Photos */}
      {photos.length > 0 && (
        <div className="mb-4 flex gap-2 overflow-x-auto">
          {photos.map((photo, index) => (
            <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src={photo}
                alt={`Photo ${index + 1}`}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}

      {/* Denial Reason */}
      {review.aiReport && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">
            <strong>Raison du refus:</strong> {review.aiReport}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-4 border-t">
        {!review.isAccepted && !review.aiReport && (
          <>
            <button
              onClick={() => onApprove(review.id)}
              disabled={isApproving}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              <Check className="w-4 h-4" />
              Approuver
            </button>
            <button
              onClick={() => onDeny(review)}
              disabled={isDenying}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              <X className="w-4 h-4" />
              Refuser
            </button>
          </>
        )}
        
        <button
          onClick={() => onDelete(review.id)}
          disabled={isDeleting}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm ml-auto"
        >
          <Trash2 className="w-4 h-4" />
          Supprimer
        </button>
      </div>
    </div>
  );
}
