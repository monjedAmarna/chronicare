// Reports API module
import { apiRequest } from "./apiRequest";

export interface HealthDataPoint {
  id: string;
  userId: number;
  type: string;
  value: string;
  unit?: string;
  recordedAt: string;
  notes?: string;
}

export interface ReportStats {
  totalPatients: number;
  totalAppointments: number;
  averageGlucose: number;
  averageBloodPressure: {
    systolic: number;
    diastolic: number;
  };
  totalAlerts: number;
}

export interface TrendDataPoint {
  date: string;
  type: 'glucose' | 'systolic' | 'diastolic';
  average: number;
}

export async function getHealthData(startDate?: string, endDate?: string, searchTerm?: string, metricType?: string): Promise<HealthDataPoint[]> {
  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  if (searchTerm) params.append("searchTerm", searchTerm);
  if (metricType) params.append("metricType", metricType);
  return apiRequest("GET", `/api/reports/health-data?${params.toString()}`);
}

export async function getReportStats(): Promise<ReportStats> {
  return apiRequest("GET", "/api/reports/stats");
}

export async function getRecentTrends(): Promise<TrendDataPoint[]> {
  return apiRequest("GET", "/api/analytics/recent-trends");
}

export async function exportReport(format: "pdf" | "csv", data: any): Promise<Blob> {
  return apiRequest("POST", `/api/reports/export/${format}`, data);
} 