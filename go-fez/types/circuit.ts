interface Localization {
  name: string;
  description: string;
}

interface ThemeLocalization {
  name: string;
  desc: string;
}

interface Theme {
  id: string;
  fr: ThemeLocalization;
  ar: ThemeLocalization;
  en: ThemeLocalization;
}

interface City {
  id: string;
  name: string;
  nameAr: string;
  nameEn: string;
}

interface CircuitPOI {
  order: number;
  estimatedTime: number | null; // Assuming null when time isn't explicitly set
}
type SortCategory = 'newest' | 'rating' | 'nearest' | 'popular';
interface POI {
  id: string;
  category: string; // This looks like a UUID string
  frLocalization: { name: string };
  arLocalization: { name: string };
  enLocalization: { name: string };
  CircuitPOI: CircuitPOI;
}

interface Circuit {
  id: string;
  ar: Localization;
  fr: Localization;
  en: Localization;
  image: string; // URL string
  imagePublicId: string;
  cityId: string;
  duration: number; // Duration in minutes
  distance: number; // Distance in meters/kilometers
  startPoint: string; // UUID string
  endPoint: string; // UUID string
  isActive: boolean;
  isPremium: boolean;
  price: number;
  rating: number;
  reviewCount: number;
  isDeleted: boolean;
  createdAt: string; // ISO 8601 Date string
  updatedAt: string; // ISO 8601 Date string
  city: City;
  themes: Theme[];
  pois: POI[];
}

export type {
  Circuit,
  Theme,
  POI,
  City,
  Localization,
  CircuitPOI,
  SortCategory,
};
