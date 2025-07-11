import { apiRequest } from './apiRequest';

export interface ClearLogsResponse {
  success: boolean;
  message: string;
  clearedCounts: {
    auditLogs: number;
    errorLogs: number;
    activityLogs: number;
  };
}

/**
 * Clear all system logs
 */
export const clearSystemLogs = async (): Promise<ClearLogsResponse> => {
  return apiRequest('DELETE', '/api/system/clear-logs');
}; 