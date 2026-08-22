import { apiClient } from "./client";

export function updateProfile(data: any) {
  return apiClient("/users/me", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteAccount() {
  return apiClient("/users/me", {
    method: "DELETE",
  });
}
