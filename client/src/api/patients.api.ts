// Patients API module
import { apiRequest } from "./apiRequest";

export interface Patient {
  id: string;
  name: string;
  email: string;
  password?: string;
  gender?: string;
  dateOfBirth?: string;
  phone?: string;
  primaryCondition?: string;
  healthMetrics?: {
    bloodPressure?: string;
    glucose?: number;
    weight?: number;
    height?: number;
    bmi?: number;
  };
  riskLevel?: "low" | "medium" | "high" | "critical";
  status?: "active" | "inactive" | "discharged";
  lastReading?: string;
  nextAppointment?: string;
  recentActivity?: string;
  medicationCount?: number;
  adherenceRate?: number;
  alertCount?: number;
  carePlanStatus?: "current" | "needs_update" | "overdue";
}

export async function getPatients(): Promise<Patient[]> {
  return apiRequest("GET", "/api/patients");
}

export async function createPatient(data: Omit<Patient, "id">): Promise<Patient> {
  return apiRequest("POST", "/api/patients", data);
}

export async function updatePatient(id: string, data: Partial<Patient>): Promise<Patient> {
  return apiRequest("PUT", `/api/patients/${id}`, data);
}

export async function deletePatient(id: string): Promise<void> {
  return apiRequest("DELETE", `/api/patients/${id}`);
}

export async function getPatientById(id: string): Promise<Patient> {
  return apiRequest("GET", `/api/patients/${id}`);
} 