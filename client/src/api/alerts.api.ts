// Alerts API module
import { apiRequest } from "./apiRequest";

export interface Alert {
  id: number;
  title: string;
  message: string;
  userId: number;
  type: string;
  status?: string;
  value?: string;
  isRead: boolean;
  createdAt: string;
  user?: {
    id: number;
    name?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
}

export async function getAlerts(): Promise<Alert[]> {
  return apiRequest("GET", "/api/alerts");
}

export async function createAlert(data: Omit<Alert, "id" | "isRead" | "createdAt">): Promise<Alert> {
  return apiRequest("POST", "/api/alerts", data);
}

export async function updateAlert(id: string, data: Partial<Alert>): Promise<Alert> {
  return apiRequest("PUT", `/api/alerts/${id}`, data);
}

export async function deleteAlert(id: string): Promise<void> {
  return apiRequest("DELETE", `/api/alerts/${id}`);
}

export async function markAlertAsRead(id: string): Promise<Alert> {
  return apiRequest("PATCH", `/api/alerts/${id}/read`, { read: true });
} 