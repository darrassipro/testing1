'use client';

import { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import { toast } from 'react-hot-toast';
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
}

interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  role: 'user' | 'admin' | 'moderator';
  location?: string;
  profileImage?: File | null;
}

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UserFormData) => void;
  user: User | null;
  mode: 'add' | 'edit';
}

export default function UserFormModal({ isOpen, onClose, onSubmit, user, mode }: UserFormModalProps) {
  const [formData, setFormData] = useState<UserFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'user',
    location: '',
    profileImage: null,
  });
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    if (mode === 'edit' && user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: '',
        role: user.role,
        location: user.location || '',
        profileImage: null,
      });
      if (user.profileImage) {
        setImagePreview(user.profileImage);
      }
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'user',
        location: '',
        profileImage: null,
      });
      setImagePreview('');
    }
  }, [mode, user, isOpen]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, profileImage: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (mode === 'add' && !formData.password) {
      toast.error('Le mot de passe est requis pour créer un utilisateur');
      return;
    }

    onSubmit(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-lg md:max-w-[600px] bg-white rounded-[20px] shadow-lg p-6 md:p-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-inter font-semibold text-[24px] text-[#000000]">
            {mode === 'add' ? 'Ajouter un utilisateur' : 'Modifier l\'utilisateur'}
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-6 h-6 text-[#6E6D6D]" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Profile Image */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-[100px] h-[100px] rounded-full overflow-hidden relative border-2 border-gray-200">
              {imagePreview ? (
                <Image
                  src={imagePreview}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-gray-400" />
                </div>
              )}
            </div>
            <label className="px-4 py-2 bg-gray-100 text-[#000000] rounded-lg font-inter text-[14px] cursor-pointer hover:bg-gray-200 transition-colors">
              Choisir une image
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-inter font-medium text-[14px] text-[#000000] mb-2 block">
                Prénom *
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full h-[48px] px-4 border border-[#E0E0E0] rounded-lg font-inter text-[14px] focus:outline-none focus:border-[#007036]"
                required
              />
            </div>

            <div>
              <label className="font-inter font-medium text-[14px] text-[#000000] mb-2 block">
                Nom *
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full h-[48px] px-4 border border-[#E0E0E0] rounded-lg font-inter text-[14px] focus:outline-none focus:border-[#007036]"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="font-inter font-medium text-[14px] text-[#000000] mb-2 block">
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full h-[48px] px-4 border border-[#E0E0E0] rounded-lg font-inter text-[14px] focus:outline-none focus:border-[#007036]"
              required
            />
          </div>

          {/* Password (only for add mode) */}
          {mode === 'add' && (
            <div>
              <label className="font-inter font-medium text-[14px] text-[#000000] mb-2 block">
                Mot de passe *
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full h-[48px] px-4 border border-[#E0E0E0] rounded-lg font-inter text-[14px] focus:outline-none focus:border-[#007036]"
                required={mode === 'add'}
                minLength={8}
              />
            </div>
          )}

          {/* Password (optional for edit mode) */}
          {mode === 'edit' && (
            <div>
              <label className="font-inter font-medium text-[14px] text-[#000000] mb-2 block">
                Nouveau mot de passe (optionnel)
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full h-[48px] px-4 border border-[#E0E0E0] rounded-lg font-inter text-[14px] focus:outline-none focus:border-[#007036]"
                placeholder="Laisser vide pour ne pas modifier"
                minLength={8}
              />
              <p className="text-[12px] text-[#6E6D6D] mt-1">
                Laissez ce champ vide si vous ne souhaitez pas changer le mot de passe
              </p>
            </div>
          )}

          {/* Role */}
          <div>
            <label className="font-inter font-medium text-[14px] text-[#000000] mb-2 block">
              Rôle *
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as 'user' | 'admin' | 'moderator' })}
              className="w-full h-[48px] px-4 border border-[#E0E0E0] rounded-lg font-inter text-[14px] focus:outline-none focus:border-[#007036]"
              required
            >
              <option value="user">Utilisateur</option>
              <option value="moderator">Modérateur</option>
              <option value="admin">Administrateur</option>
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="font-inter font-medium text-[14px] text-[#000000] mb-2 block">
              Localisation
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full h-[48px] px-4 border border-[#E0E0E0] rounded-lg font-inter text-[14px] focus:outline-none focus:border-[#007036]"
            />
          </div>

          {/* Buttons */}
          <div className="flex flex-col md:flex-row items-center gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-[48px] border border-[#E0E0E0] rounded-lg font-inter font-medium text-[14px] text-[#000000] hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 h-[48px] bg-[#007036] rounded-lg font-inter font-medium text-[14px] text-white hover:bg-[#005528] transition-colors"
            >
              {mode === 'add' ? 'Ajouter' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
