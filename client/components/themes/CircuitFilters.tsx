// client/components/themes/CircuitFilters.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useDebounce } from '@/hooks/useDebounce';
import { GetCircuitsFilters } from '@/services/api/ThemeApi';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CircuitFiltersProps {
  onFilterChange: (filters: GetCircuitsFilters) => void;
}

const CircuitFilters: React.FC<CircuitFiltersProps> = ({ onFilterChange }) => {
  const t = useTranslations('ThemePage');

  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'popular' | 'newest'>('newest');
  const [maxDistance, setMaxDistance] = useState<number>(0); // 0 represents "All distances"
  
  // ✅ FIX 1: Initialize with "all" instead of "" to avoid the Select error
  const [transportMode, setTransportMode] = useState<string>('all');

  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    onFilterChange({
      search: debouncedSearch || undefined,
      sortBy: sortBy,
      maxDistance: maxDistance > 0 ? maxDistance : undefined,
      // ✅ FIX 2: Convert 'all' back to undefined for the API query
      transportMode: transportMode === 'all' ? undefined : transportMode,
    });
  }, [debouncedSearch, sortBy, maxDistance, transportMode, onFilterChange]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 bg-gray-50 rounded-lg border">
      {/* Search */}
      <Input
        placeholder={t('searchPlaceholder')}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="lg:col-span-2 bg-white"
      />

      {/* Sort By */}
      <Select onValueChange={(value: any) => setSortBy(value)} defaultValue="newest">
        <SelectTrigger className="bg-white">
          <SelectValue placeholder="Trier par" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Le plus récent</SelectItem>
          <SelectItem value="popular">Le plus populaire</SelectItem>
        </SelectContent>
      </Select>

      {/* Distance */}
      <Select onValueChange={(value: any) => setMaxDistance(Number(value))} defaultValue="0">
        <SelectTrigger className="bg-white">
          <SelectValue placeholder="Distance" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="0">Toute distance</SelectItem>
          <SelectItem value="2">&lt; 2 km</SelectItem>
          <SelectItem value="5">&lt; 5 km</SelectItem>
        </SelectContent>
      </Select>
      
      {/* Transport Mode */}
      {/* ✅ FIX 3: Set defaultValue to "all" */}
      <Select onValueChange={(value: any) => setTransportMode(value)} defaultValue="all">
        <SelectTrigger className="bg-white">
          <SelectValue placeholder="Mode" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous modes</SelectItem>
          <SelectItem value="walking">À pied (Walking)</SelectItem>
          <SelectItem value="driving">En voiture</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default CircuitFilters;