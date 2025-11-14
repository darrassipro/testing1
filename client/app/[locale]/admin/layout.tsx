'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminFooter from '@/components/admin/AdminFooter';
import { LoadingState } from '@/components/admin/shared/LoadingState';
// Import the action to open the login modal
import { openLoginModal } from '@/services/slices/authSlice';

export default function AdminLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const resolvedParams = React.use(params);
  const { locale } = resolvedParams;
  
  const router = useRouter();
  const dispatch = useDispatch();
  
  // Get user auth state from Redux
  const { user } = useSelector((state: any) => state.auth);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Check if user exists and has admin role
    if (!user || user.role !== 'admin') {
      // 1. Redirect unauthorized users to the homepage
      router.replace(`/${locale}`);
      
      // 2. Trigger the login modal to open (using Redux action)
      dispatch(openLoginModal());
    } else {
      // Grant access
      setIsAuthorized(true);
    }
  }, [user, router, locale, dispatch]);

  // Show loading state while checking permissions
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <LoadingState message="Checking access permissions..." />
      </div>
    );
  }

  // Render Admin Layout if authorized
  return (
    <div className="min-h-screen bg-white">
      <AdminHeader locale={locale} />
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <AdminFooter />
    </div>
  );
}