// client/lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


/**
 * Safely retrieves a localized field from an object based on the current locale.
 * Falls back through en -> fr -> ar if the preferred locale is missing.
 * Handles nested localization objects (like POI.frLocalization.name)
 * and direct locale keys (like Theme.fr).
 */
export function getLocalizedField( // Make sure 'export' keyword is here
  item: any,
  field: string, // e.g., 'name', 'description'
  locale: 'en' | 'fr' | 'ar',
  defaultValue: string = 'N/A'
): string {
  if (!item) return defaultValue;

  // Priority order based on locale
  const localePriority: ('en' | 'fr' | 'ar')[] =
    locale === 'ar' ? ['ar', 'en', 'fr'] :
    locale === 'en' ? ['en', 'fr', 'ar'] :
    ['fr', 'en', 'ar']; // Default 'fr'

  for (const loc of localePriority) {
    // Check for nested localization object (e.g., poi.frLocalization.name)
    const nestedObjectKey = `${loc}Localization`; // e.g., 'frLocalization'
    if (item[nestedObjectKey] && typeof item[nestedObjectKey] === 'object' && item[nestedObjectKey][field]) {
      return item[nestedObjectKey][field];
    }

    // Check for direct locale key (e.g., theme.fr)
    // If the value is an object, assume it's like { name: '...', description: '...' }
    if (item[loc]) {
      if (typeof item[loc] === 'object' && item[loc][field]) {
        return item[loc][field];
      }
      // If it's a direct string (like category.fr), and the field is 'name' (common case)
      if (typeof item[loc] === 'string' && field === 'name') {
         return item[loc];
      }
    }
  }

  return defaultValue;
}
