export interface ExploreCardProps {
  item: any;
  selected: string | null;
  onSelect: (id: string) => void;
  currentLocale: string;
}

export interface LanguageSelectorProps {
  locale: string;
  onLanguageChange: (lang: 'en' | 'fr' | 'ar') => void;
}

export interface FeatureIconProps {
  icon: string;
  color: string;
}
// client/lib/types/index.ts

// --- Existing Types ---

export interface ExploreCardProps {
  item: any;
  selected: string | null;
  onSelect: (id: string) => void;
  currentLocale: string;
}

export interface LanguageSelectorProps {
  locale: string;
  onLanguageChange: (lang: 'en' | 'fr' | 'ar') => void;
}

export interface FeatureIconProps {
  icon: string;
  color: string;
}

// --- Added Missing Types ---

// Basic localization object
export interface Localization {
  name: string;
  description: string;
  address: string;
}

// Defines a file attached to a POI
export interface POIFile {
  id: string;
  fileUrl: string;
  type: 'image' | 'video' | 'virtualtour';
}

// Defines a POI Category
export interface POICategory {
  id: string;
  fr: string;
  ar: string;
  en: string;
}
export interface CreateCustomCircuitRequest {
	name: string;
	description?: string; // <-- AJOUTEZ CETTE LIGNE
	pois: {
		poiId: string;
		order: number;
	}[];
}
// Defines a POI (Point of Interest) type
export interface POI {
  id: string;
  frLocalization?: Localization;
  arLocalization?: Localization;
  enLocalization?: Localization;
  // Direct access for localized fields (used in POITimeline)
  fr?: Localization;
  ar?: Localization;
  en?: Localization;
  files?: POIFile[];
  categoryPOI?: POICategory;
  isPremium?: boolean;
  // Geographic coordinates - SUPPORTS MULTIPLE FORMATS
  coordinates?: 
    | { 
        // Format 1: GeoJSON Point
        type: 'Point';
        coordinates: [number, number]; // [longitude, latitude]
      }
    | {
        // Format 2: Object with latitude/longitude
        latitude: number;
        longitude: number;
        address?: string;
      }
    | [number, number]; // Format 3: Direct array [longitude, latitude] or [latitude, longitude]
  // Includes data from the circuit join table
  CircuitPOI?: {
    order: number;
  };
  // Additional fields
  category?: string;
  practicalInfo?: any;
  cityId?: string;
  isActive?: boolean;
  isVerified?: boolean;
  rating?: number;
  reviewCount?: number;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

// Defines the Circuit type (inferred from circuit page)
export interface Circuit {
  id: string;
  fr: Localization;
  ar: Localization;
  en: Localization;
  image: string;
  themes?: Array<{ id: string; fr: string | Localization; ar?: string; en?: string }>;
  pois?: POI[];
  duration: number; // Duration in hours/minutes
  distance: number; // Distance in km
  durationMinutes?: number; // Used in theme detail page
  difficulty?: string; // Used in theme detail page
  isActive?: boolean;
  isPremium?: boolean;
}

// Defines the Circuit Progress type
export interface CircuitProgress {
  id: string;
  userId: string;
  circuitId: string;
  status: 'STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  completedPOIs?: string[]; // Array of POI IDs that have been completed
  completedPoiIds?: string[]; // Alias for compatibility
  currentPOIIndex?: number; // Current index in the circuit
  createdAt: string;
  updatedAt: string;
}

// Gamification Types
export interface UserPoints {
  id: string;
  userId: string;
  totalPoints: number;
  level: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requiredPoints: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  role: 'user' | 'admin' | 'moderator';
  lastName: string;
  profileImage?: string;
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Custom Circuit Types
export interface CustomCircuit  {
  id: string;
  userId: string;
  name: string;
  description?: string;
  pois: POI[]; // POIs with order
	status: 'PRIVATE' | 'PUBLIC' | 'PENDING';
  selectedPOIs: string[];
  startDate?: Date | string | null;
  estimatedDuration?: number | null;
  isPublic?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Review Types
export interface Review {
  id: string;
  userId: string;
  poiId: string;
  rating: number;
  comment?: string;
  photos?: string[];
  author?: string; // User name from backend
  createdAt?: string;
  created_at?: string; // Snake case from DB
  updatedAt?: string;
  updated_at?: string; // Snake case from DB
  user?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    profileImage?: string;
  };
}

// Share Types
export interface Share {
  id: string;
  userId: string;
  resourceType: 'poi' | 'circuit';
  resourceId: string;
  platform: 'facebook' | 'twitter' | 'whatsapp' | 'link';
  createdAt?: string;
}

// Partner Types
export interface Partner {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  qrCode?: string;
  discountPercentage?: number;
  address?: string;
  phone?: string;
  website?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PartnerVisit {
  id: string;
  userId: string;
  partnerId: string;
  visitDate: string;
  pointsAwarded?: boolean;
  createdAt?: string;
}