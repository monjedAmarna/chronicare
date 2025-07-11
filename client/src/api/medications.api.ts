// Medications API module
import { apiRequest } from "./apiRequest";

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
  status?: string;
  notes?: string;
  createdAt?: string;
}

export async function getMedications(patientId?: string): Promise<Medication[]> {
  const url = patientId ? `/api/medications?patientId=${patientId}` : "/api/medications";
  return apiRequest("GET", url);
}

export async function getMedicationById(id: string): Promise<Medication> {
  return apiRequest("GET", `/api/medications/${id}`);
}

export async function createMedication(data: Omit<Medication, "id"> & { patientId?: string }): Promise<Medication> {
  return apiRequest("POST", "/api/medications", data);
}

export async function updateMedication(id: string, data: Partial<Medication>): Promise<Medication> {
  return apiRequest("PUT", `/api/medications/${id}`, data);
}

export async function deleteMedication(id: string): Promise<void> {
  return apiRequest("DELETE", `/api/medications/${id}`);
} 