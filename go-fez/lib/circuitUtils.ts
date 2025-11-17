import { Circuit, CircuitLocalization } from '@/services/api/circuitApi';

/**
 * Parse circuit localization from JSON string or object
 */
function parseCircuitLocalization(
  localization: string | CircuitLocalization
): CircuitLocalization {
  if (typeof localization === 'string') {
    try {
      return JSON.parse(localization);
    } catch (e) {
      return { name: localization, description: '' };
    }
  }
  return localization;
}

/**
 * Get circuit name based on locale
 */
export function getCircuitName(
  circuit: Circuit,
  locale: 'fr' | 'en' | 'ar' = 'fr'
): string {
  const localization = parseCircuitLocalization(circuit[locale]);
  return localization.name || '';
}

/**
 * Get circuit description based on locale
 */
export function getCircuitDescription(
  circuit: Circuit,
  locale: 'fr' | 'en' | 'ar' = 'fr'
): string {
  const localization = parseCircuitLocalization(circuit[locale]);
  return localization.description || '';
}
