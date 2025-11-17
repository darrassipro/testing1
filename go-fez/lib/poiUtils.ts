import { POI } from '@/services/api/poiApi';
import Monument from '@/types/monument';

/**
 * Parse POI localization from JSON string or object
 */
function parsePOILocalization(
  localization: any
): { name: string; description: string; address: string } | null {
  if (!localization) return null;

  if (typeof localization === 'string') {
    try {
      return JSON.parse(localization);
    } catch (e) {
      // Si ce n'est pas du JSON, retourner null
      return null;
    }
  }

  // Si c'est déjà un objet avec name
  if (typeof localization === 'object' && localization.name) {
    return localization;
  }

  return null;
}

/**
 * Get POI name based on locale
 */
export function getPOIName(
  poi: POI,
  locale: 'fr' | 'en' | 'ar' = 'fr'
): string {
  // Essayer d'abord la shortcut (fr, ar, en)
  let localization = parsePOILocalization(poi[locale]);

  // Sinon essayer la version complète (frLocalization, arLocalization, enLocalization)
  if (!localization) {
    const localizationKey = `${locale}Localization` as keyof POI;
    localization = parsePOILocalization((poi as any)[localizationKey]);
  }

  return localization?.name || '';
}

/**
 * Get POI description based on locale
 */
export function getPOIDescription(
  poi: POI,
  locale: 'fr' | 'en' | 'ar' = 'fr'
): string {
  // Essayer d'abord la shortcut (fr, ar, en)
  let localization = parsePOILocalization(poi[locale]);

  // Sinon essayer la version complète (frLocalization, arLocalization, enLocalization)
  if (!localization) {
    const localizationKey = `${locale}Localization` as keyof POI;
    localization = parsePOILocalization((poi as any)[localizationKey]);
  }

  return localization?.description || '';
}

/**
 * Get POI address based on locale
 */
export function getPOIAddress(
  poi: POI,
  locale: 'fr' | 'en' | 'ar' = 'fr'
): string {
  // Essayer d'abord la shortcut (fr, ar, en)
  let localization = parsePOILocalization(poi[locale]);

  // Sinon essayer la version complète (frLocalization, arLocalization, enLocalization)
  if (!localization) {
    const localizationKey = `${locale}Localization` as keyof POI;
    localization = parsePOILocalization((poi as any)[localizationKey]);
  }

  return localization?.address || '';
}

/**
 * Extract coordinates from POI
 */
export function getPOICoordinates(
  poi: POI
): { latitude: number; longitude: number } | null {
  if (!poi.coordinates) return null;

  // Format GeoJSON: { type: 'Point', coordinates: [longitude, latitude] }
  if ('type' in poi.coordinates && poi.coordinates.type === 'Point') {
    const [longitude, latitude] = poi.coordinates.coordinates;
    return { latitude, longitude };
  }

  // Format simple: { latitude, longitude }
  if ('latitude' in poi.coordinates && 'longitude' in poi.coordinates) {
    return {
      latitude: poi.coordinates.latitude,
      longitude: poi.coordinates.longitude,
    };
  }

  return null;
}

/**
 * Get POI image URL
 */
export function getPOIImage(poi: POI): string | undefined {
  // Priorité: files (array) > poiFile (single) > imageUrl (si existe)
  if (poi.files && poi.files.length > 0) {
    const imageFile = poi.files.find((f) => f.type === 'image');
    if (imageFile) return imageFile.fileUrl;
  }

  if (poi.poiFile && poi.poiFile.type === 'image') {
    return poi.poiFile.fileUrl;
  }

  return undefined;
}

/**
 * Get category name from POI categoryPOI field
 */
export function getPOICategoryName(
  poi: POI,
  locale: 'fr' | 'en' | 'ar' = 'fr'
): string {
  if (!poi.categoryPOI) return poi.category || '';

  // Si categoryPOI a une propriété locale (fr, en, ar) qui peut être une string JSON
  if (poi.categoryPOI[locale]) {
    const loc = poi.categoryPOI[locale];
    if (typeof loc === 'string') {
      try {
        const parsed = JSON.parse(loc);
        return parsed.name || '';
      } catch (e) {
        return loc;
      }
    }
    // Si c'est déjà un objet
    if (typeof loc === 'object' && loc.name) {
      return loc.name;
    }
  }

  // Si categoryPOI a directement une propriété 'name'
  if (poi.categoryPOI.name) {
    return poi.categoryPOI.name;
  }

  return poi.category || '';
}

/**
 * Convert POI from backend to Monument format for the map
 */
export function poiToMonument(poi: POI, index: number = 0): Monument | null {
  const coordinates = getPOICoordinates(poi);
  if (!coordinates) return null;

  const name = getPOIName(poi, 'fr');
  const imageUrl = getPOIImage(poi);
  const categoryName = getPOICategoryName(poi, 'fr');

  // Get all image files
  const images: string[] = [];
  if (poi.files) {
    poi.files
      .filter((f) => f.type === 'image')
      .forEach((f) => images.push(f.fileUrl));
  }

  return {
    id: parseInt(poi.id) || index,
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
    title: name,
    type: categoryName || poi.category || 'poi',
    imageUrl: imageUrl,
    images: images.length > 0 ? images : undefined,
    order: poi.CircuitPOI?.order || index,
  };
}

/**
 * Convert array of POIs to Monuments
 */
export function poisToMonuments(pois: POI[]): Monument[] {
  return pois
    .map((poi, index) => poiToMonument(poi, index))
    .filter((monument): monument is Monument => monument !== null);
}
