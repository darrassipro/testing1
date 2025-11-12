"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import Header from "@/components/header/header";
import FeaturesSection from "@/components/accueil/features/FeaturesSection";
import Themes from "@/components/accueil/features/themes";
import DiscoverMapSection from "@/components/accueil/features/DiscoverMapSection";
import Circuits from "@/components/accueil/features/circuits";
import AppDownload from "@/components/accueil/AppDownload";
import Footer from "@/components/footer/footer";

// 🚫 Disable SSR for Hero
const Hero = dynamic(() => import("@/components/accueil/hero/hero"), {
  ssr: false,
});

export default function FezDiscoveryApp() {
  const locale = useLocale() as "en" | "fr" | "ar";
  const router = useRouter();
  const pathname = usePathname();

  const dir = locale === "ar" ? "rtl" : "ltr";
  const isRTL = locale === "ar";

  const switchLocale = (newLocale: "en" | "fr" | "ar") => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <div className="min-h-screen bg-white" dir={dir}>
      <Header locale={locale} isRTL={isRTL} onLanguageChange={switchLocale} />
      <Hero dir={dir} isRTL={isRTL} />
      <FeaturesSection />
      <Themes locale={locale} isRTL={isRTL} />
      <DiscoverMapSection locale={locale} isRTL={isRTL} />
      {/* <Circuits locale={locale} isRTL={isRTL} /> */}
      <AppDownload isRTL={isRTL} />
      <Footer locale={locale} isRTL={isRTL} onLanguageChange={switchLocale} />
    </div>
  );
}
