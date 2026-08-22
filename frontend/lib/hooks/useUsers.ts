import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProfile, deleteAccount } from "../api/users";
import { useRouter } from "next/navigation";

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      // Update the auth user cache
      queryClient.setQueryData(["auth", "me"], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          user: data,
        };
      });
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      localStorage.removeItem("accessToken");
      queryClient.clear(); // Clear all cached data
      router.push("/");
    },
  });
}
