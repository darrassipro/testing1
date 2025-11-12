type LocalizedContent = {
  name: string;
  desc: string;
};

type Theme = {
  id: string;
  ar: string; // JSON string of LocalizedContent
  fr: string; // JSON string of LocalizedContent
  en: string; // JSON string of LocalizedContent
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
};

export type { Theme, LocalizedContent };
