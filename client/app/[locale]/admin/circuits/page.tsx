'use client';

import React from 'react';
import CircuitManagement from '@/components/admin/CircuitManagement';

interface CircuitsPageProps {
  params: Promise<{ locale: string }>;
}

export default function CircuitsPage({ params }: CircuitsPageProps) {
  // ✅ Use React.use() to unwrap Promise in client component
  const resolvedParams = React.use(params);
  const { locale } = resolvedParams;

  return <CircuitManagement locale={locale} />;
}
