import { useQuery } from "@tanstack/react-query";
import { getAnalyticsData, AnalyticsData } from "@/api/analytics.api";

export function useAnalyticsQuery(startDate: string = "", endDate: string = "") {
  return useQuery<AnalyticsData[], Error>({
    queryKey: ["analytics", startDate, endDate],
    queryFn: () => getAnalyticsData(startDate, endDate),
  });
} 