import { Trip, Stop, TripActivity } from "../api/types";

export interface CategoryBreakdown {
  name: string;
  value: number;
}

export interface DayCostBreakdown {
  dayNumber: number;
  dateKey: string;
  displayDate: string;
  activities: TripActivity[];
  activityCost: number;
  totalCost: number;
  stopNames: string[];
  stopIds: string[];
}

export interface TripBudgetAnalysis {
  totalPlannedCost: number;
  totalSectionBudgets: number;
  totalActivityCost: number;
  categories: CategoryBreakdown[];
  days: DayCostBreakdown[];
  overBudgetStatus: "good" | "warning" | "over";
  daysCount: number;
}

/**
 * Select total planned and section budget cost for a trip.
 */
export function selectTotalCost(trip: Trip | undefined | null): number {
  if (!trip) return 0;
  
  let total = 0;
  
  // Section budgets + Activities
  if (trip.stops) {
    trip.stops.forEach((stop: Stop) => {
      const sectionBudget = Number(stop.sectionBudget ?? stop.section_budget ?? 0);
      total += isNaN(sectionBudget) ? 0 : sectionBudget;

      if (stop.activities) {
        stop.activities.forEach((act: TripActivity) => {
          const cost = Number(act.actualCost ?? act.actual_cost ?? act.estCost ?? act.est_cost ?? act.estimatedCost ?? 0);
          total += isNaN(cost) ? 0 : cost;
        });
      }
    });
  }

  // Fallback to cached budget summary if stops are empty
  if (total === 0 && (trip as any).budget?.total_cost) {
    total = Number((trip as any).budget.total_cost);
  }

  return total;
}

/**
 * Select categorical distribution of expenses.
 */
export function selectCostByCategory(trip: Trip | undefined | null): CategoryBreakdown[] {
  if (!trip) return [];

  const categoryMap: Record<string, number> = {
    "Sightseeing": 0,
    "Food": 0,
    "Transport": 0,
    "Stay": 0,
    "Adventure": 0,
    "Culture": 0,
    "Other": 0,
  };

  if (trip.stops) {
    trip.stops.forEach((stop: Stop) => {
      const sectionBudget = Number(stop.sectionBudget ?? stop.section_budget ?? 0);
      if (sectionBudget > 0) {
        categoryMap["Stay"] += sectionBudget;
      }

      if (stop.activities) {
        stop.activities.forEach((act: TripActivity) => {
          const cost = Number(act.actualCost ?? act.actual_cost ?? act.estCost ?? act.est_cost ?? act.estimatedCost ?? 0);
          const category = act.category || (act.activity && act.activity.category) || "Sightseeing";
          
          if (categoryMap[category] !== undefined) {
            categoryMap[category] += cost;
          } else {
            categoryMap[category] = (categoryMap[category] || 0) + cost;
          }
        });
      }
    });
  }

  return Object.entries(categoryMap)
    .filter(([_, value]) => value > 0)
    .map(([name, value]) => ({ name, value }));
}

/**
 * Select day-by-day cost breakdown and scheduled physical activities.
 */
