import { Circuit } from '@/types/circuit';
import { CIRCUITS_URL } from './constants';

export async function getAllCircuits(): Promise<Circuit[]> {
  try {
    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(`${CIRCUITS_URL}`, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      // Only log non-network errors in development
      if (__DEV__ && response.status !== 0) {
        console.warn(
          `Failed to fetch circuits: ${response.status} ${response.statusText}`
        );
      }
      return [];
    }

    const data = await response.json();
    if (!data || !data.data) {
      return [];
    }
    return data.data;
  } catch (error: any) {
    // Only log errors that aren't network failures or aborted requests
    if (__DEV__) {
      if (error.name === 'AbortError') {
        console.warn('Circuit fetch timeout - server may be unavailable');
      } else if (error.message !== 'Network request failed') {
        console.warn('Error fetching circuits:', error.message || error);
      }
    }
    return [];
  }
}

export async function getCircuitsByTheme({
  themeId,
  cityId,
  latitude,
  longitude,
  sortBy = 'newest',
}: {
  themeId?: string;
  cityId?: string;
  latitude?: number;
  longitude?: number;
  sortBy?: 'newest' | 'rating' | 'nearest' | 'popular';
}): Promise<Circuit[]> {
  try {
    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const params = new URLSearchParams();
    if (themeId) params.append('themeId', themeId);
    if (cityId) params.append('cityId', cityId);
    if (latitude) params.append('latitude', latitude.toString());
    if (longitude) params.append('longitude', longitude.toString());
    if (sortBy) params.append('sortBy', sortBy);

    const response = await fetch(`${CIRCUITS_URL}/by-theme?${params}`, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      // Only log non-network errors in development
      if (__DEV__ && response.status !== 0) {
        console.warn(
          `Failed to fetch circuits: ${response.status} ${response.statusText}`
        );
      }
      return [];
    }

    const data = await response.json();
    if (!data || !data.data) {
      return [];
    }
    return data.data;
  } catch (error: any) {
    // Only log errors that aren't network failures or aborted requests
    if (__DEV__) {
      if (error.name === 'AbortError') {
        console.warn('Circuit fetch timeout - server may be unavailable');
      } else if (error.message !== 'Network request failed') {
        console.warn('Error fetching circuits:', error.message || error);
      }
    }
    return [];
  }
}

export async function getCircuitById(id: string): Promise<Circuit | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(`${CIRCUITS_URL}/${id}`, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (__DEV__ && response.status !== 0) {
        console.warn(`Failed to fetch circuit: ${response.status} ${response.statusText}`);
      }
      return null;
    }

    const data = await response.json();
    if (!data || !data.data) {
      return null;
    }
    return data.data;
  } catch (error: any) {
    if (__DEV__) {
      if (error.name === 'AbortError') {
        console.warn('Circuit fetch timeout');
      } else if (error.message !== 'Network request failed') {
        console.warn('Error fetching circuit:', error.message || error);
      }
    }
    return null;
  }
}
