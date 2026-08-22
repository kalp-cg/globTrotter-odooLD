"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { useInfiniteTrips } from "@/lib/hooks/useTrips";
import { TripManagementCard } from "@/components/ui/trip-management-card";
import { PaperSkeleton } from "@/components/ui/paper-skeleton";
import { Trip } from "@/lib/api/types";

type FilterStatus = "upcoming" | "past" | "all";
type SortBy = "start_date" | "name";

export default function MyTripsPage() {
  const [status, setStatus] = useState<FilterStatus>("all");
  const [sortBy, setSortBy] = useState<SortBy>("start_date");

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteTrips({ status, sortBy, limit: 10 });

  const trips = data?.pages.flatMap(page => page.data) || [];

  // Infinite scroll trigger
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop 
        >= document.documentElement.offsetHeight - 500
      ) {
        if (hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);


  return (
    <main className="min-h-screen max-w-6xl mx-auto px-4 sm:px-8 py-12 space-y-12">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b-2 border-kraft pb-2">
        <h1 className="font-display text-4xl text-ink">My Trips</h1>
        
        {/* Bookmarks Control Row */}
        <div className="flex gap-4 items-center">
          <div className="flex gap-1">
            {(["all", "upcoming", "past"] as const).map(s => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`
                  relative px-4 py-2 font-display text-lg uppercase transition-all
                  ${status === s ? 'text-paper bg-postal z-10 scale-105' : 'text-ink bg-kraft/40 hover:bg-kraft/60'}
                `}
                style={{
                  clipPath: "polygon(0% 0%, 100% 0%, 95% 100%, 5% 100%)",
                  transform: status === s ? 'translateY(-2px)' : 'translateY(0)'
                }}
              >
                {s}
              </button>
            ))}
          </div>
          
          <span className="text-kraft">|</span>
          
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="bg-transparent font-body text-ink border-b-2 border-dashed border-ink/40 outline-none uppercase text-sm tracking-wide py-1 cursor-pointer"
          >
            <option value="start_date">Sort by Date</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
          {[1, 2, 3].map(i => (
            <PaperSkeleton key={i} className="w-full max-w-[320px] mx-auto aspect-[3/4]" />
          ))}
        </div>
      ) : trips.length === 0 ? (
        <div className="text-center py-24 border-2 border-dashed border-kraft">
          <p className="font-display text-2xl text-ink/50">No trips found in this journal.</p>
        </div>
      ) : trips.length > 20 ? (
        <VirtualizedTripsGrid trips={trips} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
          {trips.map((trip, i) => (
            <div 
              key={trip.id} 
              style={{
                // Subtle varying rotation and offset for masonry feel
                transform: `rotate(${i % 2 === 0 ? -1.5 : 1.5}deg) translateY(${i % 3 === 1 ? '16px' : '0px'})`
              }}
            >
              <TripManagementCard trip={trip as Trip} />
            </div>
          ))}
        </div>
      )}

      {isFetchingNextPage && (
        <div className="flex justify-center pt-8">
          <div className="w-8 h-8 rounded-full border-4 border-kraft border-t-postal animate-spin" />
        </div>
      )}
      
    </main>
  );
}

// Dedicated Virtualized Wrapper for > 20 items
function VirtualizedTripsGrid({ trips }: { trips: any[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  // A naive 1D virtualizer for demo purposes. 
  // In a real responsive grid, we'd calculate rows based on clientWidth.
  // Assuming ~3 columns on desktop for height calculations.
  const COLUMNS = 3; 
  const rowCount = Math.ceil(trips.length / COLUMNS);

  const virtualizer = useWindowVirtualizer({
    count: rowCount,
    estimateSize: () => 450, // Approx height of a TripManagementCard + gap
    overscan: 2,
  });

  return (
    <div ref={parentRef} style={{ position: "relative", height: `${virtualizer.getTotalSize()}px`, width: "100%" }}>
      {virtualizer.getVirtualItems().map((virtualRow) => {
        const startIndex = virtualRow.index * COLUMNS;
        const rowTrips = trips.slice(startIndex, startIndex + COLUMNS);
        
        return (
          <div
            key={virtualRow.index}
            className="absolute top-0 left-0 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12"
            style={{
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            {rowTrips.map((trip, idx) => {
              const globalIndex = startIndex + idx;
              return (
                <div 
                  key={trip.id}
                  style={{
                    transform: `rotate(${globalIndex % 2 === 0 ? -1.5 : 1.5}deg) translateY(${globalIndex % 3 === 1 ? '16px' : '0px'})`
                  }}
                >
                  <TripManagementCard trip={trip as Trip} />
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
