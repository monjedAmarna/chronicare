// Activities API module
import { apiRequest } from "./apiRequest";

export interface ActivityItem {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  patientName?: string;
}

export async function getActivities(): Promise<ActivityItem[]> {
  return apiRequest("GET", "/api/activities");
} 