"use client";

import React, { useState } from "react";
import { MapPin, Clock, Star, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ExploreCardProps } from "@/lib/types";

export default function ExploreCard({
  item,
  selected,
  onSelect,
  currentLocale,
}: ExploreCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const t = useTranslations();
  const isSelected = selected === item.id;

  // Extract title based on locale
  let title = "";
  try {
    if (item[currentLocale]) {
      const localization =
        typeof item[currentLocale] === "string"
          ? JSON.parse(item[currentLocale])
          : item[currentLocale];
      title = localization.name || localization.title || "";
    }
  } catch (e) {
    title = "Untitled";
  }

  const stops = item.pois?.length || 0;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelect(item.id)}
      className={`relative overflow-hidden cursor-pointer transition-all duration-300 flex-shrink-0 ${
        isHovered || isSelected ? "w-80 md:w-[474px]" : "w-64 md:w-[291px]"
      } h-80 md:h-[388px] group shadow-xl rounded-[32px]`} // 🔹 More rounded corners
    >
      {/* Background image container */}
      <div className="absolute inset-0 rounded-[32px] overflow-hidden">
        {/* Main background image */}
        <img
          src={
            item.image ||
            "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=800"
          }
          alt={title}
          className="w-full h-full object-cover"
        />

        {/* Left polygon */}
        <img
          src="/images/Polygon-left.png"
          alt="Polygon left"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-10 md:w-16 opacity-80 pointer-events-none select-none"
        />

        {/* Right polygon */}
        <img
          src="/images/Polygon-right.png"
          alt="Polygon right"
          className="absolute right-0 top-1/2 -translate-y-1/2 w-10 md:w-16 opacity-80 pointer-events-none select-none"
        />
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,33,59,0.5)] via-[rgba(0,33,59,0)] to-transparent rounded-[32px]" />

      {/* Bottom text content */}
      <div className="absolute bottom-0 left-0 right-0 p-5 md:p-7 text-white">
        <h3 className="text-lg md:text-2xl font-bold mb-2 tracking-tight">
          {title}
        </h3>

        {(isHovered || isSelected) && (
          <div className="flex items-center gap-3 md:gap-4 text-xs md:text-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
            <span className="flex items-center gap-1">
              <MapPin size={16} />
              {stops} {t("card.stops")}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={16} />
              {item.duration ? `${item.duration}h` : "2-3h"}
            </span>
            <span className="flex items-center gap-1">
              <Star size={16} fill="currentColor" />
              {item.rating || 4.7}
            </span>
          </div>
        )}
      </div>

      {/* Top-right badge */}
      <div className="absolute top-4 md:top-7 right-4 md:right-7 bg-white rounded-full px-3 md:px-4 py-1 md:py-1.5 text-black text-xs md:text-base font-medium flex items-center gap-2">
        <span>{t("card.viewRoutes")}</span>
        <ChevronRight size={16} />
      </div>
    </div>
  );
}
