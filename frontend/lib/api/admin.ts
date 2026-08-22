import { apiClient } from "./client";

export function getAdminStats() {
  return apiClient("/admin/stats");
}

export function getAdminTrends() {
  return apiClient("/admin/trends");
}

export function getAdminTopCities() {
  return apiClient("/admin/top-cities");
}

export function getAdminTopActivities() {
  return apiClient("/admin/top-activities");
}

export function getAdminUsers() {
  return apiClient("/admin/users");
}

export function getAdminUserTrips(userId: string) {
  return apiClient(`/admin/users/${userId}/trips`);
}

export function deleteAdminUser(userId: string) {
  return apiClient(`/admin/users/${userId}`, { method: "DELETE" });
}

export function toggleAdminRole(userId: string) {
  return apiClient(`/admin/users/${userId}/role`, { method: "PUT" });
}
