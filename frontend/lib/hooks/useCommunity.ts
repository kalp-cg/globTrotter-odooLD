import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCommunityPosts, createCommunityPost, copySharedTrip, CommunityPost } from "../api/community";

export function useCommunityPosts(params?: { search?: string; sort?: string }) {
  return useQuery({
    queryKey: ["community", params],
    queryFn: () => getCommunityPosts(params),
    staleTime: 30 * 1000,
  });
}

export function useCreateCommunityPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCommunityPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community"] });
    },
  });
}

export function useCopySharedTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slug: string) => copySharedTrip(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
    },
  });
}
