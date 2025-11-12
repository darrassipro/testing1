'use client';

import { X } from 'lucide-react';
import Image from 'next/image';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  profileImage?: string;
  location?: string;
  createdAt: string;
  role: 'user' | 'admin' | 'moderator';
  isVerified: boolean;
  isDeleted: boolean;
  phone?: string;
  authProvider?: string;
}

interface UserViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export default function UserViewModal({ isOpen, onClose, user }: UserViewModalProps) {
  if (!isOpen || !user) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      user: 'Utilisateur',
      admin: 'Administrateur',
      moderator: 'Modérateur'
    };
    return labels[role] || role;
  };

  const getStatusLabel = (isDeleted: boolean) => {
    return isDeleted ? 'Suspendu' : 'Actif';
  };

  const getStatusColor = (isDeleted: boolean) => {
    return isDeleted ? 'text-red-600' : 'text-green-600';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-lg md:max-w-[600px] bg-white rounded-[20px] shadow-lg p-6 md:p-8 overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-inter font-semibold text-[24px] text-[#000000]">
            Détails de l'utilisateur
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-6 h-6 text-[#6E6D6D]" />
          </button>
        </div>

        {/* User Info */}
  <div className="flex flex-col gap-6">
          {/* Profile Image & Name */}
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="w-[80px] h-[80px] rounded-full overflow-hidden relative flex-shrink-0">
              {user.profileImage ? (
                <Image
                  src={user.profileImage}
                  alt={`${user.firstName} ${user.lastName}`}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 font-medium text-2xl">
                    {user.firstName[0]}{user.lastName[0]}
                  </span>
                </div>
              )}
            </div>
            <div>
              <h3 className="font-inter font-semibold text-[20px] text-[#000000]">
                {user.firstName} {user.lastName}
              </h3>
              <p className="font-inter text-[14px] text-[#6E6D6D]">
                {user.email}
              </p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-inter font-medium text-[12px] text-[#6E6D6D] uppercase">
                Rôle
              </label>
              <p className="font-inter text-[16px] text-[#000000] mt-1">
                {getRoleLabel(user.role)}
              </p>
            </div>

            <div>
              <label className="font-inter font-medium text-[12px] text-[#6E6D6D] uppercase">
                Statut
              </label>
              <p className={`font-inter font-medium text-[16px] mt-1 ${getStatusColor(user.isDeleted)}`}>
                {getStatusLabel(user.isDeleted)}
              </p>
            </div>

            <div>
              <label className="font-inter font-medium text-[12px] text-[#6E6D6D] uppercase">
                Localisation
              </label>
              <p className="font-inter text-[16px] text-[#000000] mt-1">
                {user.location || 'Non renseigné'}
              </p>
            </div>

            <div>
              <label className="font-inter font-medium text-[12px] text-[#6E6D6D] uppercase">
                Téléphone
              </label>
              <p className="font-inter text-[16px] text-[#000000] mt-1">
                {user.phone || 'Non renseigné'}
              </p>
            </div>

            <div>
              <label className="font-inter font-medium text-[12px] text-[#6E6D6D] uppercase">
                Email vérifié
              </label>
              <p className={`font-inter font-medium text-[16px] mt-1 ${user.isVerified ? 'text-green-600' : 'text-red-600'}`}>
                {user.isVerified ? 'Oui' : 'Non'}
              </p>
            </div>

            <div>
              <label className="font-inter font-medium text-[12px] text-[#6E6D6D] uppercase">
                Fournisseur d'auth
              </label>
              <p className="font-inter text-[16px] text-[#000000] mt-1">
                {user.authProvider || 'Email'}
              </p>
            </div>

            <div className="col-span-2">
              <label className="font-inter font-medium text-[12px] text-[#6E6D6D] uppercase">
                Date d'inscription
              </label>
              <p className="font-inter text-[16px] text-[#000000] mt-1">
                {formatDate(user.createdAt)}
              </p>
            </div>
          </div>

          {/* Close Button */}
          <div className="flex justify-end mt-4">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-[#007036] text-white rounded-lg font-inter font-medium hover:bg-[#005528] transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
