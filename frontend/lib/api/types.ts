export interface Trip {
  id: string;
  name: string;
  description?: string;
  coverPhotoUrl?: string;
  startDate?: string;
  endDate?: string;
  isPublic: boolean;
  shareSlug?: string;
  stops?: Stop[];
}

export interface Stop {
  id: string;
  tripId: string;
  cityId: string;
  city?: City;
  startDate?: string;
  endDate?: string;
  sortOrder: number;
  activities?: TripActivity[];
}

export interface City {
  id: string;
  name: string;
  country: string;
  region?: string;
  costIndex?: number;
  popularityScore?: number;
  imageUrl?: string;
}

export interface Activity {
  id: string;
  cityId: string;
  name: string;
  category?: string;
  estimatedCost?: number;
  estimatedDuration?: number; // in minutes
  description?: string;
  imageUrl?: string;
}

export interface TripActivity {
  id: string;
  stopId: string;
  activityId: string;
  activity?: Activity;
  scheduledDate?: string;
  scheduledTime?: string; // HH:mm
  sortOrder: number;
  actualCost?: number;
}

export interface Expense {
  id: string;
  tripId: string;
  category: string;
  amount: number;
  note?: string;
  date?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  isAdmin: boolean;
}

export interface ApiError {
  message: string;
  status: number;
}
