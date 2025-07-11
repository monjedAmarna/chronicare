// Auth API module
import { apiRequest } from "./apiRequest";

export interface SignInData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: "patient" | "doctor" | "admin";
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin';
  firstName: string;
  lastName: string;
  phone?: string;
  gender?: string;
  dateOfBirth?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  height?: number;
  weight?: number;
  bloodType?: string;
  profileImageUrl?: string;
  isActive?: boolean;
  isEmailVerified?: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export async function signIn(data: SignInData): Promise<{ user: UserProfile; token: string }> {
  return apiRequest("POST", "/api/auth/signin", data);
}

export async function register(data: RegisterData): Promise<{ user: UserProfile; token: string }> {
  return apiRequest("POST", "/api/auth/register", data);
}

export async function getCurrentUser(): Promise<UserProfile> {
  return apiRequest("GET", "/api/auth/user");
}

export async function updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
  return apiRequest("PATCH", "/api/auth/profile", data);
}

export async function signOut(): Promise<void> {
  return apiRequest("POST", "/api/auth/signout");
} 