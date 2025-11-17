import { Theme, ThemeLocalization } from '@/services/api/themeApi';

/**
 * Parse theme localization from JSON string or object
 */
function parseThemeLocalization(
  localization: string | ThemeLocalization
): ThemeLocalization {
  if (typeof localization === 'string') {
    try {
      return JSON.parse(localization);
    } catch (e) {
      return { name: localization, desc: '' };
    }
  }
  return localization;
}

/**
 * Get theme name based on locale
 */
export function getThemeName(
  theme: Theme,
  locale: 'fr' | 'en' | 'ar' = 'fr'
): string {
  const localization = parseThemeLocalization(theme[locale]);
  return localization.name || '';
}

/**
 * Get theme description based on locale
 */
export function getThemeDesc(
  theme: Theme,
  locale: 'fr' | 'en' | 'ar' = 'fr'
): string {
  const localization = parseThemeLocalization(theme[locale]);
  return localization.desc || '';
}
