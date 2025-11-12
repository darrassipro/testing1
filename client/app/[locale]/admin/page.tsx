import React from 'react';
import AdminDashboard from '@/components/admin/dashboard/AdminDashboard';

export default async function AdminHomePage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  // ✅ Await params in server component
  const { locale } = await params;

  return <AdminDashboard />;
}