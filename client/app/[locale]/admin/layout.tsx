'use client';

import React from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminFooter from '@/components/admin/AdminFooter';

export default function AdminLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // ✅ Use React.use() in client components
  const resolvedParams = React.use(params);
  const { locale } = resolvedParams;

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
