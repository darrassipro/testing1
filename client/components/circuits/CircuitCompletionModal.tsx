"use client";

import React from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle2, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PointsAwarded {
  activity: string;
  points: number;
  description: string;
}

interface CircuitCompletionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalPoints: number;
  pointsAwarded?: PointsAwarded[];
}

export function CircuitCompletionModal({
  open,
  onOpenChange,
  totalPoints,
  pointsAwarded = []
}: CircuitCompletionModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden [&>button]:hidden">
        <div className="flex flex-col items-center justify-center p-8 bg-white">
          {/* Icône de succès */}
          <div className="mb-6 relative">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
          </div>

          {/* Titre */}
          <DialogTitle className="text-2xl font-bold text-gray-900 mb-2">
            Vous êtes arrivé
          </DialogTitle>

          {/* Message */}
          <p className="text-gray-600 text-sm mb-6 text-center">
            Vous avez atteint votre destination en toute sécurité
          </p>

          {/* Points gagnés */}
          <div className="flex items-center gap-2 mb-6">
            <span className="text-gray-700 text-sm">Vous avez gagné</span>
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span className="text-2xl font-bold text-gray-900">
                {totalPoints}
              </span>
            </div>
            <span className="text-gray-700 text-sm">points de récompense</span>
          </div>

          {/* Détails des points (si disponibles) */}
          {pointsAwarded.length > 0 && (
            <div className="w-full border-t border-gray-200 pt-4 mt-4">
              <div className="space-y-2">
                {pointsAwarded.map((award, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-gray-600">{award.description}</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold text-gray-900">
                        +{award.points}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

