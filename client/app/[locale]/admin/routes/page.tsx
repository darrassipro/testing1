"use client";

import React, { Suspense } from 'react';
import AllRoutesAdmin from '@/components/admin/routes/AllRoutesAdmin';
import { LoadingState } from '@/components/admin/shared/LoadingState';

interface RouteAdminPageProps {
  params: Promise<{
    locale: string;
  }>;
}

function RouteAdminContent({ locale }: { locale: string }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <AllRoutesAdmin />
    </div>
  );
}

export default function RouteAdminPage({ params }: RouteAdminPageProps) {
  const resolvedParams = React.use(params);
  const { locale } = resolvedParams;

  return (
    <Suspense fallback={<LoadingState message="Loading routes..." />}>
      <RouteAdminContent locale={locale} />
    </Suspense>
  );
}
