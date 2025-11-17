// User types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  profileImage?: string;
  role: 'user' | 'admin' | 'moderator';
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// Auth types
export interface AuthCredentials {
  user: User;
  token: string;
  refreshToken: string;
}

// Language types
export interface Language {
  code: string;
  name: string;
  country: string;
  flag: string;
}
