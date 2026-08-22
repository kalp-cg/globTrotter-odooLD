import { apiClient } from "./client";

export interface CommunityPost {
  id: string;
  user_id?: string;
  trip_id?: string;
  caption: string;
  image_url?: string;
  created_at?: string;
  user_name?: string;
  user_photo?: string;
  user_city?: string;
  user_country?: string;
  trip_name?: string;
  trip_slug?: string;
  trip_cover?: string;
}

export function getCommunityPosts(params?: { search?: string; sort?: string }): Promise<CommunityPost[]> {
  const searchParams = new URLSearchParams();
  if (params?.search) searchParams.append("search", params.search);
  if (params?.sort) searchParams.append("sort", params.sort);
  const q = searchParams.toString() ? `?${searchParams.toString()}` : "";
  return apiClient(`/community${q}`);
}

export function createCommunityPost(data: { trip_id?: string; caption: string; image_url?: string }): Promise<CommunityPost> {
  return apiClient("/community", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function copySharedTrip(slug: string): Promise<any> {
  return apiClient(`/share/view/${slug}/copy`, {
    method: "POST",
  });
}
