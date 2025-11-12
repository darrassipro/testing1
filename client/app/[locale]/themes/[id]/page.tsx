"use client";

import React, { useMemo } from "react";
import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { MapPin, Clock, Sprout, AlertTriangle } from "lucide-react";
// --- VERIFY THESE IMPORTS ---
import { useGetThemeByIdQuery } from "@/services/api/ThemeApi";
import { useGetAllCircuitsQuery } from "@/services/api/CircuitApi";
import { getLocalizedField } from "@/lib/utils"; // Should be { ... }
// --- END VERIFY ---
import { Link, useRouter } from "@/i18n/navigation";
import Header from "@/components/header/header";
import Footer from "@/components/footer/footer";
import { POI } from "@/lib/types"; // Make sure this path is correct
import CircuitCard1 from '@/components/circuits/CircuitCard1';


// A new, attractive POI card for this page
const POIGridCard = ({
  poi,
  locale,
}: {
  poi: POI;
  locale: "en" | "fr" | "ar";
}) => {
  const t = useTranslations("POICard");
  const dir = locale === "ar" ? "rtl" : "ltr";

  // Using getLocalizedField here
  const name = getLocalizedField(poi as any, "name", locale);
  const description = getLocalizedField(poi as any, "description", locale);
  const primaryImage =
    poi.files?.find((f) => f.type === "image")?.fileUrl ||
    "https://via.placeholder.com/400x300";

  return (
    <Link
      href={`/pois/${poi.id}`}
      className="group block rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 bg-white"
    >
      <div className="relative">
        <Image
          src={primaryImage}
          alt={name || "POI Image"}
          width={400}
          height={300}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 right-2 flex gap-2">
          {poi.isPremium && (
            <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {t("premium")}
            </span>
          )}
          {poi.categoryPOI && (
            <span className="bg-emerald-600 text-white text-xs font-bold px-2 py-1 rounded-full">
              {getLocalizedField(poi.categoryPOI, "name", locale)}
            </span>
          )}
        </div>
      </div>

      <div className="p-4" dir={dir}>
        <h3 className="text-lg font-bold text-gray-900 truncate" title={name}>
          {name}
        </h3>
        <p className="text-sm text-gray-600 line-clamp-2 mt-1">
          {description}
        </p>
      </div>
    </Link>
  );
};

// Main Page Component
export default function ThemeDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const locale = useLocale() as "en" | "fr" | "ar";
  const router = useRouter();
  const t = useTranslations("ThemePage");
  const dir = locale === "ar" ? "rtl" : "ltr";

  // Using useGetOneThemeQuery here
