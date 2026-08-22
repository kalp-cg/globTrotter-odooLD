"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import * as Icons from "@/components/ui/icons";

export function Navbar() {
  const { user } = useAuth();
  const pathname = usePathname();

  // Don't show navbar on auth screens
  if (pathname === "/login" || pathname === "/signup") {
    return null;
  }

  return (
    <header className="w-full bg-paper border-b-2 border-kraft shadow-[0_2px_10px_rgba(0,0,0,0.02)] sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
        
        <Link 
          href="/" 
          className="font-display text-2xl text-ink hover:text-postal transition-colors flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-marigold focus-visible:outline-none"
        >
          GlobeTrotter
        </Link>

        {user && (
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-block font-body text-ink/70">
              {user.name}
            </span>
            <div className="w-10 h-10 rounded-full bg-kraft/40 border-2 border-ink flex items-center justify-center overflow-hidden cursor-pointer hover:bg-kraft/60 transition-colors">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover grayscale-[20%]" />
              ) : (
                <Icons.Passport className="w-5 h-5 text-ink/50" />
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
