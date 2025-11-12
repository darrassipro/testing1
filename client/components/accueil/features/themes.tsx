"use client";

import React, { useRef, useState, useMemo } from "react";
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
  
  // Limit to 6 themes on mobile, all on desktop
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const displayThemes = isMobile ? filteredThemes.slice(0, 6) : filteredThemes;

  const scrollRef1 = useRef<HTMLDivElement>(null);
  const scrollRef2 = useRef<HTMLDivElement>(null);

  const scrollAmount = 437; // Card width (416px) + gap (21px)
  const handleScroll = (direction: "left" | "right") => {
    // Scroll both rows simultaneously
    const scrollRefs = [scrollRef1, scrollRef2];
    
    scrollRefs.forEach((ref) => {
      if (!ref.current) return;
      const { scrollLeft } = ref.current;

      if (direction === "left") {
        ref.current.scrollTo({
          left: isRTL ? scrollLeft + scrollAmount : scrollLeft - scrollAmount,
          behavior: "smooth",
        });
      } else {
        ref.current.scrollTo({
          left: isRTL ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
          behavior: "smooth",
        });
      }
    });
  };

  // Show navigation buttons only if there are more than 3 themes
  const showNavigation = filteredThemes.length > 3;

  const isLoading = themesLoading || circuitsLoading || poisLoading;

  return (
    <div className="py-8 md:py-12 lg:py-20 bg-white">
      <div className="max-w-[1440px] mx-auto px-[15px] md:px-4 sm:px-6 lg:px-16">
        {/* Header Section - Frame 64 & Frame 73 */}
        <div className="flex flex-col gap-4 md:gap-4 mb-8">
          {/* Title and Navigation Buttons */}
          <div
            className={`flex items-center justify-between ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            <h2
              onClick={() => router.push("/themes")}
              className="font-['BigNoodleTitling'] text-3xl md:text-[40px] font-semibold text-black cursor-pointer hover:text-[#007036] transition-colors"
            >
              {t("exploreTheme.title")}
            </h2>

            {/* Navigation Buttons - Frame 72 - Hidden on mobile */}
            {showNavigation && (
              <div className={`hidden md:flex gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                <button
                  onClick={() => handleScroll("left")}
                  className="w-[60px] h-[60px] bg-white border border-[#D9D9D9] flex items-center justify-center hover:bg-gray-50 transition"
                  style={{ borderRadius: "20px 0px" }}
                  aria-label="Previous"
                >
                  <ChevronLeft size={24} className={isRTL ? "rotate-180" : ""} />
                </button>
                <button
                  onClick={() => handleScroll("right")}
                  className="w-[60px] h-[60px] bg-white border border-[#D9D9D9] flex items-center justify-center hover:bg-gray-50 transition"
                  style={{
                    borderRadius: "0px 20px",
                    transform: "matrix(-1, 0, 0, 1, 0, 0)",
                  }}
                  aria-label="Next"
                >
                  <ChevronRight
                    size={24}
                    className={isRTL ? "" : ""}
                    style={{ transform: "matrix(-1, 0, 0, 1, 0, 0)" }}
                  />
                </button>
              </div>
            )}
          </div>

          {/* Theme Filter Pills - Frame 67 */}
          <ThemeFilterPills 
            themes={activeThemes} 
            locale={locale} 
            onCategorySelect={handleCategorySelect}
          />
        </div>

        {/* Themes Grid - Frame 1000003124 */}
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
            {displayThemes.length === 0 ? (
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
              <div className="flex flex-col md:flex-row gap-[13.27px] md:gap-4">
                {/* Mobile: Single column, max 6 themes */}
                <div className="md:hidden flex flex-col gap-[17.42px] w-full">
                  {displayThemes.map((item) => (
                    <ThemeCard
                      key={item.id}
                      theme={item}
                      onSelect={handleSelectTheme}
                      currentLocale={locale}
                    />
                  ))}
                </div>

                {/* Desktop: Two-row grid */}
                <div className="hidden md:flex md:flex-col md:gap-4 w-full">
                  {/* First Row - Frame 1000003123 */}
                  <div
                    ref={scrollRef1}
                    className={`flex gap-[21px] overflow-x-auto scrollbar-hide scroll-smooth pb-4 ${
                      isRTL ? "flex-row-reverse" : ""
                    }`}
                  >
                    {displayThemes
                      .slice(0, 8)
                      .map((item) => (
                        <ThemeCard
                          key={item.id}
                          theme={item}
                          onSelect={handleSelectTheme}
                          currentLocale={locale}
                        />
                      ))}
                  </div>

                  {/* Second Row - Frame 1000003125 */}
                  {/* {displayThemes.length > 3 && (
                    <div
                      ref={scrollRef2}
                      className={`flex gap-[21px] overflow-x-auto scrollbar-hide scroll-smooth pb-4 ${
                        isRTL ? "flex-row-reverse" : ""
                      }`}
                    >
                      {displayThemes
                        .slice(3,6)
                        .map((item) => (
                          <ThemeCard
                            key={item.id}
                            theme={item}
                            onSelect={handleSelectTheme}
                            currentLocale={locale}
                          />
                        ))}
                    </div>
                  )} */}
                </div>
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