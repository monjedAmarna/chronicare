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
  metrics?: Array<{
    type: string;
    value: string;
    createdAt: string;
  }>;
}

export async function getPatientHealthSummary(): Promise<PatientHealthSummary> {
  console.log("🔍 Frontend API: Calling getPatientHealthSummary");
  try {
    const response = await apiRequest("GET", "/api/analytics/patient-summary");
    console.log("🔍 Frontend API: Received response:", response);
    return response;
  } catch (error) {
    console.error("❌ Frontend API Error:", error);
    throw error;
  }
} 