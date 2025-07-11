// Care Plans API module
import { apiRequest } from "./apiRequest";

export interface CarePlan {
  id: string;
  userId: string;
  title: string;
  description: string;
  startDate: string;
  endDate?: string;
  status: "ongoing" | "completed" | "paused";
  adherenceRate?: number;
  nextReviewDate?: string;
  [key: string]: any;
}

export async function getCarePlans(): Promise<CarePlan[]> {
  return apiRequest("GET", "/api/care-plans");
}

export async function createCarePlan(data: Omit<CarePlan, "id">): Promise<CarePlan> {
  return apiRequest("POST", "/api/care-plans", data);
}

export async function updateCarePlan(id: string, data: Partial<CarePlan>): Promise<CarePlan> {
  return apiRequest("PUT", `/api/care-plans/${id}`, data);
}

export async function deleteCarePlan(id: string): Promise<void> {
  return apiRequest("DELETE", `/api/care-plans/${id}`);
} 