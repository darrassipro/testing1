import React from 'react';
import { IAModelManagement } from '@/components/admin/ia-models';

export default async function IAModelsPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params;

  return (
    <section className="space-y-6">
      <IAModelManagement />
    </section>
  );
}
