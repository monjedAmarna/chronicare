import { useQuery } from "@tanstack/react-query";
import { getAlerts, Alert } from "@/api/alerts.api";

export function useAlertsQuery() {
  return useQuery<Alert[], Error>({
    queryKey: ["alerts"],
    queryFn: getAlerts,
    staleTime: 0,
    cacheTime: 0,
    refetchOnWindowFocus: true,
  });
} 