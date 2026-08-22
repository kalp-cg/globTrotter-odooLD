"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useTrip } from "@/lib/hooks/useTrips";
import { attachActivity } from "@/lib/api/trips";
import { useQueryClient } from "@tanstack/react-query";
import { selectCostByDay, selectTotalCost } from "@/lib/selectors/budget";
import { formatCurrency, getSelectedCurrency, setSelectedCurrency, CurrencyCode, CURRENCY_RATES } from "@/lib/format/currency";
import { PaperSkeleton } from "@/components/ui/paper-skeleton";
import * as Icons from "@/components/ui/icons";

export default function ItineraryJournalViewPage() {
  const { id } = useParams() as { id: string };
  const { data: trip, isLoading } = useTrip(id);

  const [search, setSearch] = useState("");
  const [currentCurrency, setCurrentCurrency] = useState<CurrencyCode>("USD");

  useEffect(() => {
    setCurrentCurrency(getSelectedCurrency());
    const handleCurr = () => setCurrentCurrency(getSelectedCurrency());
    window.addEventListener("currency_change", handleCurr);
    return () => window.removeEventListener("currency_change", handleCurr);
  }, []);

  const [addingDay, setAddingDay] = useState<number | null>(null);
  const [newActName, setNewActName] = useState("");
  const [newActCost, setNewActCost] = useState("");
  
  const queryClient = useQueryClient();

  const handleSaveActivity = async (stopId: string, dateKey: string) => {
    if (!newActName.trim() || !stopId) return;
    try {
      await attachActivity(id, stopId, {
        activityName: newActName.trim(),
        estCost: parseFloat(newActCost) || 0,
        scheduledDate: dateKey
      });
      queryClient.invalidateQueries({ queryKey: ["trips", id] });
      setAddingDay(null);
      setNewActName("");
      setNewActCost("");
    } catch (err) {
      console.error("Failed to save activity", err);
    }
  };

  const days = useMemo(() => selectCostByDay(trip), [trip]);
  const totalCost = useMemo(() => selectTotalCost(trip), [trip]);

  // Search filter
  const filteredDays = useMemo(() => {
    return days.map((day) => {
      const acts = day.activities.filter((act) => {
        const actName = (act.activityName || (act as any).name || "").toLowerCase();
        return !search || actName.includes(search.toLowerCase());
      });
      return { ...day, filteredActivities: acts };
    }).filter(day => day.filteredActivities.length > 0 || !search);
  }, [days, search]);

  if (isLoading) {
    return (
      <div className="w-full bg-paper p-8 space-y-6">
        <PaperSkeleton className="w-1/2 h-14" />
        <PaperSkeleton className="w-full h-64" />
      </div>
    );
  }

  if (!trip) return <div className="p-12 text-center text-ink/60 font-display text-2xl">Trip not found</div>;

  return (
    <div className="w-full bg-paper shadow-2xl relative flex flex-col">
      {/* Header matching the mockup style */}
      <div className="px-6 md:px-10 pt-8 pb-4 border-b-2 border-dashed border-kraft">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <h1 className="font-display text-4xl text-ink">GlobeTrotter</h1>
          
          <div className="flex items-center gap-2 bg-paper border border-kraft px-3 py-1">
            <span className="font-mono text-xs text-ink/60">Currency:</span>
            <select
              value={currentCurrency}
              onChange={(e) => {
                setSelectedCurrency(e.target.value as CurrencyCode);
                setCurrentCurrency(e.target.value as CurrencyCode);
              }}
              className="bg-transparent font-mono text-xs font-bold text-ink focus:outline-none"
            >
              {Object.entries(CURRENCY_RATES).map(([code, meta]) => (
                <option key={code} value={code}>{meta.label}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Search Bar / Filter row */}
        <div className="flex flex-wrap items-center gap-2 mt-6">
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search bar ......"
              className="w-full bg-transparent border-2 border-kraft px-4 py-1.5 font-body text-sm outline-none focus:border-ink placeholder:text-ink/40"
              style={{ borderRadius: "100px" }}
            />
          </div>
          <button className="border-2 border-kraft px-4 py-1.5 font-display text-sm hover:bg-kraft/10 transition-colors" style={{ borderRadius: "100px" }}>Group by</button>
          <button className="border-2 border-kraft px-4 py-1.5 font-display text-sm hover:bg-kraft/10 transition-colors" style={{ borderRadius: "100px" }}>Filter</button>
          <button className="border-2 border-kraft px-4 py-1.5 font-display text-sm hover:bg-kraft/10 transition-colors" style={{ borderRadius: "100px" }}>Sort by...</button>
        </div>
      </div>

      <div className="px-6 md:px-10 py-6">
        <h2 className="font-display text-3xl text-ink text-center mb-8">Itinerary for a selected place</h2>
        
        <div className="grid grid-cols-12 gap-4 font-display text-xl text-ink/80 mb-6 text-center">
          <div className="col-span-2"></div>
          <div className="col-span-7">Physical Activity</div>
          <div className="col-span-3">Expense</div>
        </div>

        <div className="space-y-8">
          {filteredDays.length === 0 ? (
             <div className="py-12 text-center text-ink/50 italic border-2 border-dashed border-kraft/50">No activities match your search.</div>
          ) : (
            filteredDays.map((day) => {
              const hasActs = day.filteredActivities.length > 0;
              
              return (
                <div key={day.dayNumber} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start relative">
                  {/* Left Column: Day Button */}
                  <div className="md:col-span-2 relative z-10 pt-2">
                    <div className="inline-block border-2 border-ink px-4 py-1.5 font-display text-lg font-bold bg-paper"
                         style={{ borderRadius: "8px" }}
                    >
                      Day {day.dayNumber}
                    </div>
                  </div>

                  {/* Middle Column: Activity Flow */}
                  <div className="md:col-span-7 space-y-4">
                    {!hasActs ? (
                      <div className="border-2 border-ink/40 bg-kraft/10 h-16 rounded-lg flex items-center justify-center text-ink/50 italic text-sm">
                        Free day / No activities scheduled
                      </div>
                    ) : (
                      day.filteredActivities.map((act, actIdx) => {
                        const isLast = actIdx === day.filteredActivities.length - 1;
                        return (
                          <React.Fragment key={act.id || act.stopActivityId || actIdx}>
                            <div className="border-2 border-ink bg-paper p-4 min-h-[64px] flex items-center justify-center relative shadow-sm"
                                 style={{ borderRadius: "8px" }}
                            >
                              <span className="font-display text-lg text-ink">
                                {act.activityName || (act as any).name || "Activity"}
                              </span>
                            </div>
                            
                            {/* Down Arrow between activities */}
                            {!isLast && (
                              <div className="flex justify-center -my-1 py-1">
                                <Icons.Chevron direction="down" className="w-5 h-5 text-ink/60" />
                              </div>
                            )}
                          </React.Fragment>
                        );
                      })
                    )}
                    
                    {/* Add Activity Inline Form */}
                    {addingDay === day.dayNumber ? (
                      <div className="border-2 border-dashed border-kraft p-4 space-y-3" style={{ borderRadius: "8px" }}>
                        <input
                          autoFocus
                          type="text"
                          placeholder="Activity name..."
                          value={newActName}
                          onChange={e => setNewActName(e.target.value)}
                          className="w-full bg-paper border-2 border-kraft px-3 py-2 font-display text-lg outline-none"
                        />
                      </div>
                    ) : (
                      <button 
                        onClick={() => setAddingDay(day.dayNumber)}
                        className="w-full border-2 border-dashed border-kraft/60 hover:bg-kraft/10 text-ink/60 hover:text-ink font-display py-2 transition-colors flex items-center justify-center gap-2"
                        style={{ borderRadius: "8px" }}
                      >
                        <span>+ Add Activity</span>
                      </button>
                    )}
                  </div>

                  {/* Right Column: Expense Blocks */}
                  <div className="md:col-span-3 space-y-4">
                    {!hasActs ? (
                       <div className="border-2 border-ink/40 bg-kraft/10 h-16 rounded-lg flex items-center justify-center text-ink/50" />
                    ) : (
                      day.filteredActivities.map((act, actIdx) => {
                        const cost = Number(act.actualCost ?? act.actual_cost ?? act.estCost ?? act.est_cost ?? 0);
                        const isLast = actIdx === day.filteredActivities.length - 1;
                        return (
                          <React.Fragment key={actIdx}>
                            <div className="border-2 border-ink bg-paper px-4 py-4 min-h-[64px] flex items-center justify-center shadow-sm"
                                 style={{ borderRadius: "8px" }}
                            >
                              <span className="font-mono text-base font-bold text-ink">
                                {formatCurrency(cost, currentCurrency)}
                              </span>
                            </div>
                            {/* Spacer to align with arrows in middle col */}
                            {!isLast && <div className="h-[28px]" />}
                          </React.Fragment>
                        );
                      })
                    )}
                    
                    {/* Add Expense Inline Form (Right Column) */}
                    {addingDay === day.dayNumber ? (
                      <div className="border-2 border-dashed border-kraft p-4 flex flex-col gap-2" style={{ borderRadius: "8px" }}>
                        <div className="flex items-center gap-1">
                          <span className="font-mono text-ink/60">$</span>
                          <input
                            type="number"
                            placeholder="Cost"
                            value={newActCost}
                            onChange={e => setNewActCost(e.target.value)}
                            className="w-full bg-paper border-2 border-kraft px-2 py-2 font-mono text-sm outline-none"
                          />
                        </div>
                        <div className="flex items-center gap-2 justify-end">
                          <button onClick={() => setAddingDay(null)} className="text-xs font-display text-ink/60 hover:text-postal">Cancel</button>
                          <button 
                            onClick={() => handleSaveActivity(day.stopIds[0], day.dateKey)}
                            disabled={!day.stopIds || day.stopIds.length === 0}
                            className="bg-ink text-paper px-3 py-1 text-xs font-bold font-display hover:bg-postal transition-colors disabled:opacity-50"
                          >
                            Save
                          </button>
                        </div>
                        {(!day.stopIds || day.stopIds.length === 0) && (
                          <div className="text-[10px] text-postal leading-tight">Must add a Stop to this day first.</div>
                        )}
                      </div>
                    ) : (
                      <div className="h-[44px]" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
