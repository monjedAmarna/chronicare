// Appointments API module
import { apiRequest } from "./apiRequest";

export async function getAppointments() {
  return apiRequest("GET", "/api/appointments");
}

export async function getAppointmentById(id: string) {
  return apiRequest("GET", `/api/appointments/${id}`);
}

export async function createAppointment(data: any) {
  return apiRequest("POST", "/api/appointments", data);
}

export async function updateAppointment(id: string, data: any) {
  return apiRequest("PUT", `/api/appointments/${id}`, data);
}

export async function deleteAppointment(id: string) {
  return apiRequest("DELETE", `/api/appointments/${id}`);
} 