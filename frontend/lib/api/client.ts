/**
 * Single typed API client for GlobeTrotter
 * Every screen calls through this — never a raw fetch() inline in a component.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message || `API error: ${response.statusText}`);
  }

  return response.json();
}
