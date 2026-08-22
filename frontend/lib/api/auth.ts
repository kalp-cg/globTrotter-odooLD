import { apiClient } from "./client";
import { User } from "./types";

// TODO: Verify the login endpoint path (/auth/login) matches the backend
export function login(data: any): Promise<{ user: User; accessToken?: string; refreshToken?: string }> {
  return apiClient("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// TODO: Verify the signup endpoint path (/auth/signup) matches the backend
export function signup(data: any): Promise<{ user: User; accessToken?: string; refreshToken?: string }> {
  return apiClient("/auth/signup", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// TODO: Verify logout endpoint path (/auth/logout)
export function logout(): Promise<void> {
  return apiClient("/auth/logout", {
    method: "POST",
  });
}

// TODO: Verify 'me' endpoint path (/users/me) 
export function getMe(): Promise<User> {
  return apiClient("/users/me", {
    method: "GET",
  });
}
