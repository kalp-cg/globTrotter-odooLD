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
        
        <div className="flex items-center gap-8">
          <Link 
            href="/" 
            className="font-display text-2xl text-ink hover:text-postal transition-colors flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-marigold focus-visible:outline-none"
          >
            GlobeTrotter
          </Link>
          
          {user && (
            <nav className="hidden md:flex gap-6 items-center pt-1">
              <Link href="/trips" className={`font-display text-lg hover:text-postal transition-colors ${pathname.startsWith('/trips') ? 'text-postal border-b-2 border-postal' : 'text-ink/70'}`}>
                My Trips
              </Link>
              <Link href="/cities" className={`font-display text-lg hover:text-postal transition-colors ${pathname.startsWith('/cities') ? 'text-postal border-b-2 border-postal' : 'text-ink/70'}`}>
                Explore
              </Link>
              {user.is_admin && (
                <Link href="/admin" className={`font-display text-lg hover:text-postal transition-colors ${pathname.startsWith('/admin') ? 'text-postal border-b-2 border-postal' : 'text-ink/70'}`}>
                  Admin HQ
                </Link>
              )}
            </nav>
          )}
        </div>

        {user ? (
          <div className="flex items-center gap-4">
            <Link href="/trips/new" className="hidden sm:flex items-center justify-center border-2 border-postal text-postal hover:bg-postal/10 font-display text-lg px-4 py-1 transform -rotate-1 hover:rotate-0 transition-all shadow-sm bg-paper" style={{ borderRadius: '4px' }}>
              + Plan Trip
            </Link>
            <span className="hidden md:inline-block font-body text-ink/70 ml-2">
              {user.name}
            </span>
            <Link href="/settings" className="w-10 h-10 rounded-full bg-kraft/40 border-2 border-ink flex items-center justify-center overflow-hidden cursor-pointer hover:bg-kraft/60 hover:scale-105 transition-all shadow-sm">
              {user.photo_url ? (
                <img src={user.photo_url} alt={user.name} className="w-full h-full object-cover grayscale-[20%]" />
              ) : (
                <Icons.Passport className="w-5 h-5 text-ink/50" />
              )}
            </Link>
          </div>
        ) : (
          <Link href="/login" className="font-display text-lg text-ink hover:text-postal transition-colors border-2 border-dashed border-transparent hover:border-postal px-3 py-1">
            Log In
          </Link>
        )}
      </div>
    </header>
  );
}
