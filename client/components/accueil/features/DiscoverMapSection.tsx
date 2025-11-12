"use client";

import React, { useRef, useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import { Search, MapPin, Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { useGetAllPOIsQuery } from "@/services/api/PoiApi";
import { useGetAllCategoriesQuery } from "@/services/api/CategoryApi";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { POI } from "@/services/api/PoiApi";

// Dynamically import Map to avoid SSR issues
const InteractiveMap = dynamic<{
  pois: POI[];
  userLocation: { lat: number; lng: number };
  locale: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}>(
  () => import("./InteractiveMap").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[680px] bg-gray-200 rounded-[38px] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#007036]"></div>
          <p className="text-gray-500 mt-4">Loading map...</p>
        </div>
      </div>
    ),
  }
);

interface DiscoverMapSectionProps {
  locale: string;
  isRTL: boolean;
}

interface CategoryFilter {
  id: string;
  name: string;
  icon?: string;
}

export default function DiscoverMapSection({ locale, isRTL }: DiscoverMapSectionProps) {
  const t = useTranslations();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Fetch POIs and categories
  const { data: poisData, isLoading: poisLoading } = useGetAllPOIsQuery();
  const { data: categoriesData, isLoading: categoriesLoading } = useGetAllCategoriesQuery();

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.log("Location access denied:", error);
          // Fallback to Fez center
          setUserLocation({ lat: 34.0331, lng: -4.9998 });
        }
      );
    } else {
      // Fallback to Fez center
      setUserLocation({ lat: 34.0331, lng: -4.9998 });
    }
  }, []);

  const pois = poisData?.pois || [];
  const categories = categoriesData?.data || [];

  const categoryFilters: CategoryFilter[] = useMemo(() => {
    return categories
      .filter((cat) => cat.isActive)
      .slice(0, 5)
      .map((cat) => {
        let name = "Category";

        try {
            // 1. Get the raw data dynamically based on locale ('fr', 'en', 'ar')
            let locData = (cat as any)[locale];

            // 2. CRITICAL: Check if it's a string and parse it
            if (typeof locData === 'string') {
                locData = JSON.parse(locData);
            }

            // 3. Extract the name
            if (locData && locData.name) {
                name = locData.name;
            }
        } catch (e) {
            console.error("Error parsing category name in DiscoverMapSection:", e);
        }

        return {
          id: cat.id,
          name: name,
          icon: cat.icon,
        };
      });
  }, [categories, locale]);


  // Filter POIs based on search and category
  const filteredPois = useMemo(() => {
    let result = pois.filter((poi) => poi.isActive);

    // Filter by category
    if (selectedCategory) {
      result = result.filter((poi) => poi.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((poi) => {
        const localizedData = poi[`${locale}Localization` as keyof typeof poi] as any;
        const name = localizedData?.name || "";
        return name.toLowerCase().includes(query);
      });
    }

    return result;
  }, [pois, selectedCategory, searchQuery, locale]);

  const isLoading = poisLoading || categoriesLoading;

  return (
    <div className="py-8 md:py-12 lg:py-20 bg-white">
      <div className="max-w-[1440px] mx-auto px-[15px] md:px-4 sm:px-6 lg:px-[70px]">
        {/* Header Section  */}
        <div className="flex flex-col gap-4 mb-8">
          {/* Title */}
          <h2
            className="font-['BigNoodleTitling'] text-4xl md:text-[64px] font-normal leading-[71px] text-black text-left md:text-center"
            style={{ fontWeight: 400 }}
          >
            {t("discoverMap.title") || "Discover Fez in Real Time"}
          </h2>

{/* Category Pills */}
<div className={`flex flex-wrap gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
  {categoryFilters.map((category) => {
    const isSelected = selectedCategory === category.id;

    return (
      <button
        key={category.id}
        onClick={() =>
          setSelectedCategory(isSelected ? null : category.id)
        }
        className={cn(
          "flex items-center justify-center gap-3 px-[18px] py-[18px] h-[61px] border rounded-[145.588px] transition-all",
          isSelected
            ? "bg-[#007036] border-[#007036] text-white hover:bg-[#005a2b]" // Selected: Darker green on hover
            : "bg-white border-[#D9D9D9] text-black hover:bg-gray-50"       // Not Selected: Gray on hover
        )}
      >
        {category.icon && (
          <img
            src={category.icon}
            alt={category.name}
            className={cn(
              "w-6 h-6 object-contain transition-all",
              // Invert icon color to white when selected
              isSelected && "brightness-0 invert"
            )}
          />
        )}
        <span className="font-['Inter'] font-medium text-[20.5882px] leading-[25px] whitespace-nowrap">
          {category.name}
        </span>
      </button>
    );
  })}

  {/* View All Button  */}
  <button
    onClick={() => setSelectedCategory(null)}
    className={cn(
      "flex items-center justify-center px-[18px] py-[18px] h-[61px] border rounded-[145.588px] transition-all",
      selectedCategory === null
        ? "bg-[#007036] border-[#007036] text-white hover:bg-[#005a2b]" // Selected
        : "bg-white border-[#D9D9D9] text-black hover:bg-gray-50"       // Not Selected
    )}
  >
    <span className="font-['Inter'] font-medium text-[20.5882px] leading-[25px]">
      {t("common.viewAll") || "View all"}
    </span>
  </button>
</div>
        </div>

        {/* Map Container  */}
        <div className="relative w-full flex justify-center">
          {/* Map Background*/}
          <div 
            className="relative rounded-[38.209px] overflow-hidden"
            style={{
              width: '1447.92px',
              height: '1111px',
              maxWidth: '100%',
              background: '#D9D9D9',
            }}
          >
            {!isLoading && userLocation ? (
              <InteractiveMap
                pois={filteredPois}
                userLocation={userLocation}
                locale={locale}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
            ) : (
              <div className="w-full h-full bg-gray-200 rounded-[38.209px] flex items-center justify-center">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#007036]"></div>
                  <p className="text-gray-500 mt-4">Loading map...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}