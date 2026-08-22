"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

// Routes that do NOT require authentication
const isPublicRoute = (path: string) => {
  if (
    path === "/" ||
    path === "/login" ||
    path === "/signup" ||
    path === "/forgot-password" ||
    path === "/cities" ||
    path === "/community" ||
    path === "/terms" ||
    path === "/privacy" ||
    path === "/dev/components" ||
    path.startsWith("/trip/")
  ) {
    return true;
  }
  return false;
};

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isPublicRoute(pathname)) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  // Render a subtle paper skeleton while checking auth status
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <div className="bg-kraft/40 w-48 h-24 border-2 border-dashed border-kraft animate-pulse rounded-sm flex items-center justify-center font-display text-lg text-ink/40">
          Loading journal...
        </div>
      </div>
    );
  }

  // If unauthenticated and on a protected route, render nothing until redirect happens
  if (!isAuthenticated && !isPublicRoute(pathname)) {
    return null;
  }

  return <>{children}</>;
}
