import { useQuery } from "@tanstack/react-query";
import { getActivities, getActivity } from "../api/activities";

export function useActivities(cityId?: string) {
  return useQuery({
    queryKey: ["activities", { cityId }],
    queryFn: () => getActivities(cityId),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

export function useActivity(activityId: string) {
  return useQuery({
    queryKey: ["activities", activityId],
    queryFn: () => getActivity(activityId),
    enabled: !!activityId,
    staleTime: 1000 * 60 * 60,
  });
}
