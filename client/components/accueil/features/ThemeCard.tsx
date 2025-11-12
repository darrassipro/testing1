"use client";

import React from "react";
import { useTranslations } from "next-intl";

interface ThemeCardProps {
  theme: any;
  onSelect: (id: string) => void;
  currentLocale: string;
}

export default function ThemeCard({
  theme,
  onSelect,
  currentLocale,
}: ThemeCardProps) {
  const t = useTranslations();

  // Extract localized data
  let title = "";
  let description = "";

  try {
    const parseLoc = (val: any) => {
      if (!val) return null;
      if (typeof val === "string") {
        try { return JSON.parse(val); } catch { return null; }
      }
      return typeof val === "object" ? val : null;
    };

    const locPreferred =
      parseLoc(theme[currentLocale]) ||
      parseLoc(theme.fr) ||
      parseLoc(theme.en) ||
      parseLoc(theme.ar) ||
      {};

    title = locPreferred?.name || locPreferred?.title || "";
    description = locPreferred?.desc || locPreferred?.description || "";
  } catch (e) {
    title = "Untitled";
    description = "Your pocket companion for exploring the city's...";
  }

  return (
    <div
      onClick={() => onSelect(theme.id)}
      className="group relative flex-shrink-0 w-full md:w-[416px] h-[421.3px] md:h-[400px] bg-white border border-[#EDEDED] md:border-[0.829327px] shadow-[0px_14.0986px_30.6851px_rgba(176,176,176,0.1)] md:shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300"
      style={{ borderRadius: "0px 66.3462px 0px 66.3462px", ...(typeof window !== 'undefined' && window.innerWidth >= 768 ? { borderRadius: "0px 80px 0px 80px" } : {}) }}
    >
      {/* Background Image with Gradient Overlay */}
      <div className="absolute inset-0">
        {/* Theme Image */}
        <div className="w-full h-full overflow-hidden">
          <img
            src={theme.image || "/images/default-theme.jpg"}
            alt={title}
            className="w-full h-full object-cover transform transition-transform duration-700 ease-out group-hover:scale-110"
            style={{
              filter: "brightness(1.1) contrast(1.05) saturate(1.1)",
            }}
          />
        </div>
        
        {/* Gradient Overlay - White at bottom covering text, then transparent */}
        <div 
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to top, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 1) 55%, rgba(255, 255, 255, 0.7) 70%, rgba(255, 255, 255, 0) 100%)"
          }}
        />
      </div>

      {/* Content Container */}
      <div className="absolute left-[29.03px] md:left-[35px] top-1/2 -translate-y-1/2 w-[287.78px] md:w-[347px] flex flex-col gap-[49.76px] md:gap-[60px]">
        {/* Top Section */}
        <div className="flex flex-col gap-[42.3px] md:gap-[51px]">
          {/* Icon Container */}
          <div className="w-20 md:w-[100px] h-20 md:h-[100px] bg-white rounded-[20px] md:rounded-[23px] shadow-[0px_46.5699px_18.5004px_rgba(161,161,161,0.01),0px_26.1557px_15.3106px_rgba(161,161,161,0.05),0px_11.483px_11.483px_rgba(161,161,161,0.09),0px_3.18972px_6.37944px_rgba(161,161,161,0.1)] md:shadow-[0px_56px_22px_rgba(161,161,161,0.01),0px_31px_18px_rgba(161,161,161,0.05),0px_14px_14px_rgba(161,161,161,0.09),0px_4px_8px_rgba(161,161,161,0.1)] flex items-center justify-center p-4">
            {theme.icon ? (
              <img
                src={theme.icon}
                alt={title}
                width={55}
                height={55}
                className="object-contain w-12 md:w-[55px] h-12 md:h-[55px]"
              />
            ) : (
              <div className="w-12 md:w-[55px] h-12 md:h-[55px] bg-gray-200 rounded-lg" />
            )}
          </div>

          {/* Text Content */}
          <div className="flex flex-col gap-[8.29px] md:gap-[10px]">
            {/* Title */}
            <h3
              className="font-['BigNoodleTitling'] text-2xl md:text-3xl leading-7 md:leading-9 tracking-[0.01em] text-black"
              style={{ fontWeight: 400 }}
            >
              {title}
            </h3>

            {/* Description */}
            <p
              className="font-['Inter'] text-sm md:text-base leading-5 md:leading-6 text-[#6A6A6A] w-[287.78px] md:w-[347px] line-clamp-2"
              title={description || "Your pocket companion for exploring the city's..."}
            >
              {(description || "Your pocket companion for exploring the city's...") + ' ...'}
            </p>
          </div>
        </div>

        {/* View Routes Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(theme.id);
          }}
          className="flex items-center justify-center gap-2 md:gap-[13px] w-60 md:w-[225.73px] h-12 md:h-[48.27px] bg-[#007036] hover:bg-[#005a2b] transition-colors duration-300"
          style={{ borderRadius: "0px 26.772px" }}
        >
          <span className="font-['Inter'] font-semibold text-sm md:text-[15.4px] leading-5 md:leading-[26px] text-white text-center">
            {t("card.viewRoutes")}
          </span>
          <span className="text-white text-lg md:text-[27px] leading-none">↗</span>
        </button>
      </div>
    </div>
  );
}
