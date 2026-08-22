import { ApiError } from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

/**
 * Single typed API client for GlobeTrotter.
 * Every API function calls through this. 
 */
export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  
  // Attach credentials (httpOnly cookies) by default for cross-origin requests
  const config: RequestInit = {
    ...options,
    credentials: "true" === process.env.NEXT_PUBLIC_USE_BEARER ? "omit" : "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  // If using bearer tokens instead of cookies (swap this logic if needed)
  if (typeof window !== "undefined" && "true" === process.env.NEXT_PUBLIC_USE_BEARER) {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
  }

  let response: Response;
  try {
    response = await fetch(url, config);
  } catch (err: any) {
    // Network error or fetch failure
    const networkError: ApiError = {
      message: err.message || "Network error occurred.",
      status: 0,
    };
    throw networkError;
  }

  if (!response.ok) {
    // Normalize error shape
    let errorMsg = `API error: ${response.statusText}`;
    try {
      const errorBody = await response.json();
      errorMsg = errorBody.message || errorBody.error || errorMsg;
    } catch {
      // Ignored if body is not JSON
    }
    const apiError: ApiError = {
      message: errorMsg,
      status: response.status,
    };
    throw apiError;
  }

  // Handle empty responses
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}
