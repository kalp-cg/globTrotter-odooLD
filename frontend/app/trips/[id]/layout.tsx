import React from "react";
import Link from "next/link";
import { headers } from "next/headers";

export default async function TripLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  // Note: Using headers to detect active route in layout is a bit hacky in App Router,
  // but we can use a client component for the tabs if we need exact active state.
  // For simplicity, we'll just style them so the active state relies on the page itself or simple visual hierarchy.
  
  return (
    <div className="min-h-screen bg-kraft/10 p-4 md:p-8 flex flex-col items-center">
      {/* Torn Paper Tabs */}
      <div className="w-full max-w-7xl flex gap-2 pl-4 md:pl-12 mb-[-2px] z-20 relative">
        <Link 
          href={`/trips/${id}`}
          className="bg-paper border-t-2 border-x-2 border-kraft px-6 py-3 rounded-t-sm font-display text-xl text-ink hover:bg-paper/80 transition-colors shadow-sm"
          style={{ clipPath: "polygon(0 0, 100% 0, 95% 100%, 5% 100%)" }}
        >
          Itinerary
        </Link>
        <Link 
          href={`/trips/${id}/budget`}
          className="bg-kraft/50 border-t-2 border-x-2 border-kraft/50 px-6 py-3 rounded-t-sm font-display text-xl text-ink/70 hover:bg-kraft/70 transition-colors"
          style={{ clipPath: "polygon(5% 0, 95% 0, 100% 100%, 0 100%)" }}
        >
          Budget
        </Link>
      </div>
      
      {/* The main page content (Journal spread) */}
      <div className="w-full relative z-10">
        {children}
      </div>
    </div>
  );
}
