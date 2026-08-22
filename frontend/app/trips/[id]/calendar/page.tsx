"use client";

import React, { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useTrip } from "@/lib/hooks/useTrips";
import { selectCostByDay, selectTotalCost } from "@/lib/selectors/budget";
import { formatCurrency } from "@/lib/format/currency";
import { PaperSkeleton } from "@/components/ui/paper-skeleton";
import { LuggageTag } from "@/components/ui/luggage-tag";
import * as Icons from "@/components/ui/icons";

export default function TripCalendarPage() {
  const { id } = useParams() as { id: string };
  const { data: trip, isLoading } = useTrip(id);

  const days = useMemo(() => selectCostByDay(trip), [trip]);
  const totalCost = useMemo(() => selectTotalCost(trip), [trip]);

  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);

  const activeDay = useMemo(() => {
    if (!selectedDateKey) return days[0] || null;
    return days.find((d) => d.dateKey === selectedDateKey) || days[0] || null;
  }, [days, selectedDateKey]);

  if (isLoading) {
    return (
      <div className="w-full bg-paper border border-kraft/40 p-8 space-y-6">
        <PaperSkeleton className="w-1/3 h-12" />
        <PaperSkeleton className="w-full h-80" />
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
    <div className="w-full bg-paper border border-kraft/50 shadow-2xl p-6 md:p-10 relative space-y-8"
         style={{ clipPath: "polygon(0% 0.5%, 100% 0%, 99.8% 99.5%, 0.2% 100%)" }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b-2 border-dashed border-kraft gap-4">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-ink/60">Calendar & Schedule</span>
          <h1 className="font-display text-3xl md:text-4xl text-ink mt-0.5">{trip.name} Timeline</h1>
        </div>

        <div className="flex items-center gap-3">
          <LuggageTag label="Trip Total" value={formatCurrency(totalCost)} className="bg-kraft/50 text-ink" />
          <Link
            href={`/trips/${trip.id}/journal`}
            className="font-display text-base text-postal border-2 border-postal hover:bg-postal/10 px-3 py-1.5 transition-colors"
          >
            📖 Open Journal View
          </Link>
        </div>
      </div>

      {/* Days Strip / Grid */}
      <div className="space-y-4">
        <h2 className="font-display text-2xl text-ink">Trip Days & Milestones ({days.length} Days)</h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {days.map((day) => {
            const isSelected = activeDay?.dateKey === day.dateKey;
            const hasActs = day.activities.length > 0;

            return (
              <button
                key={day.dayNumber}
                onClick={() => setSelectedDateKey(day.dateKey)}
                className={`p-3 text-left border-2 transition-all cursor-pointer relative ${
                  isSelected
                    ? "bg-kraft/40 border-postal shadow-sm scale-105"
                    : "bg-paper border-kraft hover:bg-kraft/10"
                }`}
                style={{ borderRadius: "2px" }}
              >
                <div className="flex justify-between items-start">
                  <span className="font-display text-lg font-bold text-ink">Day {day.dayNumber}</span>
                  {hasActs && (
                    <span className="w-2 h-2 rounded-full bg-postal"></span>
                  )}
                </div>
                <div className="font-mono text-xs text-ink/60 mt-1">{day.displayDate}</div>
                <div className="mt-2 pt-2 border-t border-dashed border-kraft/60 flex justify-between items-center">
                  <span className="font-mono text-[11px] font-bold text-postal">{formatCurrency(day.activityCost)}</span>
                  <span className="font-body text-[11px] text-ink/50">{day.activities.length} acts</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Inspection Card */}
      {activeDay && (
        <div className="bg-kraft/15 border-2 border-kraft p-6 md:p-8 space-y-4 relative"
             style={{ transform: "rotate(-0.5deg)" }}
        >
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b-2 border-dashed border-kraft">
            <div>
              <span className="font-display text-2xl text-ink">Day {activeDay.dayNumber} — {activeDay.displayDate}</span>
              {activeDay.stopNames.length > 0 && (
                <span className="block font-body text-xs text-postal font-semibold mt-0.5">
                  📍 Stops: {activeDay.stopNames.join(", ")}
                </span>
              )}
            </div>

            <div className="text-right">
              <span className="font-mono text-xs text-ink/60 uppercase block">Daily Subtotal</span>
              <span className="font-mono text-xl font-bold text-ink">{formatCurrency(activeDay.activityCost)}</span>
            </div>
          </div>

          {activeDay.activities.length === 0 ? (
            <div className="py-8 text-center text-ink/50 font-body text-sm italic">
              No scheduled activities for this day. Open Itinerary Builder to add tours or dining!
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              {activeDay.activities.map((act, aIdx) => (
                <div key={aIdx} className="bg-paper border border-kraft p-3.5 flex justify-between items-center shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs bg-kraft/40 px-2 py-0.5 border border-ink/10">
                      {act.scheduledTime || (act as any).scheduled_time || "10:00 AM"}
                    </span>
                    <div>
                      <h4 className="font-display text-lg text-ink">{act.activityName || (act as any).name || "Activity"}</h4>
                      {act.category && (
                        <span className="font-body text-xs text-ink/60">{act.category}</span>
                      )}
                    </div>
                  </div>

                  <span className="font-mono text-sm font-bold text-postal">
                    {formatCurrency(Number(act.actualCost ?? act.actual_cost ?? act.estCost ?? act.est_cost ?? act.estimatedCost ?? 0))}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
