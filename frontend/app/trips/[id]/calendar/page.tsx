"use client";

import React, { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { useTrip } from "@/lib/hooks/useTrips";
import { selectCostByDay, DayCostBreakdown } from "@/lib/selectors/budget";
import { PaperSkeleton } from "@/components/ui/paper-skeleton";
import * as Icons from "@/components/ui/icons";

export default function TripCalendarPage() {
  const { id } = useParams() as { id: string };
  const { data: trip, isLoading } = useTrip(id);

  const days = useMemo(() => selectCostByDay(trip), [trip]);
  
  // Base month on trip start, or current month
  const startMonthInfo = useMemo(() => {
    if (!days.length) return null;
    const d = new Date(days[0].dateKey);
    return { year: d.getFullYear(), month: d.getMonth() };
  }, [days]);

  const [calendarMonth, setCalendarMonth] = useState<{ year: number; month: number } | null>(null);
  const displayMonth = calendarMonth ?? startMonthInfo ?? { year: new Date().getFullYear(), month: new Date().getMonth() };

  const calendarGrid = useMemo(() => {
    const { year, month } = displayMonth;
    const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const dayMap: Record<string, DayCostBreakdown> = {};
    days.forEach(d => { dayMap[d.dateKey] = d; });

    const cells: (DayCostBreakdown | null | "empty")[] = [];
    for (let i = 0; i < firstDay; i++) cells.push("empty");
    for (let d = 1; d <= daysInMonth; d++) {
      const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      cells.push(dayMap[dateKey] ?? null);
    }
    while (cells.length % 7 !== 0) cells.push("empty");
    return { cells, year, month };
  }, [displayMonth, days]);

  const monthLabel = new Date(displayMonth.year, displayMonth.month, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const prevMonth = () => {
    setCalendarMonth(prev => {
      const { year, month } = prev ?? displayMonth;
      return month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 };
    });
  };
  
  const nextMonth = () => {
    setCalendarMonth(prev => {
      const { year, month } = prev ?? displayMonth;
      return month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 };
    });
  };

  if (isLoading) {
    return (
      <div className="w-full bg-paper p-8 space-y-6">
        <PaperSkeleton className="w-1/3 h-12" />
        <PaperSkeleton className="w-full h-[600px]" />
      </div>
    );
  }

  if (!trip) return <div className="p-12 text-center text-ink/60 font-display text-2xl">Trip not found</div>;

  return (
    <div className="w-full bg-paper shadow-2xl relative flex flex-col font-display text-ink p-6 md:p-10">
      
      {/* Header Toolbar mirroring the mockup */}
      <div className="flex flex-col gap-6 mb-12">
        <h1 className="text-3xl border-b-2 border-dashed border-kraft pb-2 text-ink">GlobeTrotter</h1>
        
        {/* Search Bar / Filter row */}
        <div className="flex flex-wrap items-center gap-3 font-body text-sm">
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search bar ......"
              className="w-full bg-transparent border-2 border-kraft px-4 py-1.5 outline-none placeholder:text-ink/40 text-ink"
              style={{ borderRadius: "100px" }}
            />
          </div>
          <button className="border-2 border-kraft px-4 py-1.5 hover:bg-kraft/10 transition-colors text-ink" style={{ borderRadius: "100px" }}>Group by</button>
          <button className="border-2 border-kraft px-4 py-1.5 hover:bg-kraft/10 transition-colors text-ink" style={{ borderRadius: "100px" }}>Filter</button>
          <button className="border-2 border-kraft px-4 py-1.5 hover:bg-kraft/10 transition-colors text-ink" style={{ borderRadius: "100px" }}>Sort by...</button>
        </div>
      </div>

      {/* Calendar Area */}
      <div className="flex flex-col items-center">
        <h2 className="text-2xl mb-8">Calendar View</h2>

        <div className="bg-paper text-ink w-full max-w-4xl border-2 border-kraft shadow-xl">
          
          {/* Month Header */}
          <div className="flex justify-between items-center px-6 py-6 border-b-2 border-kraft bg-kraft/5">
            <button onClick={prevMonth} className="p-2 hover:bg-kraft/20 transition-colors">
              <Icons.Chevron direction="left" className="w-6 h-6 text-ink/60" />
            </button>
            <h3 className="text-2xl font-medium text-ink">{monthLabel}</h3>
            <button onClick={nextMonth} className="p-2 hover:bg-kraft/20 transition-colors">
              <Icons.Chevron direction="right" className="w-6 h-6 text-ink/60" />
            </button>
          </div>

          {/* Days of Week */}
          <div className="grid grid-cols-7 border-b-2 border-kraft text-center text-sm font-semibold tracking-wide py-3 bg-kraft/10">
            <div>SUN</div>
            <div>MON</div>
            <div>TUE</div>
            <div>WED</div>
            <div>THU</div>
            <div>FRI</div>
            <div>SAT</div>
          </div>

          {/* Grid Cells */}
          <div className="grid grid-cols-7 border-l-2 border-kraft">
            {calendarGrid.cells.map((cell, i) => {
              if (cell === "empty") {
                return (
                  <div key={`e-${i}`} className="h-28 sm:h-32 border-b-2 border-r-2 border-kraft bg-paper" />
                );
              }

              const dayNum = i - (new Date(calendarGrid.year, calendarGrid.month, 1).getDay()) + 1;
              const inTrip = cell !== null;
              const hasActs = cell?.activities.length ? true : false;
              
              // We mimic the mockup's span blocks visually inside the cell
              // The mockup shows trip name/location spanning across days.
              // We can render a block inside the cell if it's a trip day.
              
              return (
                <div key={dayNum} className={`relative h-28 sm:h-32 border-b-2 border-r-2 border-kraft p-2 flex flex-col ${inTrip ? "bg-kraft/20" : "bg-paper"}`}>
                  <span className="text-lg font-medium">{dayNum}</span>
                  
                  {inTrip && (
                    <div className="mt-auto mb-1 bg-paper border-2 border-kraft shadow-sm px-2 py-1 text-xs sm:text-sm font-bold truncate uppercase tracking-wider mx-[-4px] text-ink">
                      {cell.stopNames.length > 0 ? cell.stopNames[0] : trip.name}
                    </div>
                  )}
                  
                  {hasActs && (
                    <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-postal" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
