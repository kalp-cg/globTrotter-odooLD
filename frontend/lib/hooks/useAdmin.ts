import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getAdminStats, getAdminTrends, getAdminTopCities, getAdminTopActivities, getAdminUsers,
  getAdminUserTrips, deleteAdminUser, toggleAdminRole
} from "../api/admin";

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn: getAdminStats,
  });
}

export function useAdminTrends() {
  return useQuery({
    queryKey: ["admin", "trends"],
    queryFn: getAdminTrends,
  });
}

export function useAdminTopCities() {
  return useQuery({
    queryKey: ["admin", "top-cities"],
    queryFn: getAdminTopCities,
  });
}

export function useAdminTopActivities() {
  return useQuery({
    queryKey: ["admin", "top-activities"],
    queryFn: getAdminTopActivities,
  });
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ["admin", "users"],
    queryFn: getAdminUsers,
  });
}

export function useAdminUserTrips(userId: string | null) {
  return useQuery({
    queryKey: ["admin", "users", userId, "trips"],
    queryFn: () => getAdminUserTrips(userId!),
    enabled: !!userId,
  });
}

export function useToggleAdminRole() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: toggleAdminRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useDeleteAdminUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteAdminUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
}
