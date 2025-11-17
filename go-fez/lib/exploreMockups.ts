/**
 * Mockups pour la page Explore
 * Basés sur le design de l'image
 */

export interface CategoryMockup {
  id: string;
  name: string;
  nameEn: string;
  nameAr: string;
  image: string; // URL ou require() pour les images locales
  description?: string;
}

export interface NearbyLocation {
  id: string;
  title: string;
  subtitle: string;
  rating: number;
  image: string;
  distance?: string;
  category?: string;
}

// Mockups des catégories "Explore by category"
export const categoryMockups: CategoryMockup[] = [
  {
    id: '1',
    name: 'History',
    nameEn: 'History',
    nameAr: 'التاريخ',
    image:
      'https://images.unsplash.com/photo-1539650116574-75c0c6d73a6e?w=400&h=400&fit=crop',
    description: 'Historical Sites & Ruins',
  },
  {
    id: '2',
    name: 'Traditional',
    nameEn: 'Traditional',
    nameAr: 'التقليدي',
    image:
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
    description: 'Traditional Arts & Crafts',
  },
  {
    id: '3',
    name: 'Gastronomy',
    nameEn: 'Gastronomy',
    nameAr: 'الطعام',
    image:
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=400&fit=crop',
    description: 'Traditional Culinary Experiences',
  },
  {
    id: '4',
    name: 'Spiritual',
    nameEn: 'Spiritual',
    nameAr: 'الروحانية',
    image:
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=400&fit=crop',
    description: 'Mosques & Sacred Places',
  },
  {
    id: '5',
    name: 'Architecture',
    nameEn: 'Architecture',
    nameAr: 'العمارة',
    image:
      'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=400&h=400&fit=crop',
    description: 'Historic Monuments',
  },
];

// Mockups des locations "Nearby for you"
export const nearbyLocationsMockup: NearbyLocation[] = [
  {
    id: '1',
    title: 'War Museum',
    subtitle: 'Burj al-Shamal',
    rating: 4.7,
    image:
      'https://images.unsplash.com/photo-1539650116574-75c0c6d73a6e?w=400&h=300&fit=crop',
    distance: '2.5 km',
    category: 'Museum',
  },
  {
    id: '2',
    title: 'Al-Attarine Madrasa',
    subtitle: 'Medina of Fez',
    rating: 4.8,
    image:
      'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=400&h=300&fit=crop',
    distance: '1.2 km',
    category: 'Architecture',
  },
  {
    id: '3',
    title: 'Dar Batha Museum',
    subtitle: 'Batha Square',
    rating: 4.6,
    image:
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
    distance: '3.1 km',
    category: 'Museum',
  },
  {
    id: '4',
    title: 'Chouara Tannery',
    subtitle: "Tanner's Quarter",
    rating: 4.5,
    image:
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop',
    distance: '0.8 km',
    category: 'Traditional',
  },
  {
    id: '5',
    title: 'Al-Qarawiyyin Mosque',
    subtitle: 'Medina of Fez',
    rating: 4.9,
    image:
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop',
    distance: '1.5 km',
    category: 'Spiritual',
  },
];
