"use client";

import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useGetAllThemesQuery } from "@/services/api/ThemeApi";
import { useGetAllCircuitsQuery } from "@/services/api/CircuitApi";
import { useGetAllPOIsQuery } from "@/services/api/PoiApi";
import { useRouter } from "@/i18n/navigation";
import ThemeCard from "./ThemeCard";
import ThemeFilterPills from "./ThemeFilterPills";

interface ThemesProps {
  locale: string;
  isRTL: boolean;
}

export default function Themes({ locale, isRTL }: ThemesProps) {
  const t = useTranslations();
  const router = useRouter();
  const { data: themesData, isLoading: themesLoading, error } = useGetAllThemesQuery();
  const { data: circuitsData, isLoading: circuitsLoading } = useGetAllCircuitsQuery();
  const { data: poisData, isLoading: poisLoading } = useGetAllPOIsQuery();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleSelectTheme = (id: string) => {
    router.push(`/themes/${id}`);
  };

  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
  };

  const themes = themesData?.data || [];
  const circuits = circuitsData?.data || [];
  const pois = poisData?.pois || [];

  // Memoize active themes
  const activeThemes = useMemo(() => {
    return themes.filter((t) => t.isActive);
  }, [themes]);

  // Build a map of theme IDs to their associated POI categories
  const themeCategories = useMemo(() => {
    const map = new Map<string, Set<string>>();
    
    circuits.forEach((circuit: any) => {
      if (circuit.themes && circuit.pois && circuit.pois.length > 0) {
        // Use the POIs directly from the circuit
        const circuitPOIs = circuit.pois;
        
        circuit.themes.forEach((theme: any) => {
          if (!map.has(theme.id)) {
            map.set(theme.id, new Set());
          }
          
          // Add each POI's category to this theme
          circuitPOIs.forEach((poi: any) => {
            if (poi.category) {
              map.get(theme.id)?.add(poi.category);
            }
          });
        });
      }
    });
    
    return map;
  }, [circuits]); // Removed 'pois' dependency since we use circuit.pois directly

  // Filter themes based on selected category
  // If no category is selected, show all active themes
  // If a category is selected, show themes that either:
  // 1. Have circuits with POIs in that category, OR
  // 2. Have no circuits yet (new themes should still be visible)
  const filteredThemes = !selectedCategory
    ? activeThemes
    : activeThemes.filter((theme) => {
        const categories = themeCategories.get(theme.id);
        // Show theme if it has the selected category OR if it has no categories yet
        return !categories || categories.size === 0 || categories.has(selectedCategory);
      });
  
  // Grille 2 colonnes pour tous les écrans

  const isLoading = themesLoading || circuitsLoading || poisLoading;

  return (
    <div className="py-8 md:py-12 lg:py-20 bg-white">
      <div className="max-w-[1440px] mx-auto px-[15px] md:px-4 sm:px-6 lg:px-16">
        {/* Header Section - Frame 64 & Frame 73 */}
        <div className="flex flex-col gap-4 md:gap-4 mb-8">
          {/* Title */}
          <div
            className={`flex items-center justify-between ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            <h2
              onClick={() => router.push("/themes")}
              className="text-3xl md:text-[55px] font-regular mb-2 text-gray-900 leading-tight uppercase font-noodle"
            >
              {t("exploreTheme.title")}
            </h2>
          </div>

          {/* Theme Filter Pills - Frame 67 */}
          <ThemeFilterPills 
            themes={activeThemes} 
            locale={locale} 
            onCategorySelect={handleCategorySelect}
          />
        </div>

        {/* Themes Grid 2xN (tous écrans) */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            <p className="text-gray-500 mt-4">Loading themes...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500">Error loading themes</p>
          </div>
        ) : themes.length > 0 ? (
          <>
            {filteredThemes.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No themes found for this category</p>
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="mt-4 px-6 py-2 bg-[#007036] text-white rounded-full hover:bg-[#005a2b] transition-colors"
                >
                  View all themes
                </button>
              </div>
            ) : (
              <div className={`grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-[13.27px] md:gap-4 ${isRTL ? "direction-rtl" : ""}`}>
                {filteredThemes.map((item) => (
                  <ThemeCard
                    key={item.id}
                    theme={item}
                    onSelect={handleSelectTheme}
                    currentLocale={locale}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No themes available</p>
          </div>
        )}
      </div>
    </div>
  );
}