type LocalizedContent = {
  name: string;
  desc: string;
};

type Theme = {
  id: string;
  ar: LocalizedContent;
  fr: LocalizedContent;
  en: LocalizedContent;
  icon: string;
  image: string;
  imagePublicId: string;
  iconPublicId: string;
  color: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  created_at: string;
  updated_at: string;
  circuitsFromThemes: Array<{ id: string }>;
  circuitsCount: number;
  overallRating?: number;
};

export type { Theme, LocalizedContent };
