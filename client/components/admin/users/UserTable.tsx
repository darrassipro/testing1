'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Eye, Pencil, Ban, CheckCircle } from 'lucide-react';
import UserStatusBadge from './UserStatusBadge';
import Pagination from './Pagination';

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

interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onView: (user: User) => void;
  onSuspend: (userId: number) => void;
  onDelete: (userId: number) => void;
  statusFilter: 'all' | 'active' | 'suspended';
}

export default function UserTable({ 
  users, 
  onEdit, 
  onView, 
  onSuspend, 
  onDelete,
  statusFilter 
}: UserTableProps) {
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filter users based on status
  const filteredUsers = users.filter(user => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'active') return !user.isDeleted;
    if (statusFilter === 'suspended') return user.isDeleted;
    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  const toggleSelectAll = () => {
    if (selectedUsers.length === paginatedUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(paginatedUsers.map(user => user.id));
    }
  };

  const toggleSelectUser = (userId: number) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      user: 'Utilisateur',
      admin: 'Administrateur',
      moderator: 'Modérateur'
    };
    return labels[role] || role;
  };

  return (
    <div className="flex flex-col gap-4 transition-all duration-300">
      {/* Container */}
      <div className="w-full bg-white border border-[#EAEBEF] rounded-lg overflow-hidden shadow-sm transition-all duration-200">
        {/* Header - show only on md and above */}
        <div className="hidden md:flex h-16 border-b border-[#EAEBEF] px-6 items-center text-[#6E6D6D] bg-white transition-colors duration-200">
          <div className="flex items-center gap-4 w-1/3">
            <input
              type="checkbox"
              checked={selectedUsers.length === paginatedUsers.length && paginatedUsers.length > 0}
              onChange={toggleSelectAll}
              className="w-6 h-6 border border-[#E0E0E0] rounded cursor-pointer transition-all duration-200"
            />
            <span className="font-inter font-medium">Name</span>
          </div>
          <div className="w-1/6">Location</div>
          <div className="w-1/6">Inscrit le</div>
          <div className="w-1/6">Rôle</div>
          <div className="w-1/6">Status</div>
          <div className="w-1/12 text-right">Actions</div>
        </div>

        {/* Body */}
        <div className="flex flex-col">
          {paginatedUsers.map((user, index) => (
            <div key={user.id} className="border-b last:border-b-0 transition-all duration-200 hover:bg-gray-50">
              {/* Mobile card */}
              <div className="md:hidden p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden relative transition-transform duration-200 hover:scale-105">
                      {user.profileImage ? (
                        <Image src={user.profileImage} alt={`${user.firstName} ${user.lastName}`} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500 font-medium text-lg">{user.firstName[0]}{user.lastName[0]}</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-inter font-medium">{user.firstName} {user.lastName}</div>
                      <div className="text-sm text-[#747474]">{user.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => onView(user)} 
                      className="w-9 h-9 border-2 border-[#02355E] rounded-full flex items-center justify-center text-[#02355E] hover:bg-[#02355E] hover:text-white transition-all duration-200"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => onEdit(user)} 
                      className="w-9 h-9 border-2 border-[#EF4444] rounded-full flex items-center justify-center text-[#EF4444] hover:bg-[#EF4444] hover:text-white transition-all duration-200"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => onSuspend(user.id)} 
                      className="w-9 h-9 flex items-center justify-center hover:opacity-80 transition-all duration-200" 
                      title={user.isDeleted ? "Réactiver l'utilisateur" : "Suspendre l'utilisateur"}
                    >
                      {user.isDeleted ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <Ban className="w-4 h-4 text-red-600" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="text-[#000000]">{user.location || '-'}</div>
                  <div className="text-[#6E6D6D]">{formatDate(user.createdAt)}</div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm">{getRoleLabel(user.role)}</div>
                  <UserStatusBadge status={user.isDeleted ? 'suspended' : 'active'} />
                </div>
              </div>

              {/* Desktop row */}
              <div className="hidden md:flex items-center px-6 h-14">
                <div className="flex items-center gap-4 w-1/3">
                  <input 
                    type="checkbox" 
                    checked={selectedUsers.includes(user.id)} 
                    onChange={() => toggleSelectUser(user.id)} 
                    className="w-5 h-5 border rounded cursor-pointer transition-all duration-200" 
                  />
                  <div className="w-10 h-10 rounded-full overflow-hidden relative flex-shrink-0 transition-transform duration-200 hover:scale-105">
                    {user.profileImage ? (
                      <Image src={user.profileImage} alt={`${user.firstName} ${user.lastName}`} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500 font-medium text-lg">{user.firstName[0]}{user.lastName[0]}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-inter font-medium text-sm text-[#000]">{user.firstName} {user.lastName}</span>
                    <span className="text-sm text-[#747474]">{user.email}</span>
                  </div>
                </div>

                <div className="w-1/6 text-sm">{user.location || '-'}</div>
                <div className="w-1/6 text-sm text-[#6E6D6D]">{formatDate(user.createdAt)}</div>
                <div className="w-1/6 text-sm">{getRoleLabel(user.role)}</div>
                <div className="w-1/6"><UserStatusBadge status={user.isDeleted ? 'suspended' : 'active'} /></div>
                <div className="w-1/12 flex justify-end gap-3">
                  <button 
                    onClick={() => onView(user)} 
                    className="w-9 h-9 border-2 border-[#02355E] rounded-full flex items-center justify-center text-[#02355E] hover:bg-[#02355E] hover:text-white transition-all duration-200"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => onEdit(user)} 
                    className="w-9 h-9 border-2 border-[#EF4444] rounded-full flex items-center justify-center text-[#EF4444] hover:bg-[#EF4444] hover:text-white transition-all duration-200"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => onSuspend(user.id)} 
                    className="w-9 h-9 flex items-center justify-center hover:opacity-80 transition-all duration-200" 
                    title={user.isDeleted ? "Réactiver l'utilisateur" : "Suspendre l'utilisateur"}
                  >
                    {user.isDeleted ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <Ban className="w-4 h-4 text-red-600" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-end transition-all duration-200">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}
