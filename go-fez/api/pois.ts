import { API_BASE_URL } from '@/lib/config';

const BASE_URL = `${API_BASE_URL}/api`;
const POIS_URL = BASE_URL + '/pois';

export interface POI {
  id: string;
  coordinates: {
    latitude: number;
    longitude: number;
    address?: string;
  } | {
    type: 'Point';
    coordinates: [number, number];
  };
  files?: Array<{
    id: string;
    fileUrl: string;
    type: 'image' | 'video' | 'virtualtour';
  }>;
  frLocalization?: {
    name: string;
    description: string;
    audioFiles?: string | any[];
  };
  enLocalization?: {
    name: string;
    description: string;
    audioFiles?: string | any[];
  };
  arLocalization?: {
    name: string;
    description: string;
    audioFiles?: string | any[];
  };
  categoryPOI?: any;
  city?: {
    name: string;
    nameAr?: string;
    nameEn?: string;
    image?: string;
  };
  [key: string]: any;
}

export async function getPOIById(id: string): Promise<POI | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(`${POIS_URL}/${id}`, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (__DEV__ && response.status !== 0) {
        console.warn(`Failed to fetch POI: ${response.status} ${response.statusText}`);
      }
      return null;
    }

    const data = await response.json();
    if (!data || !data.poi) {
      return null;
    }
    return data.poi;
  } catch (error: any) {
    if (__DEV__) {
      if (error.name === 'AbortError') {
        console.warn('POI fetch timeout');
      } else if (error.message !== 'Network request failed') {
        console.warn('Error fetching POI:', error.message || error);
      }
    }
    return null;
  }
}

