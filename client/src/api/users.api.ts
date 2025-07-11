// Users API module
import { apiRequest } from "./apiRequest";

import { UserRole } from "@/types";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  profileImageUrl?: string;
  dateOfBirth?: string;
  phone?: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  height?: number;
  weight?: number;
  bloodType?: string;
  isEmailVerified: boolean;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  phone?: string;
  gender?: string;
  dateOfBirth?: string;
  address?: string;
  profileImageUrl?: string;
}

export async function getUsers(searchTerm?: string, role?: string): Promise<User[]> {
  const params = new URLSearchParams();
  if (searchTerm && searchTerm.trim()) {
    params.append('searchTerm', searchTerm.trim());
  }
  if (role && role.trim()) {
    params.append('role', role.trim());
  }
  
  const queryString = params.toString();
  const url = queryString ? `/api/users?${queryString}` : '/api/users';
  
  return apiRequest("GET", url);
}

export async function getAssignedPatients(): Promise<User[]> {
  return apiRequest("GET", "/api/patients/assigned");
}

export async function createUser(data: CreateUserInput): Promise<User> {
  return apiRequest("POST", "/api/users", data);
}

export async function updateUser(id: string, data: Partial<User>): Promise<User> {
  return apiRequest("PUT", `/api/users/${id}`, data);
}

export async function deleteUser(id: string): Promise<void> {
  return apiRequest("DELETE", `/api/users/${id}`);
}

export async function getUserById(id: string): Promise<User> {
  return apiRequest("GET", `/api/users/${id}`);
} 