'use client';

import { useState } from 'react';
import { Search, Plus, Calendar, Download } from 'lucide-react';
import UserTable from './users/UserTable';
import UserFormModal from './users/UserFormModal';
import UserViewModal from './users/UserViewModal';
import { toast } from 'react-hot-toast';
import { 
  useGetAllUsersQuery, 
  useUpdateUserMutation, 
  useSuspendUserMutation,
  useDeleteUserMutation,
  useCreateUserMutation
} from '@/services/api/UserApi';

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

export default function UserManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // RTK Query hooks
  const { data: usersData, isLoading } = useGetAllUsersQuery({});
  const [updateUser] = useUpdateUserMutation();
  const [suspendUser] = useSuspendUserMutation();
  const [deleteUser] = useDeleteUserMutation();
  const [createUser] = useCreateUserMutation();

  const users: User[] = usersData?.users || [];

  // Filter users based on search
  const filteredUsers = users.filter(user => {
    const searchLower = searchQuery.toLowerCase();
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    const email = user.email.toLowerCase();
    return fullName.includes(searchLower) || email.includes(searchLower);
  });

  const handleAddUser = () => {
    setModalMode('add');
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setModalMode('edit');
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const handleSuspendUser = async (userId: number) => {
    // Find the user to check their current status
    const user = users.find(u => u.id === userId);
    if (!user) return;

    try {
      await suspendUser(userId).unwrap();
      if (user.isDeleted) {
        toast.success('Utilisateur réactivé avec succès');
      } else {
        toast.success('Utilisateur suspendu avec succès');
      }
    } catch (error) {
      toast.error('Erreur lors de la modification de l\'utilisateur');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        await deleteUser(userId).unwrap();
        toast.success('Utilisateur supprimé avec succès');
      } catch (error) {
        toast.error('Erreur lors de la suppression de l\'utilisateur');
      }
    }
  };

  const handleFormSubmit = async (formData: UserFormData) => {
    try {
      if (modalMode === 'add') {
        // Create new user
        const userData = new FormData();
        userData.append('firstName', formData.firstName);
        userData.append('lastName', formData.lastName);
        userData.append('email', formData.email);
        if (formData.password) userData.append('password', formData.password);
        userData.append('role', formData.role);
        if (formData.location) userData.append('location', formData.location);
        if (formData.profileImage) userData.append('profileImage', formData.profileImage);

        await createUser(userData).unwrap();
        toast.success('Utilisateur créé avec succès');
      } else if (selectedUser) {
        // Update existing user
        const userData = new FormData();
        userData.append('firstName', formData.firstName);
        userData.append('lastName', formData.lastName);
        userData.append('email', formData.email);
        userData.append('role', formData.role);
        if (formData.location) userData.append('location', formData.location);
        // Include password only if it's provided (not empty)
        if (formData.password && formData.password.trim() !== '') {
          userData.append('password', formData.password);
        }
        if (formData.profileImage) userData.append('profileImage', formData.profileImage);

        await updateUser({ id: selectedUser.id, data: userData }).unwrap();
        toast.success('Utilisateur mis à jour avec succès');
      }
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde de l\'utilisateur');
    }
  };

  const handleExport = () => {
    // Implement export functionality (CSV, Excel, etc.)
    toast.success('Export en cours...');
  };

  if (isLoading) {
    return (
      <div className="relative w-full min-h-screen bg-[#FAFBFD] flex items-center justify-center">
        <div className="text-center animate-fadeIn">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#007036] mx-auto"></div>
          <p className="mt-4 text-[#6E6D6D] font-inter">Chargement des utilisateurs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-screen bg-[#FAFBFD]">
      {/* Main Content Container */}
      <div className="flex flex-col items-end gap-[32px] px-4 lg:px-[57px] pt-[106px] md:pt-[82px] sm:pt-[66px] pb-[48px] w-full">
        {/* Frame 1171278316 - Top Section with Title and Controls in Single Line */}
        <div className="w-full max-w-[1322.55px] flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
          {/* Title */}
          <h1 className="font-inter font-semibold text-[24px] leading-[29px] text-[#000000] whitespace-nowrap flex-shrink-0">
            Tous les utilisateurs
          </h1>

          {/* Frame 1000003559 - Controls Row - All in One Line */}
          <div className="w-full xl:w-auto flex flex-wrap xl:flex-nowrap items-center gap-[4px]">
            {/* Search Input */}
            <div className="relative w-full sm:w-[296px] h-[40px] flex-shrink-0">
              <div className="absolute inset-0 bg-white border border-[#E0E0E0] rounded-[8px]" />
              <div className="absolute left-[20px] top-1/2 -translate-y-1/2 w-[15px] h-[15px]">
                <div className="absolute w-[13.64px] h-[13.64px] border-[1.4px] border-[#6E6D6D] rounded-full left-0 top-0" />
                <div className="absolute w-[5.79px] h-0 border-[1.4px] border-[#6E6D6D] rotate-[-135deg] left-[10.5px] top-[10.5px]" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search"
                className="absolute inset-0 pl-[46px] pr-[20px] py-[12px] bg-transparent font-inter font-medium text-[14px] leading-[20px] text-[#6E6D6D] focus:outline-none rounded-[8px]"
              />
            </div>

            {/* Add User Button */}
            <button
              onClick={handleAddUser}
              className="flex items-center justify-center gap-[5.66px] w-full sm:w-auto sm:min-w-[190.83px] h-[39.32px] px-[13.59px] py-[5.66px] bg-[#007036] rounded-[8px] hover:bg-[#005528] transition-all duration-200 flex-shrink-0"
            >
              <Plus className="w-6 h-6 text-white" strokeWidth={2} />
              <span className="font-inter font-semibold text-[13.1348px] leading-[27px] text-white whitespace-nowrap">
                Ajouter un utilisateur
              </span>
            </button>

            {/* Date Range Picker */}
            <button className="hidden lg:flex items-center justify-center gap-[5.66px] w-auto min-w-[227.48px] h-[39.32px] px-[13.59px] py-[5.66px] bg-white border-[0.679339px] border-[#D9D9D9] rounded-[6px] hover:bg-gray-50 transition-all duration-200 flex-shrink-0">
              <span className="font-inter font-semibold text-[13.1348px] leading-[27px] text-[#1F1F1F] whitespace-nowrap">
                06 Oct 2025 - 07 Oct 2025
              </span>
              <Calendar className="w-[22.64px] h-[22.64px] text-[#1F1F1F]" />
            </button>

            {/* Last 30 Days */}
            <button className="hidden lg:flex items-center justify-center gap-[5.66px] w-auto min-w-[137.48px] h-[39.32px] px-[13.59px] py-[5.66px] bg-white border-[0.679339px] border-[#D9D9D9] rounded-[6px] hover:bg-gray-50 transition-all duration-200 flex-shrink-0">
              <span className="font-inter font-semibold text-[13.1348px] leading-[27px] text-[#1F1F1F] whitespace-nowrap">
                Last 30 days
              </span>
              <Calendar className="w-[22.64px] h-[22.64px] text-[#1F1F1F]" />
            </button>

            {/* Export Button */}
            <button
              onClick={handleExport}
              className="flex items-center justify-center gap-[5.62px] w-auto min-w-[91.31px] h-[39.23px] px-[13.48px] py-[5.62px] bg-white border-[0.674057px] border-[#D9D9D9] rounded-[6px] hover:bg-gray-50 transition-all duration-200 flex-shrink-0"
            >
              <Download className="w-[15.73px] h-[15.73px] text-[#1F1F1F]" strokeWidth={1.12} />
              <span className="font-inter font-semibold text-[13.1348px] leading-[27px] text-[#1F1F1F] whitespace-nowrap">
                Export
              </span>
            </button>
          </div>
        </div>

        {/* Frame 1171278319 - Table Container Section */}
        <div className="w-full max-w-[1322.55px] flex flex-col items-start gap-[16px]">
          {/* Frame 1000002628 - Status Filter Tabs */}
          <div className="flex items-center px-[23px] gap-[5.49px] w-auto h-[51px] bg-white border border-[#EEEEEE] rounded-[120px] transition-all duration-200">
            <button
              onClick={() => setStatusFilter('all')}
              className={`flex items-center justify-center px-[26.08px] py-[17px] h-[51px] transition-all duration-200 ${
                statusFilter === 'all' ? 'border-b-[3.5px] border-[#007036]' : ''
              }`}
            >
              <span
                className={`font-inter font-medium text-[16.47px] leading-[150%] transition-colors duration-200 ${
                  statusFilter === 'all' ? 'text-[#007036]' : 'text-[#000000]'
                }`}
              >
                All
              </span>
            </button>

            <button
              onClick={() => setStatusFilter('active')}
              className={`flex items-center justify-center px-[26.08px] py-[15.56px] rounded-[7.78px] h-[46.67px] transition-all duration-200 ${
                statusFilter === 'active' ? 'bg-gray-100' : 'hover:bg-gray-50'
              }`}
            >
              <span
                className={`font-inter font-medium text-[16.47px] leading-[150%] transition-colors duration-200 ${
                  statusFilter === 'active' ? 'text-[#007036]' : 'text-[#000000]'
                }`}
              >
                Active
              </span>
            </button>

            <button
              onClick={() => setStatusFilter('suspended')}
              className={`flex items-center justify-center px-[26.08px] py-[15.56px] rounded-[7.78px] h-[46.67px] transition-all duration-200 ${
                statusFilter === 'suspended' ? 'bg-gray-100' : 'hover:bg-gray-50'
              }`}
            >
              <span
                className={`font-inter font-medium text-[16.47px] leading-[150%] transition-colors duration-200 ${
                  statusFilter === 'suspended' ? 'text-[#007036]' : 'text-[#000000]'
                }`}
              >
                Suspended
              </span>
            </button>
          </div>

          {/* User Table */}
          <div className="w-full">
            <UserTable
              users={filteredUsers}
              onEdit={handleEditUser}
              onView={handleViewUser}
              onSuspend={handleSuspendUser}
              onDelete={handleDeleteUser}
              statusFilter={statusFilter}
            />
          </div>
        </div>
      </div>

      {/* User Form Modal */}
      <UserFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        user={selectedUser}
        mode={modalMode}
      />

      {/* User View Modal */}
      <UserViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        user={selectedUser}
      />
    </div>
  );
}
