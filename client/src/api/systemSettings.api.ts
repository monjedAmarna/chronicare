import { apiRequest } from './apiRequest';

export interface SystemSettings {
  system_name: string;
  default_language: string;
  notification_email: string;
  max_alerts_displayed: string;
  maintenance_mode: string;
  session_timeout_minutes: string;
  max_login_attempts: string;
  password_min_length: string;
}

export interface UpdateSettingsRequest {
  settings: Partial<SystemSettings>;
}

/**
 * Get all system settings
 */
export const getSystemSettings = async (): Promise<SystemSettings> => {
  const response = await apiRequest('GET', '/api/system/settings');
  return response.data;
};

/**
 * Update system settings
 */
export const updateSystemSettings = async (settings: Partial<SystemSettings>): Promise<SystemSettings> => {
  const response = await apiRequest('PUT', '/api/system/settings', {
    settings
  });
  return response.data;
};

/**
 * Initialize default system settings
 */
export const initializeSystemSettings = async (): Promise<SystemSettings> => {
  const response = await apiRequest('POST', '/api/system/settings/initialize');
  return response.data;
}; 