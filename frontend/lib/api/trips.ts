import { apiClient } from "./client";
import { Trip, Stop, TripActivity } from "./types";

// TODO: Verify these route paths map to the real backend

export interface GetTripsParams {
  cursor?: number;
  limit?: number;
  status?: string;
  sortBy?: string;
  sortOrder?: string;
  search?: string;
}

export function getTrips(params?: GetTripsParams): Promise<{ data: Trip[]; nextCursor: number | null }> {
  const searchParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "") searchParams.append(key, value.toString());
    });
  }
  return apiClient(`/trips?${searchParams.toString()}`);
}

export function getTrip(id: string): Promise<Trip> {
  return apiClient(`/trips/${id}`);
}

export function createTrip(data: Partial<Trip>): Promise<Trip> {
  return apiClient("/trips", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateTrip(id: string, data: Partial<Trip>): Promise<Trip> {
  return apiClient(`/trips/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteTrip(id: string): Promise<void> {
  return apiClient(`/trips/${id}`, {
    method: "DELETE",
  });
}

// Itinerary / Stops nested under trips
export function addStop(tripId: string, data: Partial<Stop>): Promise<Stop> {
  return apiClient(`/trips/${tripId}/stops`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function reorderStops(tripId: string, orderData: { id: string; sortOrder: number }[]): Promise<void> {
  // TODO: Verify the bulk reorder path or if it's done stop by stop
  return apiClient(`/trips/${tripId}/stops/reorder`, {
    method: "PUT",
    body: JSON.stringify({ items: orderData }),
  });
}

export function deleteStop(tripId: string, stopId: string): Promise<void> {
  return apiClient(`/trips/${tripId}/stops/${stopId}`, {
    method: "DELETE",
  });
}
