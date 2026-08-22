export interface Trip {
  id: string;
  user_id?: string;
  userId?: string;
  name: string;
  description?: string;
  coverPhotoUrl?: string;
  cover_photo_url?: string;
  startDate?: string;
  start_date?: string;
  endDate?: string;
  end_date?: string;
  isPublic?: boolean;
  is_public?: boolean;
  shareSlug?: string;
  public_slug?: string;
  stops?: Stop[];
  stops_count?: number | string;
  activities_count?: number | string;
  total_cost?: number | string;
  status?: string;
  budget?: {
    transport_cost?: string | number;
    stay_cost?: string | number;
    activities_cost?: string | number;
    meals_cost?: string | number;
    total_cost?: string | number;
  };
  created_at?: string;
}

export interface Stop {
  id: string;
  tripId?: string;
  trip_id?: string;
  cityId?: string;
  city_id?: string;
  title?: string;
  notes?: string;
  arrivalDate?: string;
  arrival_date?: string;
  departureDate?: string;
  departure_date?: string;
  sectionBudget?: number;
  section_budget?: number | string;
  orderIndex?: number;
  order_index?: number;
  sortOrder?: number;
  cityName?: string;
  city_name?: string;
  cityCountry?: string;
  city_country?: string;
  cityRegion?: string;
  city_region?: string;
  cityImageUrl?: string;
  city_image_url?: string;
  cityCostIndex?: number;
  city_cost_index?: number;
  city?: City;
  activities?: TripActivity[];
}

export interface City {
  id: string;
  name: string;
  country: string;
  region?: string;
  costIndex?: number;
  cost_index?: number;
  popularityScore?: number;
  popularity_score?: number;
  imageUrl?: string;
  image_url?: string;
  description?: string;
}

export interface Activity {
  id: string;
  cityId?: string;
  city_id?: string;
  name: string;
  category?: string;
  description?: string;
  imageUrl?: string;
  image_url?: string;
  estCost?: number;
  est_cost?: number;
  estimatedCost?: number;
  estDurationMins?: number;
  est_duration_mins?: number;
  estimatedDuration?: number; // in minutes
}

export interface TripActivity {
  id?: string;
  stopId?: string;
  stop_id?: string;
  activityId?: string;
  activity_id?: string;
  stopActivityId?: string;
  stop_activity_id?: string;
  activityName?: string;
  activity_name?: string;
  category?: string;
  description?: string;
  imageUrl?: string;
  image_url?: string;
  estCost?: number;
  est_cost?: number;
  estimatedCost?: number;
  estDurationMins?: number;
  est_duration_mins?: number;
  activity?: Activity;
  scheduledDate?: string;
  scheduled_date?: string;
  scheduledTime?: string;
  scheduled_time?: string;
  sortOrder?: number;
  sort_order?: number;
  actualCost?: number;
  actual_cost?: number;
}

export interface Expense {
  id: string;
  tripId?: string;
  trip_id?: string;
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
  photo_url?: string;
  isAdmin?: boolean;
  is_admin?: boolean;
}

export interface ApiError {
  message: string;
  status: number;
}
