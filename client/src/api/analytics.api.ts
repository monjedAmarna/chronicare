import { apiRequest } from "./apiRequest";

export interface AnalyticsData {
  date: string;
  activeUsers: number;
  appointments: number;
  alertsTriggered: number;
}

export async function getAnalyticsData(startDate?: string, endDate?: string): Promise<AnalyticsData[]> {
  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  
  const queryString = params.toString();
  const url = queryString ? `/api/analytics?${queryString}` : '/api/analytics';
  
  return apiRequest("GET", url);
} 

export interface PatientHealthSummary {
  averageGlucose: string | null;
  averageSystolic: string | null;
  averageDiastolic: string | null;
  totalAlerts: number; // This is now non-critical alerts only
  criticalAlerts: number;
}

export async function getPatientHealthSummary(): Promise<PatientHealthSummary> {
  return apiRequest("GET", "/api/analytics/patient-summary");
} 