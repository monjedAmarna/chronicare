// Health Metrics API module
import { apiRequest } from "./apiRequest";

export interface HealthMetric {
  id: string;
  userId: string;
  type: string;
  value: string;
  unit: string;
  recordedAt: string;
  notes?: string;
}

export async function getHealthMetrics(): Promise<HealthMetric[]> {
  return apiRequest("GET", "/api/health-metrics");
}

export async function createHealthMetric(data: Omit<HealthMetric, "id">): Promise<HealthMetric> {
  return apiRequest("POST", "/api/health-metrics", data);
}

export async function updateHealthMetric(id: string, data: Partial<HealthMetric>): Promise<HealthMetric> {
  return apiRequest("PUT", `/api/health-metrics/${id}`, data);
}

export async function deleteHealthMetric(id: string): Promise<void> {
  return apiRequest("DELETE", `/api/health-metrics/${id}`);
} 