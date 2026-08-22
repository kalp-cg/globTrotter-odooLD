"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

const publicRoutes = ["/login", "/signup", "/forgot-password", "/dev/components"];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !publicRoutes.includes(pathname)) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  // Optionally render a skeleton or paper texture block while checking auth
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="bg-kraft w-64 h-32 animate-pulse rounded-sm" />
      </div>
    );
  }

  // If unauthenticated and on a protected route, we render nothing until redirect happens
  if (!isAuthenticated && !publicRoutes.includes(pathname)) {
    return null;
  }

  return <>{children}</>;
}
