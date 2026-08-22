import { apiClient } from "./client";
import { City } from "./types";

// TODO: Verify cities endpoint path
export function getCities(params?: Record<string, string>, options?: RequestInit): Promise<City[]> {
  const query = params ? `?${new URLSearchParams(params).toString()}` : "";
  return apiClient(`/cities${query}`, options);
}

export function getCity(id: string): Promise<City> {
  return apiClient(`/cities/${id}`);
}
