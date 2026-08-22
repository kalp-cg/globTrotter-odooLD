"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useTrip } from "@/lib/hooks/useTrips";
import { selectCostByDay, selectTotalCost } from "@/lib/selectors/budget";
import { formatCurrency, getSelectedCurrency, setSelectedCurrency, CurrencyCode, CURRENCY_RATES } from "@/lib/format/currency";
import { getImageByCityName } from "@/lib/constants/images";
import { PaperSkeleton } from "@/components/ui/paper-skeleton";
import { LuggageTag } from "@/components/ui/luggage-tag";
import * as Icons from "@/components/ui/icons";

export default function ItineraryJournalViewPage() {
  const { id } = useParams() as { id: string };
  const { data: trip, isLoading } = useTrip(id);

  const [search, setSearch] = useState("");
  const [selectedPlace, setSelectedPlace] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentCurrency, setCurrentCurrency] = useState<CurrencyCode>("USD");

  useEffect(() => {
    setCurrentCurrency(getSelectedCurrency());
    const handleCurr = () => setCurrentCurrency(getSelectedCurrency());
    window.addEventListener("currency_change", handleCurr);
    return () => window.removeEventListener("currency_change", handleCurr);
  }, []);

  const handleCurrencyChange = (curr: CurrencyCode) => {
    setSelectedCurrency(curr);
    setCurrentCurrency(curr);
  };

  const days = useMemo(() => {
    return selectCostByDay(trip);
  }, [trip]);

  const totalCost = useMemo(() => {
    return selectTotalCost(trip);
  }, [trip]);

  const stopOptions = useMemo(() => {
    if (!trip?.stops) return [];
    return trip.stops.map((s: any) => ({
      id: s.id,
      name: s.title || s.cityName || (s as any).city_name || "Section",
    }));
  }, [trip?.stops]);

  // Filtered days based on place, search, and category
  const filteredDays = useMemo(() => {
    return days.map((day) => {
      // Place filter
      if (selectedPlace !== "all") {
        const matchesPlace = day.stopNames.some(name => 
          name.toLowerCase().includes(selectedPlace.toLowerCase())
        );
        if (!matchesPlace) return null;
      }

      // Filter activities inside day
      const acts = day.activities.filter((act) => {
        const actName = (act.activityName || (act as any).name || "").toLowerCase();
        const actCat = (act.category || (act.activity && act.activity.category) || "").toLowerCase();
        
        const matchesSearch = !search || actName.includes(search.toLowerCase());
        const matchesCat = selectedCategory === "all" || actCat.includes(selectedCategory.toLowerCase());
        return matchesSearch && matchesCat;
      });

      return {
        ...day,
        filteredActivities: acts,
      };
    }).filter(Boolean) as (typeof days[0] & { filteredActivities: typeof days[0]["activities"] })[];
  }, [days, selectedPlace, search, selectedCategory]);

  const coverImage = useMemo(() => {
    if (trip?.coverPhotoUrl || (trip as any)?.cover_photo_url) {
      return trip.coverPhotoUrl || (trip as any).cover_photo_url;
    }
    return getImageByCityName(trip?.name || "Tokyo");
  }, [trip]);

  if (isLoading) {
    return (
      <div className="w-full bg-paper border border-kraft/40 shadow-xl p-6 md:p-10 space-y-6">
        <PaperSkeleton className="w-1/2 h-14" />
        <div className="space-y-4">
          <PaperSkeleton className="w-full h-32" />
          <PaperSkeleton className="w-full h-32" />
          <PaperSkeleton className="w-full h-32" />
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="w-full bg-paper border border-kraft/40 p-12 text-center">
        <p className="font-display text-2xl text-ink/60">Trip not found</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-paper border border-kraft/50 shadow-2xl p-4 sm:p-8 md:p-12 relative overflow-hidden print:p-0 print:border-none print:shadow-none"
         style={{ clipPath: "polygon(0% 0.5%, 99.8% 0%, 100% 99.5%, 0.2% 100%)" }}
    >
      {/* Visual Scrapbook Cover Photo Header */}
      {coverImage && (
        <div className="relative mb-6 h-48 sm:h-64 w-full overflow-hidden border-2 border-kraft shadow-inner"
             style={{ transform: "rotate(-0.5deg)" }}
        >
          <img
            src={coverImage}
            alt={trip.name}
            className="w-full h-full object-cover grayscale-[15%]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent flex items-end p-6">
            <div className="text-paper">
              <span className="font-mono text-xs uppercase tracking-widest text-paper/80 bg-ink/50 px-2 py-0.5">
                Official Scrapbook Spread
              </span>
              <h2 className="font-display text-3xl sm:text-4xl text-paper mt-1">{trip.name}</h2>
            </div>
          </div>
        </div>
      )}

      {/* Journal Ribbon Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b-2 border-dashed border-kraft gap-4">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-ink/60">Chronological Travel View</span>
          <h1 className="font-display text-3xl md:text-4xl text-ink mt-0.5">
            Itinerary for {selectedPlace === "all" ? trip.name : selectedPlace}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
          {/* Currency Switcher Dropdown */}
          <div className="flex items-center gap-1 bg-paper border border-kraft px-2 py-1 shadow-sm">
            <span className="font-mono text-xs text-ink/60">Currency:</span>
            <select
              value={currentCurrency}
              onChange={(e) => handleCurrencyChange(e.target.value as CurrencyCode)}
              className="bg-paper font-mono text-xs font-bold text-ink focus:outline-none cursor-pointer"
            >
              {Object.entries(CURRENCY_RATES).map(([code, meta]) => (
                <option key={code} value={code}>{meta.label}</option>
              ))}
            </select>
          </div>

          <LuggageTag label="Total Spend" value={formatCurrency(totalCost, currentCurrency)} className="bg-kraft/60 text-ink" />
          
          {/* Print Scrapbook Button */}
          <button
            onClick={() => window.print()}
            className="font-display text-sm text-ink border border-ink/40 bg-kraft/20 hover:bg-kraft/40 px-3 py-1.5 transition-colors flex items-center gap-1.5 cursor-pointer print:hidden"
            style={{ borderRadius: "2px" }}
          >
            🖨️ Print Journal
          </button>

          <Link
            href={`/trips/${trip.id}`}
            className="font-display text-sm text-postal border-2 border-postal hover:bg-postal/10 px-3 py-1.5 transition-colors print:hidden"
            style={{ borderRadius: "2px" }}
          >
            ✏️ Edit
          </Link>
        </div>
      </div>

      {/* Screen 9 Toolbar: Search bar, Group by, Filter, Sort by */}
      <div className="my-6 bg-kraft/15 p-4 border border-kraft flex flex-col md:flex-row items-center gap-4 justify-between print:hidden"
           style={{ transform: "rotate(-0.3deg)", borderRadius: "2px" }}
      >
        {/* Search */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search activities..."
            className="w-full bg-paper border-2 border-kraft px-3 py-1.5 pl-9 font-body text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:border-postal"
          />
          <Icons.Search className="w-4 h-4 text-ink/40 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        {/* Filters and Place Switcher */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Selected Place Filter */}
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-xs text-ink/60">Place:</span>
            <select
              value={selectedPlace}
              onChange={(e) => setSelectedPlace(e.target.value)}
              className="bg-paper border border-kraft text-xs font-display text-ink px-2.5 py-1.5 focus:outline-none focus:border-postal"
            >
              <option value="all">All Stops ({trip.stops?.length || 0})</option>
              {stopOptions.map((s: any) => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-xs text-ink/60">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-paper border border-kraft text-xs font-display text-ink px-2.5 py-1.5 focus:outline-none focus:border-postal"
            >
              <option value="all">All Types</option>
              <option value="Sightseeing">Sightseeing</option>
              <option value="Food">Food & Dining</option>
              <option value="Adventure">Adventure</option>
              <option value="Culture">Culture</option>
            </select>
          </div>
        </div>
      </div>

      {/* Two Column Table Layout Header */}
      <div className="hidden md:grid grid-cols-12 gap-6 pb-2 mb-4 border-b border-ink/20 font-mono text-xs uppercase tracking-widest text-ink/60">
        <div className="col-span-2">Day Marker</div>
        <div className="col-span-7">Physical Activity & Sequence</div>
        <div className="col-span-3 text-right">Expense Breakdown</div>
      </div>

      {/* Days & Sequence Content */}
      {filteredDays.length === 0 ? (
        <div className="py-16 text-center border-2 border-dashed border-kraft bg-kraft/10 my-4">
          <Icons.Compass className="w-12 h-12 text-ink/30 mx-auto mb-3" />
          <p className="font-display text-2xl text-ink/60">No scheduled itinerary items match your filters</p>
          <p className="font-body text-sm text-ink/40 mt-1">Try resetting the place or category search filter.</p>
        </div>
      ) : (
        <div className="space-y-10 mt-6">
          {filteredDays.map((day) => {
            const hasActs = day.filteredActivities.length > 0;

            return (
              <div key={day.dayNumber} className="relative pb-6 border-b border-dashed border-kraft/60 last:border-b-0">
                
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                  
                  {/* Day Tab Marker (Left) */}
                  <div className="md:col-span-2">
                    <div className="inline-flex md:flex flex-col items-start bg-kraft/40 border-2 border-ink px-3 py-2 shadow-[2px_2px_0px_#2E2A25]"
                         style={{ transform: `rotate(${day.dayNumber % 2 === 0 ? '-1.5deg' : '1.5deg'})` }}
                    >
                      <span className="font-display text-xl font-bold text-ink leading-tight">Day {day.dayNumber}</span>
                      <span className="font-mono text-xs text-ink/70 mt-0.5">{day.displayDate}</span>
                      {day.stopNames.length > 0 && (
                        <span className="font-body text-xs text-postal font-semibold mt-1">
                          📍 {day.stopNames.join(", ")}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Physical Activity Column (Middle) with Downward Sequence Flow Arrows */}
                  <div className="md:col-span-7 space-y-4">
                    <div className="md:hidden font-mono text-xs text-ink/50 uppercase tracking-widest mb-1">
                      Physical Activities:
                    </div>

                    {!hasActs ? (
                      <div className="p-4 bg-paper/60 border border-dashed border-kraft text-ink/50 font-body text-sm italic">
                        Free day for leisure / exploration. No fixed activities scheduled.
                      </div>
                    ) : (
                      day.filteredActivities.map((act, actIdx) => {
                        const cost = Number(act.actualCost ?? act.actual_cost ?? act.estCost ?? act.est_cost ?? act.estimatedCost ?? 0);
                        const duration = act.estDurationMins || (act as any).est_duration_mins || 60;
                        const isLast = actIdx === day.filteredActivities.length - 1;

                        return (
                          <React.Fragment key={act.id || act.stopActivityId || actIdx}>
                            {/* Activity Card */}
                            <div className="bg-paper border-2 border-kraft p-4 shadow-sm relative group hover:border-postal/50 transition-colors"
                                 style={{ transform: `rotate(${actIdx % 2 === 0 ? '-0.5deg' : '0.5deg'})` }}
                            >
                              <div className="flex justify-between items-start gap-3">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-xs bg-kraft/40 text-ink px-2 py-0.5 border border-ink/10">
                                      {act.scheduledTime || (act as any).scheduled_time || `${9 + actIdx * 2}:00 AM`}
                                    </span>
                                    <span className="font-mono text-xs text-ink/60">
                                      ⏱ {Math.round(duration / 60)}h
                                    </span>
                                    {act.category && (
                                      <span className="font-display text-xs text-moss bg-moss/10 px-2 py-0.5 border border-moss/20">
                                        {act.category}
                                      </span>
                                    )}
                                  </div>
                                  
                                  <h3 className="font-display text-xl text-ink mt-2">
                                    {act.activityName || (act as any).name || "Activity"}
                                  </h3>
                                  
                                  {act.description && (
                                    <p className="font-body text-xs text-ink/70 mt-1 line-clamp-2">
                                      {act.description}
                                    </p>
                                  )}
                                </div>

                                {/* Mobile-only inline cost */}
                                <div className="md:hidden shrink-0">
                                  <span className="font-mono text-sm font-bold text-postal">{formatCurrency(cost, currentCurrency)}</span>
                                </div>
                              </div>
                            </div>

                            {/* Hand-drawn sequence flow connecting arrow between sequential activities */}
                            {!isLast && (
                              <div className="flex justify-center my-1 py-1">
                                <svg className="w-6 h-8 text-ink/40 overflow-visible" viewBox="0 0 24 32" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M12 2 Q14 14, 12 26" strokeDasharray="3 3" />
                                  <path d="M7 21 L12 28 L17 21" />
                                </svg>
                              </div>
                            )}
                          </React.Fragment>
                        );
                      })
                    )}
                  </div>

                  {/* Expense Column (Right) */}
                  <div className="hidden md:flex md:col-span-3 flex-col justify-between h-full space-y-4">
                    <div className="space-y-4">
                      {hasActs ? (
                        day.filteredActivities.map((act, actIdx) => {
                          const cost = Number(act.actualCost ?? act.actual_cost ?? act.estCost ?? act.est_cost ?? act.estimatedCost ?? 0);
                          return (
                            <div key={actIdx} className="h-[92px] flex items-center justify-end">
                              <div className="bg-kraft/30 border border-kraft px-3 py-2 text-right shadow-sm"
                                   style={{ clipPath: "polygon(6px 0%, 100% 0, 100% 100%, 6px 100%, 0 50%)" }}
                              >
                                <span className="font-mono text-[10px] text-ink/60 uppercase block">Cost</span>
                                <span className="font-mono text-base font-bold text-postal">{formatCurrency(cost, currentCurrency)}</span>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="h-16 flex items-center justify-end">
                          <span className="font-mono text-xs text-ink/40">—</span>
                        </div>
                      )}
                    </div>

                    {/* Day Total Subtotal Box */}
                    <div className="pt-3 border-t-2 border-dashed border-kraft flex items-center justify-between bg-kraft/10 p-2.5 border border-kraft">
                      <span className="font-display text-sm text-ink/70">Day {day.dayNumber} Subtotal</span>
                      <span className="font-mono text-base font-bold text-ink">{formatCurrency(day.activityCost, currentCurrency)}</span>
                    </div>
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Footer Journal Stitching */}
      <div className="mt-12 pt-6 border-t-2 border-dashed border-kraft flex flex-col sm:flex-row items-center justify-between text-xs text-ink/60 font-mono gap-3">
        <span>GlobeTrotter Unified Itinerary Engine • {filteredDays.length} Days Generated</span>
        <div className="flex items-center gap-4">
          <Link href={`/trips/${trip.id}/budget`} className="text-postal hover:underline font-bold print:hidden">
            View Full Budget Analytics →
          </Link>
        </div>
      </div>

    </div>
  );
}
