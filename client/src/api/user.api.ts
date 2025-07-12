import { apiRequest } from "./apiRequest";

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  gender?: string;
  dateOfBirth?: string;
  address?: string;
  profileImageUrl?: string;
  doctorId?: number;
}

export interface Doctor {
  id: number;
  name: string;
  email: string;
}

export async function getUsers(): Promise<User[]> {
  return apiRequest("GET", "/api/users");
}

export async function getDoctors(): Promise<Doctor[]> {
  return apiRequest("GET", "/api/users/doctors");
}

export async function getUser(id: string): Promise<User> {
  return apiRequest("GET", `/api/users/${id}`);
}

export async function updateUser(id: string, data: Partial<User>): Promise<User> {
  return apiRequest("PUT", `/api/users/${id}`, data);
}

export async function deleteUser(id: string): Promise<void> {
  return apiRequest("DELETE", `/api/users/${id}`);
} 