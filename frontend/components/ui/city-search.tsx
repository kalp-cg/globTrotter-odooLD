"use client";

import React, { useState, useRef, useMemo } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useCities } from "@/lib/hooks/useCities";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { City } from "@/lib/api/types";
import { LuggageTag } from "./luggage-tag";
import { StampButton } from "./stamp-button";
import { PaperSkeleton } from "./paper-skeleton";
import * as Icons from "./icons";

interface CitySearchProps {
  onSelectCity: (city: City) => void;
  className?: string;
}

const REGIONS = ["Europe", "Asia", "North America", "South America", "Africa", "Oceania", "Middle East"];

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400&q=80", // Paris
  "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&q=80", // London
  "https://images.unsplash.com/photo-1496442226666-8d4d0e57f599?w=400&q=80", // NYC
  "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=400&q=80", // Tokyo
  "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=400&q=80", // Sydney
  "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&q=80", // Dubai
  "https://images.unsplash.com/photo-1504609774514-a95e791b96a7?w=400&q=80", // San Francisco
  "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=400&q=80", // Singapore
  "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400&q=80", // Rome
  "https://images.unsplash.com/photo-1506159904225-f958448373b5?w=400&q=80", // Kyoto
];

const getCityFallbackImage = (cityName: string) => {
  let hash = 0;
  for (let i = 0; i < cityName.length; i++) {
    hash = cityName.charCodeAt(i) + ((hash << 5) - hash);
  }
  return FALLBACK_IMAGES[Math.abs(hash) % FALLBACK_IMAGES.length];
};

export function CitySearch({ onSelectCity, className = "" }: CitySearchProps) {
  const [search, setSearch] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  
  const debouncedSearch = useDebounce(search, 300);

  // We rely on React Query's built in abort signal handling in the hook
  const { data: cities, isLoading } = useCities(
    useMemo(() => {
      const params: Record<string, string> = {};
      if (debouncedSearch) params.search = debouncedSearch;
      if (selectedRegion) params.region = selectedRegion;
      return params;
    }, [debouncedSearch, selectedRegion])
  );

  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: cities?.length || 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 130, // Estimated height of a row
    overscan: 5,
  });

  return (
    <div className={`flex flex-col h-full min-h-0 ${className}`}>
      
      {/* Search Header */}
      <div className="shrink-0 mb-6 space-y-4">
        {/* Luggage Tag Input */}
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center border-r-2 border-dashed border-kraft">
            <div className="w-3 h-3 rounded-full bg-paper border-2 border-kraft shadow-inner" />
          </div>
          <input 
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search destination..."
            className="w-full bg-kraft/10 font-display text-xl text-ink placeholder:text-ink/40 border-2 border-kraft rounded-r-lg pl-12 pr-4 py-3 focus:outline-none focus:border-postal transition-colors shadow-sm"
          />
          <Icons.Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink/30" />
        </div>

        {/* Region Filter Chips (Stamp Style) */}
        <div className="flex flex-wrap gap-2">
          {REGIONS.map(region => {
            const isSelected = selectedRegion === region;
            return (
              <button
                key={region}
                onClick={() => setSelectedRegion(isSelected ? null : region)}
                className={`
                  font-display text-sm px-3 py-1 border-2 transition-all transform hover:-translate-y-0.5
                  ${isSelected 
                    ? "border-postal text-postal bg-postal/10 rotate-1 shadow-sm" 
                    : "border-kraft text-ink/60 hover:text-ink hover:border-ink/40 -rotate-1"}
                `}
                style={{
                  borderRadius: "2px",
                  borderStyle: isSelected ? "solid" : "dashed"
                }}
              >
                {region}
              </button>
            )
          })}
        </div>
      </div>

      {/* Results List */}
      <div 
        ref={parentRef} 
        className="flex-1 min-h-0 overflow-y-auto pr-2"
      >
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <PaperSkeleton key={i} className="w-full h-[100px]" />
            ))}
          </div>
        ) : cities && cities.length > 0 ? (
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualItem) => {
              const city = cities[virtualItem.index];
              return (
                <div
                  key={virtualItem.key}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualItem.size}px`,
                    transform: `translateY(${virtualItem.start}px)`,
                    paddingBottom: '16px' // Gap replacement
                  }}
                >
                  <div className="h-full bg-paper border-2 border-kraft shadow-sm p-3 flex items-center gap-4 group transition-colors hover:border-postal/50">
                    {/* Thumbnail */}
                    <div className="w-16 h-16 shrink-0 bg-kraft overflow-hidden rounded-sm border border-ink/20 transform -rotate-2 group-hover:rotate-0 transition-transform">
                      <img 
                        src={city.imageUrl || getCityFallbackImage(city.name)}
                        alt={city.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display text-xl text-ink truncate">{city.name}</h3>
                      <p className="font-body text-sm text-ink/60 truncate">{city.country}</p>
                    </div>

                    {/* Stats */}
                    <div className="hidden md:flex flex-col gap-1 items-end shrink-0">
                      <LuggageTag text={`Cost: ${city.costIndex ?? city.cost_index ?? '?'}/5`} className="bg-kraft/50 text-ink text-xs py-0.5 px-2" />
                      <LuggageTag text={`Pop: ${city.popularityScore ?? city.popularity_score ?? '?'}`} className="bg-postal/10 text-postal text-xs py-0.5 px-2" />
                    </div>

                    {/* Action */}
                    <div className="shrink-0 ml-2">
                      <StampButton onClick={() => onSelectCity(city)} className="py-1.5 px-3 text-sm">
                        + Add
                      </StampButton>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-48 text-center px-4 border-2 border-dashed border-kraft bg-kraft/10">
            <Icons.Compass className="w-12 h-12 text-ink/30 mb-4" />
            <p className="font-display text-2xl text-ink/60">No destinations match "{search}"</p>
            <p className="font-body text-sm text-ink/40 mt-1">Try adjusting your filters or search term.</p>
          </div>
        )}
      </div>

    </div>
  );
}
