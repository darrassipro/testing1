// LOCATION: components/admin/AdminHeader.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { MapPin, Route, Palette, Folder, Globe, LogOut, Brain, Settings, User, LayoutDashboard, Menu, X, Navigation, MessageSquare } from 'lucide-react';
import Image from 'next/image';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/lib/store';
import { logOut } from '@/services/slices/authSlice';
import { toast } from 'sonner';

interface AdminHeaderProps {
  locale?: string;
}

export default function AdminHeader({ locale = 'fr' }: AdminHeaderProps) {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);

    // Track if component is mounted on client
    const [mounted, setMounted] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    
    useEffect(() => {
      setMounted(true);
    }, []);

    // Close mobile menu when pathname changes
    useEffect(() => {
      setMobileMenuOpen(false);
    }, [pathname]);

  const navItems = [
    { href: `/${locale}/admin`, label: 'Dashboard', icon: LayoutDashboard },
    { href: `/${locale}/admin/users`, label: 'Utilisateurs', icon: User },
    { href: `/${locale}/admin/pois`, label: 'POIs', icon: MapPin },
    { href: `/${locale}/admin/circuits`, label: 'Circuits', icon: Route },
    { href: `/${locale}/admin/routes`, label: 'Routes', icon: Navigation },
    { href: `/${locale}/admin/themes`, label: 'Thèmes', icon: Palette },
    { href: `/${locale}/admin/categories`, label: 'Catégories', icon: Folder },
    { href: `/${locale}/admin/reviews`, label: 'Avis', icon: MessageSquare },
    { href: `/${locale}/admin/ia-models`, label: 'AI Models', icon: Brain }
  ];

  const handleLogout = () => {
    dispatch(logOut());
    toast.success('Logged out successfully');
    router.push(`/${locale}`);
  };

  return (
    <header className="bg-white border-b border-[#E0E0E0] sticky top-0 z-50 h-[104px] md:h-[80px] sm:h-[64px]">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center flex-shrink-0" aria-label="Go to homepage">
            <div className="relative w-[80px] h-[80px] md:w-[100px] md:h-[100px] lg:w-[120px] lg:h-[120px]">
              <Image 
                src="/images/controlpanel.png" 
                alt="Go Fez Admin" 
                fill
                quality={70}
                className="object-contain"
                priority
              />
            </div>
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden w-10 h-10 flex items-center justify-center text-[#1B1B1B] hover:text-[#007036] transition-colors"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Navigation Links - Desktop */}
          <nav className="hidden lg:flex items-center gap-[29px]">
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex flex-row justify-center items-center px-[6px] py-[11px] gap-[10px] relative transition-colors ${
                    isActive
                      ? 'text-[#007036] border-b-2 border-[#007036]'
                      : 'text-[#1B1B1B] hover:text-[#007036]'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                  <span className="font-bold text-[14px] leading-[17px] text-center">{label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Side - Cities, Settings & Profile Icons - Desktop */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Settings Button - Transparent with border */}
            <Link 
              href={`/${locale}/admin/settings`}
              className="w-10 h-10 rounded-full border-2 border-[#003285] flex items-center justify-center hover:bg-[#003285] hover:text-white transition-colors group"
            >
              <Settings className="w-5 h-5 text-[#003285] group-hover:text-white" />
            </Link>
            
            {/* Profile Menu */}
            <div className="relative">
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="w-10 h-10 rounded-full bg-[#003285] flex items-center justify-center hover:bg-[#002266] transition-colors"
              >
                <User className="w-5 h-5 text-white" />
              </button>
              
              {/* Dropdown Menu */}
              {showProfileMenu && mounted && user && (
                <>
                  {/* Backdrop to close menu when clicking outside */}
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowProfileMenu(false)}
                  />
                  
                  {/* Menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-[#E0E0E0] z-20 overflow-hidden">
                    <div className="px-4 py-3 border-b border-[#E0E0E0]">
                      <p className="text-sm font-medium text-[#353535]">{(user as any).fullname || user.email}</p>
                      <p className="text-xs text-[#6E6E6E] truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setShowProfileMenu(false);
                      }}
                      className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 transition flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Cities Button - Blue Background */}
            <Link 
              href={`/${locale}/admin/cities`}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[15px] font-medium transition-colors ${
                pathname === `/${locale}/admin/cities`
                  ? 'bg-[#003285] text-white'
                  : 'bg-[#003285] text-white hover:bg-[#002266]'
              }`}
            >
              <Globe className="w-5 h-5" />
              <span>Cities</span>
            </Link>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute left-0 right-0 top-[64px] sm:top-[64px] md:top-[80px] bg-white border-b border-[#E0E0E0] shadow-lg z-40">
            <nav className="flex flex-col py-2">
              {navItems.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center px-6 py-4 gap-3 transition-colors ${
                      isActive
                        ? 'bg-[#F0F7F4] text-[#007036] border-l-4 border-[#007036]'
                        : 'text-[#1B1B1B] hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium text-[15px]">{label}</span>
                  </Link>
                );
              })}
              
              {/* Mobile - Cities Link */}
              <Link
                href={`/${locale}/admin/cities`}
                className={`flex items-center px-6 py-4 gap-3 transition-colors ${
                  pathname === `/${locale}/admin/cities`
                    ? 'bg-[#F0F7F4] text-[#007036] border-l-4 border-[#007036]'
                    : 'text-[#1B1B1B] hover:bg-gray-50'
                }`}
              >
                <Globe className="w-5 h-5" />
                <span className="font-medium text-[15px]">Cities</span>
              </Link>

              {/* Mobile - Settings Link */}
              <Link
                href={`/${locale}/admin/settings`}
                className={`flex items-center px-6 py-4 gap-3 transition-colors ${
                  pathname === `/${locale}/admin/settings`
                    ? 'bg-[#F0F7F4] text-[#007036] border-l-4 border-[#007036]'
                    : 'text-[#1B1B1B] hover:bg-gray-50'
                }`}
              >
                <Settings className="w-5 h-5" />
                <span className="font-medium text-[15px]">Settings</span>
              </Link>

              {/* Mobile - User Info & Logout */}
              {mounted && user && (
                <div className="border-t border-[#E0E0E0] mt-2 pt-2">
                  <div className="px-6 py-3">
                    <p className="text-sm font-medium text-[#353535]">{user.fullname || user.email}</p>
                    <p className="text-xs text-[#6E6E6E] truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-6 py-4 gap-3 text-red-600 hover:bg-red-50 transition"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium text-[15px]">Logout</span>
                  </button>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}