import { apiClient } from "./client";
import { Activity } from "./types";

// TODO: Verify activities endpoint path
export function getActivities(cityId?: string): Promise<Activity[]> {
  const query = cityId ? `?cityId=${cityId}` : "";
  return apiClient(`/activities${query}`);
}

export function getActivity(id: string): Promise<Activity> {
  return apiClient(`/activities/${id}`);
}
