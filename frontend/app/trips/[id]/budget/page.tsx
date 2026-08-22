"use client";

import React, { useMemo } from "react";
import { useParams } from "next/navigation";
import { useTrip } from "@/lib/hooks/useTrips";
import { PaperSkeleton } from "@/components/ui/paper-skeleton";
import { LuggageTag } from "@/components/ui/luggage-tag";
import * as Icons from "@/components/ui/icons";
import dynamic from "next/dynamic";

// Dynamically import charts with ssr disabled
const CategoryPieChart = dynamic(() => import("@/components/ui/charts").then(mod => mod.CategoryPieChart), { ssr: false });
const DailyBarChart = dynamic(() => import("@/components/ui/charts").then(mod => mod.DailyBarChart), { ssr: false });

export default function BudgetPage() {
  const { id } = useParams() as { id: string };
  const { data: trip, isLoading } = useTrip(id);

  // Compute Aggregates
  const { categoryData, dailyData, totalCost, overBudget } = useMemo(() => {
    if (!trip || !trip.budget) {
      return { categoryData: [], dailyData: [], totalCost: 0, overBudget: false };
    }

    const { transport_cost, stay_cost, activities_cost, meals_cost, total_cost } = trip.budget;
    
    const catData = [
      { name: "Transport", value: parseFloat(transport_cost || 0) },
      { name: "Stay", value: parseFloat(stay_cost || 0) },
      { name: "Activities", value: parseFloat(activities_cost || 0) },
      { name: "Meals", value: parseFloat(meals_cost || 0) }
    ].filter(d => d.value > 0);

    const start = new Date(trip.start_date || trip.startDate);
    const end = new Date(trip.end_date || trip.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const daysCount = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);

    const baseDailyCost = (parseFloat(stay_cost || 0) + parseFloat(meals_cost || 0) + parseFloat(transport_cost || 0)) / daysCount;
    const targetDaily = parseFloat(total_cost || 0) / daysCount;

    // Map activities to their scheduled dates
    const activityCostsByDate: Record<string, number> = {};
    if (trip.stops) {
      trip.stops.forEach((stop: any) => {
        if (stop.activities) {
          stop.activities.forEach((act: any) => {
            if (act.scheduled_date || act.scheduledDate) {
              const dateKey = new Date(act.scheduled_date || act.scheduledDate).toISOString().split('T')[0];
              activityCostsByDate[dateKey] = (activityCostsByDate[dateKey] || 0) + parseFloat(act.actual_cost || act.actualCost || 0);
            }
          });
        }
      });
    }

    const daily = [];
    const curr = new Date(start);
    while (curr <= end) {
      const dateKey = curr.toISOString().split('T')[0];
      const displayDate = curr.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
      const actCost = activityCostsByDate[dateKey] || 0;
      const dayTotal = baseDailyCost + actCost;
      
      daily.push({
        date: displayDate,
        cost: Math.round(dayTotal),
        target: Math.round(targetDaily),
        rawDate: dateKey
      });
      curr.setDate(curr.getDate() + 1);
    }

    // Heuristic: If they spent more than $3000 total (arbitrary demo budget), it's over budget
    const isOver = parseFloat(total_cost || 0) > (daysCount * 250); 

    return { 
      categoryData: catData, 
      dailyData: daily, 
      totalCost: parseFloat(total_cost || 0),
      overBudget: isOver
    };
  }, [trip]);

  if (isLoading) {
    return (
      <div className="w-full bg-paper min-h-[600px] shadow-2xl p-8 flex flex-col gap-8">
        <PaperSkeleton className="w-1/3 h-20" />
        <div className="flex gap-8">
          <PaperSkeleton className="w-1/2 h-[300px]" />
          <PaperSkeleton className="w-1/2 h-[300px]" />
        </div>
      </div>
    );
  }

  if (!trip) return <div className="p-10 text-center font-display text-2xl text-ink/50">Trip not found</div>;

  return (
    <div className="w-full bg-paper min-h-[600px] shadow-2xl p-6 md:p-12 relative flex flex-col">
      {/* Hand-written total */}
      <div className="flex flex-col items-center mb-12">
        <h2 className="font-display text-5xl md:text-6xl text-ink">
          This trip: <span className="text-postal decoration-wavy underline decoration-kraft decoration-2 underline-offset-8">${totalCost.toLocaleString()}</span>
        </h2>
        <div className="mt-6 transform rotate-2">
          <LuggageTag 
            text={overBudget ? "Over Budget Target" : "On Track"} 
            className={overBudget ? "bg-postal/10 text-postal" : "bg-[#5E7A5A]/10 text-[#5E7A5A]"} // Moss token equivalent
          />
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <div className="border-2 border-dashed border-kraft p-4 bg-kraft/5 rounded-sm relative">
          <div className="absolute -top-3 left-4 bg-paper px-2 font-display text-lg text-ink/70">By Category</div>
          <CategoryPieChart data={categoryData} />
        </div>
        <div className="border-2 border-dashed border-kraft p-4 bg-kraft/5 rounded-sm relative">
          <div className="absolute -top-3 left-4 bg-paper px-2 font-display text-lg text-ink/70">Daily Average</div>
          <DailyBarChart data={dailyData} />
        </div>
      </div>

      {/* Day by Day List */}
      <div className="max-w-2xl mx-auto w-full">
        <h3 className="font-display text-2xl text-ink mb-6 pb-2 border-b-2 border-kraft">Day-by-Day Breakdown</h3>
        <div className="space-y-4">
          {dailyData.map((day, idx) => {
            const isOver = day.cost > day.target;
            return (
              <div key={day.rawDate} className="flex items-center gap-4 group">
                {/* Date */}
                <div className="w-32 font-display text-lg text-ink/80 text-right">
                  {day.date}
                </div>
                
                {/* Track */}
                <div className="relative w-full h-1 bg-kraft/40 rounded-full flex-1">
                  <div 
                    className="absolute left-0 top-0 bottom-0 bg-ink/30 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min(100, (day.cost / Math.max(...dailyData.map(d=>d.cost))) * 100)}%` }}
                  />
                  {/* Target Marker */}
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 w-1 h-3 bg-kraft z-10"
                    style={{ left: `${Math.min(100, (day.target / Math.max(...dailyData.map(d=>d.cost))) * 100)}%` }}
                    title={`Target: $${day.target}`}
                  />
                </div>

                {/* Amount */}
                <div className="w-24 font-body text-sm font-semibold text-ink text-left flex items-center gap-2">
                  ${day.cost.toLocaleString()}
                  {isOver && (
                    <span 
                      className="font-display text-postal text-xl transform -rotate-12 cursor-help" 
                      title={`Trending over daily target of $${day.target}`}
                    >
                      !
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
