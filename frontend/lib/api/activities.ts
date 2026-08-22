import { apiClient } from "./client";
import { Activity } from "./types";

// TODO: Verify activities endpoint path
export function getActivities(params?: Record<string, string | number>, options?: RequestInit): Promise<Activity[]> {
  const query = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : "";
  return apiClient(`/activities${query}`, options);
}

export function getActivity(id: string): Promise<Activity> {
  return apiClient(`/activities/${id}`);
}
