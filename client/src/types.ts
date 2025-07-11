// Centralized API data types for the frontend

export type UserRole = 'admin' | 'doctor' | 'patient';

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
  isEmailVerified?: boolean;
  isActive?: boolean;
  lastLoginAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Medication {
  id: number;
  userId: string;
  name: string;
  dosage: string;
  frequency: string;
  times: string[];
  startDate: string;
  endDate?: string;
  isActive: boolean;
  createdAt?: string;
}

export interface MedicationLog {
  id: number;
  medicationId: number;
  userId: string;
  scheduledTime: string;
  takenAt?: string;
  status: string;
  notes?: string;
}

export interface HealthMetric {
  id: number;
  userId: string;
  type: string;
  value: string;
  unit?: string;
  recordedAt?: string;
  notes?: string;
}

export interface MedicalCondition {
  id: string;
  userId: string;
  condition: string;
  diagnosedDate?: string;
  isActive?: boolean;
  notes?: string;
}

export interface EmergencyContact {
  id: string;
  userId: string;
  name: string;
  relationship?: string;
  phone: string;
  email?: string;
  isPrimary?: boolean;
} 