"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { useTrips } from "@/lib/hooks/useTrips";
import { useCities } from "@/lib/hooks/useCities";
import { StampButton } from "@/components/ui/stamp-button";
import { PolaroidCard } from "@/components/ui/polaroid-card";
import { RouteLine } from "@/components/ui/route-line";
import { LuggageTag } from "@/components/ui/luggage-tag";
import { PaperSkeleton } from "@/components/ui/paper-skeleton";
import * as Icons from "@/components/ui/icons";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  
  const { data: tripsPayload, isLoading: isTripsLoading } = useTrips();
  const trips = tripsPayload?.data;
  // Fetch popular cities (mocking the sort param for the API)
  const { data: cities, isLoading: isCitiesLoading } = useCities({ sort: "popular", limit: "5" });

  // Compute a simple derived budget total across upcoming trips
  // In a real app this might come from the backend or detailed activity sum
  const budgetSummary = useMemo(() => {
    if (!trips) return { total: 0, status: "good" as const };
    let total = 0;
    trips.forEach(trip => {
      trip.stops?.forEach(stop => {
        stop.activities?.forEach(act => {
          total += act.estimatedCost || 0;
        });
      });
    });
    // Faking status color based on an arbitrary threshold for the demo
    const status = total > 5000 ? "over" : total > 3000 ? "warning" : "good";
    return { total, status };
  }, [trips]);

  if (isAuthLoading) {
    return (
      <main className="p-8 max-w-5xl mx-auto space-y-12 min-h-screen">
        <PaperSkeleton className="w-64 h-24" />
        <div className="flex gap-6 overflow-hidden">
          <PaperSkeleton className="w-64 aspect-[4/3] shrink-0" />
          <PaperSkeleton className="w-64 aspect-[4/3] shrink-0" />
          <PaperSkeleton className="w-64 aspect-[4/3] shrink-0" />
        </div>
      </main>
    );
  }

  // Ensure upcoming trips are sorted by date (ascending)
  const upcomingTrips = [...(trips || [])].sort((a, b) => {
    return new Date(a.startDate || "").getTime() - new Date(b.startDate || "").getTime();
  });

  return (
    <main className="min-h-screen max-w-6xl mx-auto px-4 sm:px-8 py-12 space-y-16 overflow-x-hidden">
      
      {/* Top Header Section */}
      <section className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8 relative z-20">
        <div 
          className="bg-paper p-6 border border-kraft/40 shadow-[0_2px_10px_rgba(0,0,0,0.02)]"
          style={{ transform: "rotate(-2deg)", clipPath: "polygon(1% 1%, 98% 3%, 99% 98%, 2% 99%)" }}
        >
          {/* Faux pin */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-postal border-2 border-ink shadow-sm" />
          <h1 className="font-display text-5xl text-ink leading-none mt-2">
            Welcome back,<br/>
            <span className="text-postal">{user?.name || "Traveler"}</span>
          </h1>
        </div>

        <StampButton 
          variant="primary" 
          className="text-xl px-8 py-4 sm:mr-8"
          style={{ transform: "rotate(3deg)" }}
          onClick={() => router.push("/trips/new")}
        >
          <span className="flex items-center gap-2">
            <Icons.Plus className="w-5 h-5" /> Plan new trip
          </span>
        </StampButton>
      </section>

      {/* Upcoming Trips Strip */}
      <section className="relative z-10">
        <h2 className="font-display text-3xl text-ink mb-6 px-4">Upcoming Journeys</h2>
        
        {isTripsLoading ? (
          <div className="flex gap-8 px-4 overflow-hidden">
            {[1, 2, 3].map(i => <PaperSkeleton key={i} className="w-[280px] h-[320px] shrink-0" />)}
          </div>
        ) : upcomingTrips.length === 0 ? (
          /* Empty State */
          <div 
            className="mx-4 bg-paper min-h-[300px] border-2 border-kraft/40 border-dashed flex flex-col items-center justify-center p-8 text-center cursor-pointer hover:bg-kraft/10 transition-colors"
            style={{ borderRadius: "2px", transform: "rotate(1deg)" }}
            onClick={() => router.push("/trips/new")}
          >
            <Icons.Plus className="w-16 h-16 text-ink/30 mb-4" />
            <p className="font-display text-2xl text-ink/60">No trips yet — plan your first one</p>
          </div>
        ) : (
          /* Horizontal Scroll Strip */
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-16 pb-12 pt-4 px-4 items-center no-scrollbar relative">
            {upcomingTrips.map((trip, index) => (
              <div key={trip.id} className="snap-center shrink-0 relative group cursor-pointer" onClick={() => router.push(`/trips/${trip.id}`)}>
                <PolaroidCard 
                  id={trip.id} 
                  caption={trip.name} 
                  imageUrl={trip.coverPhotoUrl} 
                  className="w-[260px] md:w-[280px] transition-transform group-hover:scale-105 group-focus-visible:ring-4 group-focus-visible:ring-marigold" 
                />
                
                {/* Route Line connecting to next card */}
                {index < upcomingTrips.length - 1 && (
                  <div className="absolute top-1/2 -right-[4.5rem] w-16 h-12 -translate-y-1/2 -z-10 pointer-events-none opacity-50">
                    <RouteLine startX={0} startY={24} endX={64} endY={24} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Lower Dashboard Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-8 relative z-0">
        
        {/* Popular Destinations */}
        <section className="lg:col-span-2">
          <h2 className="font-display text-3xl text-ink mb-6 px-4">Popular destinations</h2>
          
          {isCitiesLoading ? (
            <div className="flex gap-6 px-4 overflow-hidden">
              {[1, 2, 3].map(i => <PaperSkeleton key={i} className="w-[220px] h-[280px] shrink-0" />)}
            </div>
          ) : (
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-8 pb-12 pt-4 px-4 items-center no-scrollbar">
              {(cities || []).map(city => (
                <div key={city.id} className="snap-center shrink-0 relative group cursor-pointer">
                  <PolaroidCard 
                    id={city.id} 
                    caption={city.name} 
                    imageUrl={city.imageUrl} 
                    className="w-[200px] md:w-[220px] transition-transform group-hover:-translate-y-2 group-focus-visible:ring-4 group-focus-visible:ring-marigold" 
                  />
                  {city.costIndex && (
                    <div className="absolute -bottom-4 right-2 z-10">
                      <LuggageTag label="Cost Index" value={`$${city.costIndex}/day`} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Budget at a glance */}
        <section className="px-4">
          <h2 className="font-display text-3xl text-ink mb-6">Budget at a glance</h2>
          <div 
            className="bg-paper p-8 border border-kraft/50 relative"
            style={{ transform: "rotate(1deg)", clipPath: "polygon(0% 1%, 100% 0%, 99% 100%, 1% 99%)" }}
          >
            {/* Shadow */}
            <div className="absolute inset-0 bg-kraft -z-10" style={{ transform: "rotate(-2deg) translate(-4px, 4px)" }} />
            
            <div className="flex flex-col gap-4">
              <div>
                <span className="font-mono text-xs uppercase tracking-wider text-ink/60">Total Est. Spend</span>
                <p className="font-display text-5xl text-ink mt-1">
                  ${budgetSummary.total.toLocaleString()}
                </p>
              </div>

              <div className="pt-4 border-t-2 border-kraft/50 border-dashed mt-2 flex items-center gap-3">
                {/* Status Indicator */}
                <div className={`w-4 h-4 rounded-full border-2 border-ink ${
                  budgetSummary.status === "good" ? "bg-moss" : 
                  budgetSummary.status === "warning" ? "bg-marigold" : "bg-postal"
                }`} />
                <span className="font-body text-ink font-bold">
                  {budgetSummary.status === "good" ? "On track" : 
                   budgetSummary.status === "warning" ? "Nearing budget limit" : "Trending over budget"}
                </span>
              </div>
            </div>
          </div>
        </section>
        
      </div>

    </main>
  );
}
