import { Category, CategoryLocalization } from '@/services/api/categoryApi';

/**
 * Parse la localisation d'une catégorie (peut être string JSON ou objet)
 */
export const parseCategoryLocalization = (
  loc: string | CategoryLocalization | undefined
): CategoryLocalization | null => {
  if (!loc) return null;
  
  if (typeof loc === 'string') {
    try {
      return JSON.parse(loc);
    } catch (e) {
      return null;
    }
  }
  
  return loc;
};

/**
 * Récupère le nom de la catégorie selon la locale
 */
export const getCategoryName = (
  category: Category,
  locale: 'fr' | 'en' | 'ar' = 'fr'
): string => {
  if (!category) return 'Category';
  
  let locData = category[locale] || category.fr || category.en || category.ar;
  const parsed = parseCategoryLocalization(locData);
  
  return parsed?.name || 'Category';
};

/**
 * Récupère l'URL de l'icône de la catégorie depuis Cloudinary
 * Retourne l'URL directement si elle existe, sinon null
 */
export const getCategoryIcon = (category: Category): string | null => {
  return category.icon || null;
};

