'use client';

import React from 'react';
import CityManagement from '@/components/admin/CityManagement';

interface CitiesPageProps {
  params: Promise<{ locale: string }>;
}

export default function CitiesPage({ params }: CitiesPageProps) {
  // ✅ Use React.use() to unwrap Promise in client component
  const resolvedParams = React.use(params);
  const { locale } = resolvedParams;

  return <CityManagement locale={locale} />;
}
