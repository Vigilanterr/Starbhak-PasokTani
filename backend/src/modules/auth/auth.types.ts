export type UserRole = 'ADMIN' | 'FARMER' | 'BUYER';
export type UserStatus = 'PENDING' | 'VERIFIED' | 'REJECTED' | 'SUSPENDED';

export interface User {
  id: number;
  username: string;
  full_name: string;
  email: string;
  password: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  foto_profile: string | null;
  address: string | null;
  bio: string | null;
  village: string | null;
  farming_experience: string | null;
  farm_area: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface UserProfile {
  id: number;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  fotoProfile: string | null;
  address: string | null;
  bio: string | null;
  village: string | null;
  farmingExperience: string | null;
  farmArea: string | null;
  createdAt: Date;
}

export interface AuthResponse {
  token: string;
  user: Omit<UserProfile, 'password'>;
}

export interface JwtPayload {
  userId: number;
  email: string;
  role: UserRole;
  fullName: string;
}