export function selectCostByDay(trip: Trip | undefined | null): DayCostBreakdown[] {
  if (!trip || (!trip.startDate && !(trip as any).start_date)) return [];

  const startStr = trip.startDate || (trip as any).start_date;
  const endStr = trip.endDate || (trip as any).end_date || startStr;

  const start = new Date(startStr);
  const end = new Date(endStr);
  const days: DayCostBreakdown[] = [];

  const activityMapByDate: Record<string, TripActivity[]> = {};

  if (trip.stops) {
    trip.stops.forEach((stop: Stop) => {
      if (stop.activities) {
        stop.activities.forEach((act: TripActivity) => {
          // Prefer explicit scheduled_date, fall back to stop's arrival_date
          const rawDate =
            act.scheduledDate ||
            (act as any).scheduled_date ||
            stop.arrivalDate ||
            (stop as any).arrival_date;
          if (rawDate) {
            const dateKey = new Date(rawDate).toISOString().split("T")[0];
            if (!activityMapByDate[dateKey]) activityMapByDate[dateKey] = [];
            activityMapByDate[dateKey].push({
              ...act,
              activityName:
                act.activityName ||
                (act as any).activity_name ||
                (act as any).name ||
                act.activity?.name ||
                "Activity",
              category:
                act.category ||
                (act as any).activity?.category ||
                "Sightseeing",
              description:
                act.description ||
                (act as any).activity?.description ||
                "",
              imageUrl:
                act.imageUrl ||
                (act as any).image_url ||
                (act as any).activity?.image_url ||
                "",
            });
          }
        });
      }
    });
  }


  let curr = new Date(start);
  let dayNum = 1;

  while (curr <= end && dayNum <= 90) { // Limit to 90 days guard
    const dateKey = curr.toISOString().split("T")[0];
    const displayDate = curr.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    
    // Find active stops on this date
    const activeStops = (trip.stops || []).filter((s) => {
      const arr = s.arrivalDate || (s as any).arrival_date;
      const dep = s.departureDate || (s as any).departure_date;
      if (!arr || !dep) return false;
      const arrKey = new Date(arr).toISOString().split("T")[0];
      const depKey = new Date(dep).toISOString().split("T")[0];
      return dateKey >= arrKey && dateKey <= depKey;
    });

    const dayActivities = activityMapByDate[dateKey] || [];
    const actCost = dayActivities.reduce((sum, a) => {
      const c = Number(a.actualCost ?? a.actual_cost ?? a.estCost ?? a.est_cost ?? a.estimatedCost ?? 0);
      return sum + (isNaN(c) ? 0 : c);
    }, 0);

    const stopBudgetShare = activeStops.reduce((sum, s) => {
      const b = Number(s.sectionBudget ?? s.section_budget ?? 0);
      return sum + (isNaN(b) ? 0 : b);
    }, 0);

    days.push({
      dayNumber: dayNum,
      dateKey,
      displayDate,
      activities: dayActivities,
      activityCost: actCost,
      totalCost: actCost + (stopBudgetShare > 0 ? Math.round(stopBudgetShare / 7) : 0),
      stopNames: activeStops.map(s => s.title || s.cityName || (s as any).city_name || "Stop"),
      stopIds: activeStops.map(s => s.id),
    });

    curr.setDate(curr.getDate() + 1);
    dayNum++;
  }

  return days;
}

/**
 * Full memoizable budget analyzer for a trip.
 */
export function selectTripBudgetAnalysis(trip: Trip | undefined | null): TripBudgetAnalysis {
  const totalPlannedCost = selectTotalCost(trip);
  const categories = selectCostByCategory(trip);
  const days = selectCostByDay(trip);
  const daysCount = Math.max(1, days.length);

  // Status computation against conservative daily threshold ($250/day standard)
  const threshold = daysCount * 250;
  let overBudgetStatus: "good" | "warning" | "over" = "good";
  if (totalPlannedCost > threshold * 1.25) {
    overBudgetStatus = "over";
  } else if (totalPlannedCost > threshold) {
    overBudgetStatus = "warning";
  }

  let totalSectionBudgets = 0;
  let totalActivityCost = 0;

  if (trip?.stops) {
    trip.stops.forEach((s) => {
      totalSectionBudgets += Number(s.sectionBudget ?? s.section_budget ?? 0);
      s.activities?.forEach((a) => {
        totalActivityCost += Number(a.actualCost ?? a.actual_cost ?? a.estCost ?? a.est_cost ?? a.estimatedCost ?? 0);
      });
    });
  }

  return {
    totalPlannedCost,
    totalSectionBudgets,
    totalActivityCost,
    categories,
    days,
    overBudgetStatus,
    daysCount,
  };
}
