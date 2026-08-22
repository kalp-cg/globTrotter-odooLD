import { useQuery, useMutation } from "@tanstack/react-query";
import { getCities, getCity, ensureCity } from "../api/cities";

export function useCities(params?: Record<string, string>) {
  return useQuery({
    // Stable query key includes params so results cache across navigation
    queryKey: ["cities", params],
    queryFn: ({ signal }) => getCities(params, { signal }),
    // Reference/static data: long staleTime
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

export function useCity(cityId: string) {
  return useQuery({
    queryKey: ["cities", cityId],
    queryFn: () => getCity(cityId),
    enabled: !!cityId,
    staleTime: 1000 * 60 * 60,
  });
}

export function useEnsureCity() {
  return useMutation({
    mutationFn: ensureCity,
  });
}