const {
  data: themeData,
  isLoading: isLoadingTheme,
  error: themeError,
} = useGetThemeByIdQuery(id);
  const {
    data: circuitsData,
    isLoading: isLoadingCircuits,
    error: circuitsError,
  } = useGetAllCircuitsQuery();

  const theme = themeData?.data;

  // Filter circuits that belong to this theme
  const relevantCircuits = useMemo(() => {
    if (!circuitsData?.data || !id) return [];
    return circuitsData.data.filter(
      (circuit) =>
        circuit.isActive && circuit.themes?.some((t) => t.id === id)
    );
  }, [circuitsData, id]);

  // Loading state
  if (isLoadingTheme || isLoadingCircuits) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-emerald-600"></div>
      </div>
    );
  }

  // Error state
  if (themeError || circuitsError || !theme) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50 text-center px-4">
        <AlertTriangle className="w-16 h-16 text-red-500" />
        <h1 className="mt-4 text-3xl font-bold text-gray-900">
          {t("errorTitle")}
        </h1>
        <p className="mt-2 text-gray-600">{t("errorMessage")}</p>
        <button
          onClick={() => router.back()}
          className="mt-6 px-6 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition"
        >
          {t("goBack")}
        </button>
      </div>
    );
  }

  // Using getLocalizedField here
  const themeName = getLocalizedField(theme, "name", locale);
  const themeDescription = getLocalizedField(theme, "description", locale);
  const themeImage = (theme as any)?.imageUrl || (theme as any)?.image || "https://via.placeholder.com/1600x600";

  // Search and filter state (to be implemented)
  // const [searchQuery, setSearchQuery] = useState("");
  // const [filters, setFilters] = useState({});

  return (
    <div className="min-h-screen bg-white flex flex-col" dir={dir}>
      <Header
        locale={locale}
        isRTL={dir === "rtl"}
        onLanguageChange={(newLocale) =>
          router.replace(`/themes/${id}`, { locale: newLocale })
        }
      />

  {/* Spacer for fixed header */}
  <div className="h-[120px] md:h-[130px]"></div>
  
      <main className="max-w-[1453px] mx-auto px-4 sm:px-6 lg:px-16 py-8 md:py-12">
        {/* All content wrapper with consistent max-width */}
        <div className="w-full md:max-w-[1290px]">
          {/* Header Section */}
          <div className="flex flex-col gap-6 mb-8">
            {/* Breadcrumb - only visible on md and up */}
            <div className="hidden md:flex items-center gap-2">
              <button 
                onClick={() => router.push('/')}
                className="font-['Inter'] font-medium text-[18px] leading-[22px] text-[#007036] hover:underline"
              >
                {t('home') || 'Home'}
              </button>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={dir === 'rtl' ? 'rotate-180' : ''}>
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="font-['Inter'] font-medium text-[18px] leading-[22px] text-black">
                {t('themes') || 'Circuits'}
              </span>
            </div>

            {/* Title */}
            <h1 className="font-['BigNoodleTitling'] font-normal text-[32px] md:text-[64px] leading-[38px] md:leading-[71px] text-left text-black">
              <b>Discover Fez Through Immersive Circuits</b>
            </h1>

            {/* Description */}
            <p className="hidden md:block font-['Poppins'] font-normal text-[22.5335px] leading-[33px] text-[#6A6A6A]">
              Follow curated routes designed to reveal the hidden stories, crafts, and flavors of the city — one step at a time.
            </p>

            {/* Filters and Search Bar Container - on same line for md and up */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mt-4">
              {/* Filters */}
              <div className="flex flex-row items-center flex-wrap gap-[8px] flex-1">
                {/* Most Popular */}
                <div className="flex flex-row justify-center items-center cursor-pointer hover:bg-gray-50 transition px-[22.7739px] py-[13.4203px] bg-white border-[1.92977px] border-[#EEEEEE] rounded-[161.044px]">
                  <span className="font-['Inter'] font-medium text-[22.7739px] leading-[28px] text-black whitespace-nowrap">
                    Most Popular
                  </span>
                  <svg width="28.95" height="28.95" viewBox="0 0 24 24" fill="none" className="ml-[13.42px]">
                    <path d="M6 9L12 15L18 9" stroke="#000000" strokeWidth="2.41221" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                
                {/* Walking */}
                <div className="flex flex-row justify-center items-center cursor-pointer hover:bg-gray-50 transition px-[22.7739px] py-[13.4203px] bg-white border-[1.92977px] border-[#EEEEEE] rounded-[161.044px]">
                  <span className="font-['Inter'] font-medium text-[22.7739px] leading-[28px] text-black whitespace-nowrap">
                    Walking
                  </span>
                  <svg width="28.95" height="28.95" viewBox="0 0 24 24" fill="none" className="ml-[13.42px]">
                    <path d="M6 9L12 15L18 9" stroke="#000000" strokeWidth="2.41221" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                
                {/* Medina */}
                <div className="flex flex-row justify-center items-center cursor-pointer hover:bg-gray-50 transition px-[22.7739px] py-[13.4203px] bg-white border-[1.92977px] border-[#EEEEEE] rounded-[161.044px]">
                  <span className="font-['Inter'] font-medium text-[22.7739px] leading-[28px] text-black whitespace-nowrap">
                    Medina
                  </span>
                  <svg width="28.95" height="28.95" viewBox="0 0 24 24" fill="none" className="ml-[13.42px]">
                    <path d="M6 9L12 15L18 9" stroke="#000000" strokeWidth="2.41221" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                
                {/* < 2 km */}
                <div className="flex flex-row justify-center items-center cursor-pointer hover:bg-gray-50 transition px-[22.7739px] py-[13.4203px] bg-white border-[1.92977px] border-[#EEEEEE] rounded-[161.044px]">
                  <span className="font-['Inter'] font-medium text-[22.7739px] leading-[28px] text-black whitespace-nowrap">
                    {'< 2 km'}
                  </span>
                  <svg width="28.95" height="28.95" viewBox="0 0 24 24" fill="none" className="ml-[13.42px]">
                    <path d="M6 9L12 15L18 9" stroke="#000000" strokeWidth="2.41221" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>

              {/* Search Bar */}
              <div className="w-full md:w-[416px] flex-shrink-0">
                <div className="flex items-center px-[18px] py-[18px] bg-white border border-[#EEEEEE] rounded-[272.346px] shadow-[-91px_60px_44px_rgba(163,163,163,0.01),-51px_34px_37px_rgba(163,163,163,0.05),-23px_15px_27px_rgba(163,163,163,0.09),-6px_4px_15px_rgba(163,163,163,0.1)]">
                  <svg width="27.55" height="27.55" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
                    <circle cx="11" cy="11" r="8" stroke="#000000" strokeWidth="1.83654" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M21 21L16.65 16.65" stroke="#000000" strokeWidth="1.83654" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <input
                    type="text"
                    placeholder={t('searchPlaceholder') || 'Search for restaurant,coffee ,shopping...'}
                    className="flex-1 font-['Inter'] font-normal text-[16px] leading-[37px] text-left text-[#5B5B5B] bg-transparent border-none outline-none placeholder:text-[#5B5B5B] focus:outline-none ml-2"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Circuits Grid */}
          {relevantCircuits.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg font-['Poppins']">
                {t("noCircuitsTitle") || 'No circuits available'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Render all circuits in rows of 3 */}
              {Array.from({ length: Math.ceil(relevantCircuits.length / 3) }).map((_, rowIndex) => (
                <div 
                  key={rowIndex}
                  className="flex flex-col md:flex-row items-center gap-[21px] w-full"
                >
                  {relevantCircuits
                    .slice(rowIndex * 3, (rowIndex + 1) * 3)
                    .map((circuit) => (
                      <CircuitCard1
                        key={circuit.id} 
                        circuit={circuit as any} 
                        locale={locale}
                        onClick={() => router.push(`/circuits/${circuit.id}`)}
                      />
                    ))}
                </div>
              ))}

              {/* Navigation Arrows - Bottom Right */}
              <div className="flex justify-end w-full mt-8">
                <div className="flex flex-row items-center gap-[8px]">
                  {/* Left Arrow */}
                  <div 
                    className="flex flex-row justify-center items-center cursor-pointer hover:bg-gray-100 transition"
                    style={{
                      width: '60px',
                      height: '60px',
                      background: '#FFFFFF',
                      border: '1px solid #D9D9D9',
                      borderRadius: '20px 0px',
                      padding: '18px'
                    }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M15 18L9 12L15 6" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  {/* Right Arrow */}
                  <div 
                    className="flex flex-row justify-center items-center cursor-pointer hover:bg-gray-100 transition"
                    style={{
                      width: '60px',
                      height: '60px',
                      background: '#FFFFFF',
                      border: '1px solid #D9D9D9',
                      borderRadius: '0px 20px',
                      padding: '18px'
                    }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M9 18L15 12L9 6" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer
        locale={locale}
        isRTL={dir === "rtl"}
        onLanguageChange={(newLocale) =>
          router.replace(`/themes/${id}`, { locale: newLocale })
        }
      />
    </div>
  );
}