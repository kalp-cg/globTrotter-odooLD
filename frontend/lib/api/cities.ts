import { apiClient } from "./client";
import { City } from "./types";

// TODO: Verify cities endpoint path
export function getCities(params?: Record<string, string>): Promise<City[]> {
  const query = params ? `?${new URLSearchParams(params).toString()}` : "";
  return apiClient(`/cities${query}`);
}

export function getCity(id: string): Promise<City> {
  return apiClient(`/cities/${id}`);
}
