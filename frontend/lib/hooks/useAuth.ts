import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { login, signup, logout, getMe } from "../api/auth";
import { useRouter } from "next/navigation";

export function useAuth() {
  const query = useQuery({
    queryKey: ["auth", "me"],
    queryFn: getMe,
    retry: false, // Don't retry if unauthenticated
    staleTime: 5 * 60 * 1000,
  });

  const rawData: any = query.data;
  const user = rawData?.user ? rawData.user : rawData;

  return {
    user,
    authData: rawData,
    isLoading: query.isLoading,
    error: query.error,
    isAuthenticated: !!query.data,
  };
}

export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: login,
    onSuccess: (data: any) => {
      if (data.accessToken) localStorage.setItem("accessToken", data.accessToken);
      queryClient.setQueryData(["auth", "me"], data);
      router.push("/");
    },
  });
}

export function useSignup() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: signup,
    onSuccess: (data: any) => {
      if (data.accessToken) localStorage.setItem("accessToken", data.accessToken);
      queryClient.setQueryData(["auth", "me"], data);
      router.push("/");
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      localStorage.removeItem("accessToken");
      queryClient.setQueryData(["auth", "me"], null);
      queryClient.clear(); // Clear all cached data
      router.push("/login");
    },
  });
}
