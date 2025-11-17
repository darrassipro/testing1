"use client";

import React, { Suspense } from 'react';
import RouteDetail from '@/components/admin/routes/RouteDetail';
import { LoadingState } from '@/components/admin/shared/LoadingState';

interface RouteDetailPageProps {
  params: Promise<{
    locale: string;
    id: string;
  }>;
}

function RouteDetailContent({ id }: { id: string }) {
  return <RouteDetail routeId={id} />;
}

export default function RouteDetailPage({ params }: RouteDetailPageProps) {
  const resolvedParams = React.use(params);
  const { id } = resolvedParams;

  return (
    <Suspense fallback={<LoadingState message="Loading route details..." />}>
      <RouteDetailContent id={id} />
    </Suspense>
  );
}
