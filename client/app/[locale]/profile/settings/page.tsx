'use client';

import React, { useState, useRef, Suspense } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/lib/store';
import { logOut, updateUser } from '@/services/slices/authSlice';
import { toast } from 'sonner';
import { User, Settings, Gift, Monitor, LogOut, Upload } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SERVER_GATEWAY_DOMAIN } from '@/services/BaseQuery';

interface ProfileSettingsPageProps {
  params: Promise<{
    locale: string;
  }>;
}

type TabType = 'personal' | 'rewards' | 'display' | 'logout';

function ProfileSettingsContent({ locale }: { locale: string }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, token } = useSelector((state: RootState) => state.auth);
  
  const [activeTab, setActiveTab] = useState<TabType>('personal');
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(user?.profileImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    password: '',
    role: user?.role || 'user',
  });

  // Redirect if not logged in
  React.useEffect(() => {
    if (!user || !token) {
      router.push(`/${locale}/login`);
    }
  }, [user, token, locale, router]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    try {
      setIsLoading(true);
      
      // Create FormData
      const formData = new FormData();
      formData.append('profileImage', file);

      // Upload image
      const response = await fetch(`${SERVER_GATEWAY_DOMAIN}/api/users/profile/image`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Upload error:', errorData);
        throw new Error(errorData.message || 'Failed to upload image');
      }

      const data = await response.json();
      console.log('Upload response:', data);
      
      if (data.success && data.data) {
        const newProfileImage = data.data.profileImage;
        setProfileImage(newProfileImage);
        
        // Update user in Redux store
        dispatch(updateUser({ profileImage: newProfileImage }));
        
        toast.success('Profile image updated successfully');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error(error.message || 'Failed to upload profile image');
    } finally {
      setIsLoading(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const updateData: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
      };

      // Only include password if it's been changed
      if (formData.password) {
        updateData.password = formData.password;
      }

      const response = await fetch(`${SERVER_GATEWAY_DOMAIN}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        // Update user in Redux store
        dispatch(updateUser(data.data));
        toast.success('Profile updated successfully');
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(logOut());
    router.push(`/${locale}/login`);
    toast.success('Logged out successfully');
  };

  if (!user) return null;

  return (
    <div className="relative w-full min-h-screen bg-[#FAFBFD]">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 h-[104px] bg-white border-b border-[#E0E0E0]">
        {/* Logo */}
        <div className="absolute left-[57px] top-[33px] flex items-center gap-2">
          <div className="w-9 h-10 relative">
            <Image 
              src="/images/logo.png" 
              alt="GO FEZ Logo" 
              fill
              className="object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          <h1 className="font-semibold text-base text-[#007036]">CONTROL PANEL</h1>
        </div>

        {/* Navigation */}
        <nav className="absolute left-1/2 top-10 -translate-x-1/2 flex items-center gap-7">
          <button className="flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-[#1B1B1B]" />
            <span className="font-medium text-sm text-[#1B1B1B]">Dashboard</span>
          </button>
          <button className="flex items-center gap-2.5">
            <User className="w-6 h-6 text-[#1B1B1B]" />
            <span className="font-medium text-sm text-[#1B1B1B]">Utilisateurs</span>
          </button>
          <button className="flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-[#1B1B1B]" />
            <span className="font-medium text-sm text-[#1B1B1B]">Thèmes</span>
          </button>
          <button className="flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-[#1B1B1B]" />
            <span className="font-medium text-sm text-[#1B1B1B]">Circuits</span>
          </button>
          <button className="flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-[#1B1B1B]" />
            <span className="font-medium text-sm text-[#1B1B1B]">POIs</span>
          </button>
          <button className="flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-[#1B1B1B]" />
            <span className="font-medium text-sm text-[#1B1B1B]">Partners</span>
          </button>
        </nav>

        {/* User Actions */}
        <div className="absolute right-[60px] top-[27px] flex items-center gap-4">
          <button className="w-6 h-6">
            <Settings className="w-full h-full text-black" />
          </button>
          <div className="w-9 h-9 rounded-full bg-gray-300 overflow-hidden">
            {profileImage ? (
              <Image src={profileImage} alt="Profile" width={37} height={37} className="object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold">
                {user?.firstName?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
          </div>
          <button 
            onClick={() => router.push(`/${locale}/admin`)}
            className="flex items-center justify-center gap-2.5 px-8 py-3 bg-gradient-to-r from-[#02355E] to-[#004780] rounded-xl"
          >
            <Settings className="w-6 h-6 text-white" />
            <span className="font-bold text-sm text-white">Cities</span>
          </button>
        </div>

        {/* Dividers */}
        <div className="absolute left-[274px] top-0 w-px h-[104px] bg-[#E0E0E0]" />
        <div className="absolute left-[1104px] top-0 w-px h-[104px] bg-[#E0E0E0]" />
      </div>

      {/* Main Content */}
      <div className="pt-[153px] px-[57px]">
        <h2 className="font-semibold text-2xl text-black mb-6">Paramètres généraux</h2>

        <div className="flex gap-5">
          {/* Sidebar */}
          <div className="w-[378px] h-[287px] bg-white border border-[#EAEBEF] rounded-[19px] p-9">
            <div className="flex flex-col gap-8">
              <button
                onClick={() => setActiveTab('personal')}
                className={`flex items-center gap-3 ${activeTab === 'personal' ? 'text-[#008A50]' : 'text-[#1B1B1B]'}`}
              >
                <User className="w-7 h-7" strokeWidth={2.33} />
                <span className={`font-${activeTab === 'personal' ? 'bold' : 'medium'} text-base`}>
                  Personal informations
                </span>
              </button>

              <button
                onClick={() => setActiveTab('rewards')}
                className={`flex items-center gap-3 ${activeTab === 'rewards' ? 'text-[#008A50]' : 'text-[#1B1B1B]'}`}
              >
                <Gift className="w-7 h-7" strokeWidth={2.33} />
                <span className="font-medium text-base">
                  Paramètres de points et récompenses
                </span>
              </button>

              <button
                onClick={() => setActiveTab('display')}
                className={`flex items-center gap-3 ${activeTab === 'display' ? 'text-[#008A50]' : 'text-[#1B1B1B]'}`}
              >
                <Monitor className="w-7 h-7" strokeWidth={2.33} />
                <span className="font-medium text-base">
                  Paramètres d'affichage
                </span>
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 text-[#1B1B1B]"
              >
                <LogOut className="w-7 h-7" strokeWidth={2.33} />
                <span className="font-medium text-base">Déconnexion</span>
              </button>
            </div>
          </div>

          {/* Main Form */}
          <div className="flex-1 bg-white border border-[#EAEBEF] rounded-[19px] p-9">
            {activeTab === 'personal' && (
              <form onSubmit={handleSubmit} className="flex flex-col gap-[85px]">
                <div className="flex flex-col gap-14">
                  {/* Profile Image */}
                  <div className="relative w-[113px] h-[108px]">
                    <div className="w-[108px] h-[108px] rounded-full bg-gray-300 overflow-hidden">
                      {profileImage ? (
                        <Image 
                          src={profileImage} 
                          alt="Profile" 
                          width={108} 
                          height={108} 
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-3xl">
                          {user?.firstName?.[0]?.toUpperCase() || 'U'}
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 w-8 h-8 bg-white border border-[#EEEEEE] rounded-full flex items-center justify-center"
                    >
                      <Upload className="w-5 h-5 text-black" strokeWidth={1.68} />
                    </button>
                  </div>

                  {/* Name and Email Row */}
                  <div className="flex gap-8">
                    <div className="flex-1 flex flex-col gap-4">
                      <label className="font-medium text-sm text-[#7E7E7E]">Nom</label>
                      <Input
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        placeholder="Wilson"
                        className="h-[60px] px-5 rounded-[14px] border-[#E0E0E0] text-sm text-[#7E7E7E]"
                      />
                    </div>
                    <div className="flex-1 flex flex-col gap-4">
                      <label className="font-medium text-sm text-[#7E7E7E]">Email</label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="email@example.com"
                        className="h-[60px] px-5 rounded-[14px] border-[#E0E0E0] text-sm text-[#7E7E7E]"
                      />
                    </div>
                  </div>

                  {/* Password and Role Row */}
                  <div className="flex gap-8">
                    <div className="flex-1 flex flex-col gap-4">
                      <label className="font-medium text-sm text-[#7E7E7E]">Mot de pass</label>
                      <div className="relative">
                        <Input
                          type="password"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          placeholder="••••••••"
                          className="h-[60px] px-5 rounded-[14px] border-[#E0E0E0] text-sm text-[#7E7E7E]"
                        />
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col gap-4">
                      <label className="font-medium text-sm text-[#7E7E7E]">Role</label>
                      <div className="relative h-[60px] px-5 rounded-[14px] border border-[#E0E0E0] flex items-center bg-white">
                        <span className="text-sm text-[#7E7E7E] capitalize">{formData.role}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-4 justify-end">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="font-semibold text-sm text-[#6A6A6A]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center justify-center px-8 py-3 bg-gradient-to-r from-[#02355E] to-[#004780] rounded-xl font-bold text-sm text-white disabled:opacity-50"
                  >
                    {isLoading ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'rewards' && (
              <div className="text-center py-20">
                <Gift className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">Paramètres de points et récompenses - Coming soon</p>
              </div>
            )}

            {activeTab === 'display' && (
              <div className="text-center py-20">
                <Monitor className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">Paramètres d'affichage - Coming soon</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfileSettingsPage({ params }: ProfileSettingsPageProps) {
  const resolvedParams = React.use(params);
  const { locale } = resolvedParams;

  return (
    <Suspense fallback={
      <div className="relative w-full min-h-screen bg-[#FAFBFD] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#007036] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <ProfileSettingsContent locale={locale} />
    </Suspense>
  );
}
