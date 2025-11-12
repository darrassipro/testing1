"use client";

import React, { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useGetAllCircuitsQuery } from "@/services/api/CircuitApi";
import { useRouter } from "@/i18n/navigation";
import ExploreCard from "./ExploreCard";

interface CircuitsProps {
  locale: string;
  isRTL: boolean;
}

export default function Circuits({ locale, isRTL }: CircuitsProps) {
  const t = useTranslations();
  const { data: circuitsData, isLoading, error } = useGetAllCircuitsQuery();
  const router = useRouter();

  // 🔹 Handle navigation to the circuit detail page
  const handleCircuitClick = (id: string) => {
    router.push(`/circuits/${id}`);
  };

  const circuits = circuitsData?.data || [];

  // 🔹 Ref for horizontal scrolling
  const scrollRef = useRef<HTMLDivElement>(null);

  // 🔹 Scroll logic
  const scrollAmount = 400; // adjust as needed
  const handleScroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const { scrollLeft } = scrollRef.current;

    if (direction === "left") {
      scrollRef.current.scrollTo({
        left: isRTL ? scrollLeft + scrollAmount : scrollLeft - scrollAmount,
        behavior: "smooth",
      });
    } else {
      scrollRef.current.scrollTo({
        left: isRTL ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="py-12 md:py-20 bg-white">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with title + buttons */}
        <div
          className={`flex items-center justify-between mb-8 md:mb-10 ${
            isRTL ? "flex-row-reverse" : ""
          }`}
        >
          <h2 
            onClick={() => router.push('/circuits')}
            className="text-2xl md:text-[40px] font-semibold text-black leading-tight cursor-pointer hover:text-blue-600 transition-colors"
          >
            {t("exploreCircuit.title")}
          </h2>

          <div className={`flex gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
            <button
              onClick={() => handleScroll("left")}
              className="p-2 md:p-4 bg-white border border-[#D9D9D9] rounded-full hover:bg-gray-50 transition"
              aria-label="Previous"
            >
              <ChevronLeft size={24} className={isRTL ? "rotate-180" : ""} />
            </button>
            <button
              onClick={() => handleScroll("right")}
              className="p-2 md:p-4 bg-white border border-[#D9D9D9] rounded-full hover:bg-gray-50 transition"
              aria-label="Next"
            >
              <ChevronRight size={24} className={isRTL ? "rotate-180" : ""} />
            </button>
          </div>
        </div>

        {/* Circuits list */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            <p className="text-gray-500 mt-4">Loading circuits...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500">Error loading circuits</p>
          </div>
        ) : circuits.length > 0 ? (
          <div className="relative">
            <div
              ref={scrollRef}
              className={`flex gap-5 overflow-x-auto scrollbar-hide scroll-smooth pb-4 -mx-4 px-4 ${
                isRTL ? "flex-row-reverse" : ""
              }`}
            >
              {circuits
                .filter((c) => c.isActive)
                .map((item) => (
                  <ExploreCard
                    key={item.id}
                    item={item}
                    selected={null} // No selection state needed
                    onSelect={handleCircuitClick} // Navigate on click
                    currentLocale={locale}
                  />
                ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No circuits available</p>
          </div>
        )}
      </div>
    </div>
  );
}