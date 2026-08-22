"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  useTrip,
  useAddStop,
  useUpdateStop,
  useDeleteStop,
  useReorderStops,
  useAddActivity,
  useRemoveActivity
} from "@/lib/hooks/useTrips";
import { useEnsureActivity } from "@/lib/hooks/useActivities";
import { useEnsureCity } from "@/lib/hooks/useCities";
import { City, Stop, Activity } from "@/lib/api/types";
import { SortableStopItem } from "./components/sortable-stop-item";
import { CitySearchSlideover } from "@/components/ui/city-search-slideover";
import { ActivitySearchSlideover } from "@/components/ui/activity-search-slideover";
import { PaperSkeleton } from "@/components/ui/paper-skeleton";
import { LuggageTag } from "@/components/ui/luggage-tag";
import * as Icons from "@/components/ui/icons";
import { motion, AnimatePresence } from "framer-motion";

export default function ItineraryBuilderPage() {
  const { id } = useParams() as { id: string };

  const { data: trip, isLoading } = useTrip(id);
  const addStop = useAddStop(id);
  const updateStop = useUpdateStop(id);
  const deleteStop = useDeleteStop(id);
  const reorderStops = useReorderStops(id);
  const addActivity = useAddActivity(id);
  const removeActivity = useRemoveActivity(id);
  const ensureActivity = useEnsureActivity();
  const ensureCity = useEnsureCity();

  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const [isCitySearchOpen, setIsCitySearchOpen] = useState(false);
  const [isActivitySearchOpen, setIsActivitySearchOpen] = useState(false);
  const [localDates, setLocalDates] = useState<{ arrival: string; departure: string }>({ arrival: "", departure: "" });
  const [localBudget, setLocalBudget] = useState<string>("");
  const dateUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const budgetUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const selectedStop = useMemo(
    () => trip?.stops?.find((s: any) => s.id === selectedStopId) || null,
    [trip, selectedStopId]
  );

  // Sync local state when selected stop changes
  useEffect(() => {
    if (selectedStop) {
      setLocalDates({
        arrival: selectedStop.arrivalDate ? new Date(selectedStop.arrivalDate).toISOString().split("T")[0] : "",
        departure: selectedStop.departureDate ? new Date(selectedStop.departureDate).toISOString().split("T")[0] : "",
      });
      setLocalBudget(String(selectedStop.sectionBudget ?? selectedStop.section_budget ?? ""));
    }
  }, [selectedStop?.id, selectedStop?.arrivalDate, selectedStop?.departureDate, selectedStop?.sectionBudget]);

  const handleDateChange = (field: "arrival" | "departure", value: string) => {
    setLocalDates(prev => ({ ...prev, [field]: value }));
    if (dateUpdateTimeoutRef.current) clearTimeout(dateUpdateTimeoutRef.current);
    dateUpdateTimeoutRef.current = setTimeout(() => {
      if (selectedStopId) {
        updateStop.mutate({
          stopId: selectedStopId,
          data: { [`${field}Date`]: value ? new Date(value).toISOString() : undefined }
        });
      }
    }, 400);
  };

  const handleBudgetChange = (value: string) => {
    setLocalBudget(value);
    if (budgetUpdateTimeoutRef.current) clearTimeout(budgetUpdateTimeoutRef.current);
    budgetUpdateTimeoutRef.current = setTimeout(() => {
      if (selectedStopId) {
        updateStop.mutate({
          stopId: selectedStopId,
          data: { section_budget: parseFloat(value) || 0 }
        });
      }
    }, 600);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id && trip?.stops) {
      const oldIndex = trip.stops.findIndex((s: any) => s.id === active.id);
      const newIndex = trip.stops.findIndex((s: any) => s.id === over?.id);
      const newStops = arrayMove(trip.stops, oldIndex, newIndex);
      reorderStops.mutate(newStops.map((s: any, i: number) => ({ id: s.id, order_index: i + 1 })));
    }
  };

  const handleAddStop = async (city: City) => {
    setIsCitySearchOpen(false);
    let resolvedCityId = city.id;
    if (city.id.startsWith("external_")) {
      try {
        const res = await ensureCity.mutateAsync(city);
        resolvedCityId = res.id;
      } catch { return; }
    }
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    addStop.mutate(
      { city_id: resolvedCityId, title: city.name, arrival_date: today.toISOString(), departure_date: nextWeek.toISOString(), order_index: (trip?.stops?.length || 0) + 1 } as any,
      { onSuccess: (newStop: any) => setSelectedStopId(newStop.id) }
    );
  };

  const handleAddActivity = async (activityId: string, cost: number, date: string, activityObj?: any) => {
    setIsActivitySearchOpen(false);
    if (!selectedStopId) return;
    let finalActivityId = activityId;
    if (activityId.startsWith("external_") && activityObj) {
      try {
        const ensured = await ensureActivity.mutateAsync({
          id: activityObj.id, city_id: activityObj.city_id || activityObj.cityId,
          name: activityObj.name, category: activityObj.category,
          description: activityObj.description,
          image_url: activityObj.image_url || activityObj.imageUrl,
          est_cost: activityObj.est_cost || activityObj.estCost,
          est_duration_mins: activityObj.est_duration_mins || activityObj.estDurationMins
        });
        if (ensured?.id) finalActivityId = ensured.id;
      } catch {}
    }
    addActivity.mutate({ stopId: selectedStopId, data: { activity_id: finalActivityId, actual_cost: cost, scheduled_date: date } });
  };

  const totalCost = useMemo(() => {
    if (!trip?.stops) return 0;
    return trip.stops.reduce((acc: number, stop: any) => {
      let c = Number(stop.sectionBudget || stop.section_budget || 0);
      if (stop.activities) c += stop.activities.reduce((a: number, act: any) => a + Number(act.actualCost || act.actual_cost || 0), 0);
      return acc + c;
    }, 0);
  }, [trip?.stops]);

  const sortedStops = useMemo(
    () => [...(trip?.stops || [])].sort((a: any, b: any) => (a.orderIndex ?? a.order_index ?? 0) - (b.orderIndex ?? b.order_index ?? 0)),
    [trip?.stops]
  );

  if (isLoading) {
    return (
      <div className="w-full bg-paper p-8 space-y-4">
        {[1, 2, 3].map(i => <PaperSkeleton key={i} className="w-full h-40" />)}
      </div>
    );
  }

  if (!trip) return <div className="p-10 font-display text-2xl text-ink/50 text-center">Trip not found</div>;

  return (
    <div className="w-full bg-paper shadow-2xl relative">

      {/* ── Trip Header ── */}
      <div className="px-6 md:px-10 py-6 border-b-2 border-dashed border-kraft flex items-center justify-between gap-4 flex-wrap">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-ink/50">Itinerary Builder</span>
          <h1 className="font-display text-4xl text-ink mt-0.5">{trip.name}</h1>
          <p className="font-body text-sm text-ink/60 mt-1">
            {sortedStops.length} section{sortedStops.length !== 1 ? "s" : ""} planned
          </p>
        </div>
        <div className="text-right">
          <span className="font-mono text-xs uppercase tracking-widest text-ink/50 block">Estimated Total</span>
          <span className="font-display text-3xl text-postal">${totalCost.toLocaleString()}</span>
        </div>
      </div>

      {/* ── Sections List ── */}
      <div className="px-4 md:px-8 py-6 space-y-4">
        {sortedStops.length === 0 ? (
          <div className="py-24 text-center border-2 border-dashed border-kraft bg-kraft/10">
            <Icons.MapPin className="w-14 h-14 text-kraft/50 mx-auto mb-4" />
            <p className="font-display text-2xl text-ink/50">No stops in your itinerary yet</p>
            <p className="font-body text-sm text-ink/40 mt-2">Click "Add another Section" below to begin your journey</p>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={sortedStops.map((s: any) => s.id)} strategy={verticalListSortingStrategy}>
              <AnimatePresence>
                {sortedStops.map((stop: any, i: number) => (
                  <SectionCard
                    key={stop.id}
                    stop={stop}
                    index={i}
                    isSelected={selectedStopId === stop.id}
                    localDates={selectedStopId === stop.id ? localDates : undefined}
                    localBudget={selectedStopId === stop.id ? localBudget : undefined}
                    onSelect={() => setSelectedStopId(prev => prev === stop.id ? null : stop.id)}
                    onDateChange={handleDateChange}
                    onBudgetChange={handleBudgetChange}
                    onDelete={() => { deleteStop.mutate(stop.id); if (selectedStopId === stop.id) setSelectedStopId(null); }}
                    onAddActivity={() => { setSelectedStopId(stop.id); setIsActivitySearchOpen(true); }}
                    onRemoveActivity={(actId: string) => removeActivity.mutate({ stopId: stop.id, activityId: actId })}
                  />
                ))}
              </AnimatePresence>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* ── Add another Section ── */}
      <div className="px-4 md:px-8 pb-10 flex justify-center">
        <button
          onClick={() => setIsCitySearchOpen(true)}
          disabled={addStop.isPending}
          className="flex items-center gap-3 border-2 border-dashed border-kraft bg-kraft/10 hover:bg-kraft/20 text-ink font-display text-xl px-8 py-4 transition-all w-full max-w-xl justify-center"
          style={{ borderRadius: "2px" }}
        >
          <span className="text-2xl font-bold">+</span>
          <span>Add another Section</span>
        </button>
      </div>

      {/* Slidevers */}
      <CitySearchSlideover isOpen={isCitySearchOpen} onClose={() => setIsCitySearchOpen(false)} onSelectCity={handleAddStop} />
      {selectedStopId && (
        <ActivitySearchSlideover
          isOpen={isActivitySearchOpen}
          onClose={() => setIsActivitySearchOpen(false)}
          cityId={selectedStop?.cityId || ""}
          startDate={selectedStop?.arrivalDate || undefined}
          endDate={selectedStop?.departureDate || undefined}
          onSelectActivity={handleAddActivity}
        />
      )}
    </div>
  );
}

// ── Individual Section Card ──
interface SectionCardProps {
  stop: any;
  index: number;
  isSelected: boolean;
  localDates?: { arrival: string; departure: string };
  localBudget?: string;
  onSelect: () => void;
  onDateChange: (field: "arrival" | "departure", value: string) => void;
  onBudgetChange: (value: string) => void;
  onDelete: () => void;
  onAddActivity: () => void;
  onRemoveActivity: (id: string) => void;
}

function SectionCard({
  stop, index, isSelected, localDates, localBudget,
  onSelect, onDateChange, onBudgetChange, onDelete, onAddActivity, onRemoveActivity
}: SectionCardProps) {
  const arrivalDate = stop.arrivalDate || stop.arrival_date;
  const departureDate = stop.departureDate || stop.departure_date;
  const budget = stop.sectionBudget ?? stop.section_budget ?? 0;
  const actCount = (stop.activities || []).length;
  const actCost = (stop.activities || []).reduce((s: number, a: any) => s + Number(a.actualCost ?? a.actual_cost ?? 0), 0);
  const cityName = stop.cityName || stop.city_name || stop.title || "";
  const country = stop.cityCountry || stop.city_country || "";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className={`border-2 transition-all ${isSelected ? "border-ink bg-paper shadow-[4px_4px_0_#2E2A25]" : "border-kraft bg-paper hover:border-ink/40"}`}
      style={{ borderRadius: "2px" }}
    >
      {/* Section Header — clickable to expand */}
      <button
        onClick={onSelect}
        className="w-full text-left px-6 py-5 flex items-start justify-between gap-4"
      >
        <div className="flex items-start gap-4">
          {/* Section number stamp */}
          <div className="shrink-0 w-8 h-8 border-2 border-ink flex items-center justify-center font-display text-lg font-bold text-ink mt-0.5">
            {index + 1}
          </div>
          <div>
            <h2 className="font-display text-2xl text-ink leading-tight">
              Section {index + 1}: {cityName}
            </h2>
            {country && <p className="font-body text-sm text-ink/60 mt-0.5">{country}</p>}
            {stop.notes && (
              <p className="font-body text-sm text-ink/70 mt-1 line-clamp-2">{stop.notes}</p>
            )}
            {!stop.notes && (
              <p className="font-body text-sm text-ink/40 mt-1 italic">
                All the necessary information about this section. This can be anything like travel section, hotel or any other activity.
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {actCount > 0 && (
            <span className="font-mono text-xs text-ink/50">{actCount} activities</span>
          )}
          <Icons.Chevron direction="down" className={`w-5 h-5 text-ink/40 transition-transform ${isSelected ? "rotate-180" : ""}`} />
        </div>
      </button>

      {/* Date Range + Budget Row — always visible */}
      <div className="px-6 pb-5 flex flex-col sm:flex-row gap-3 border-t border-kraft/40">
        <div className="flex items-center gap-2 border-2 border-kraft/60 bg-kraft/10 px-4 py-2.5 flex-1 min-w-0">
          <Icons.Calendar className="w-4 h-4 text-ink/50 shrink-0" />
          <span className="font-mono text-xs text-ink/50 shrink-0 uppercase tracking-wide">Date Range:</span>
          {isSelected ? (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <input
                type="date"
                value={localDates?.arrival || ""}
                onChange={e => onDateChange("arrival", e.target.value)}
                className="bg-transparent font-body text-sm text-ink outline-none flex-1 min-w-0 cursor-pointer"
                onClick={e => e.stopPropagation()}
              />
              <span className="font-mono text-ink/40">to</span>
              <input
                type="date"
                value={localDates?.departure || ""}
                onChange={e => onDateChange("departure", e.target.value)}
                className="bg-transparent font-body text-sm text-ink outline-none flex-1 min-w-0 cursor-pointer"
                onClick={e => e.stopPropagation()}
              />
            </div>
          ) : (
            <span className="font-body text-sm text-ink/70 truncate">
              {arrivalDate ? new Date(arrivalDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "xxx"}{" "}
              to{" "}
              {departureDate ? new Date(departureDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" }) : "yyy"}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 border-2 border-kraft/60 bg-kraft/10 px-4 py-2.5 flex-1 min-w-0">
          <Icons.CoinPurse className="w-4 h-4 text-ink/50 shrink-0" />
          <span className="font-mono text-xs text-ink/50 shrink-0 uppercase tracking-wide">Budget:</span>
          {isSelected ? (
            <div className="flex items-center gap-1 flex-1">
              <span className="font-mono text-ink/60">$</span>
              <input
                type="number"
                value={localBudget || ""}
                onChange={e => onBudgetChange(e.target.value)}
                placeholder="0"
                min={0}
                className="bg-transparent font-body text-sm text-ink outline-none flex-1 min-w-0"
                onClick={e => e.stopPropagation()}
              />
            </div>
          ) : (
            <span className="font-body text-sm text-ink/70">
              {budget > 0 ? `$${Number(budget).toLocaleString()}` : "Set budget for this section"}
            </span>
          )}
        </div>
      </div>

      {/* Expanded: Activities + actions */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t-2 border-dashed border-kraft/60"
          >
            <div className="px-6 py-5 space-y-4">
              {/* Activities */}
              {(stop.activities || []).length > 0 ? (
                <div className="space-y-2">
                  <span className="font-mono text-xs uppercase tracking-widest text-ink/50">Activities ({actCount})</span>
                  {(stop.activities || []).map((act: any, ai: number) => (
                    <div key={act.stopActivityId || act.id || ai}
                      className="flex items-center justify-between border border-kraft bg-kraft/5 px-4 py-3 group"
                      style={{ borderRadius: "2px" }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-1.5 h-8 bg-postal shrink-0" />
                        <div className="min-w-0">
                          <p className="font-display text-base text-ink truncate">{act.activityName || act.name || "Activity"}</p>
                          <div className="flex gap-2 font-mono text-xs text-ink/50 mt-0.5">
                            {act.scheduledDate && <span>{new Date(act.scheduledDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>}
                            {act.category && <span>· {act.category}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-mono text-sm font-bold text-postal">${Number(act.actualCost ?? act.actual_cost ?? 0).toLocaleString()}</span>
                        <button
                          onClick={() => onRemoveActivity(act.stopActivityId || act.id)}
                          className="text-ink/30 hover:text-postal transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Icons.Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {actCost > 0 && (
                    <div className="flex justify-end">
                      <span className="font-mono text-xs text-ink/50">Activities subtotal: <strong className="text-ink">${actCost.toLocaleString()}</strong></span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="font-body text-sm text-ink/40 italic text-center py-4 border border-dashed border-kraft/40">
                  No activities planned for this stop yet.
                </p>
              )}

              {/* Bottom action row */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={onAddActivity}
                  className="font-display text-base text-ink border-2 border-ink/40 bg-paper hover:bg-kraft/20 px-5 py-2 transition-colors flex items-center gap-2"
                  style={{ borderRadius: "2px" }}
                >
                  <span className="text-lg font-bold">+</span>
                  <span>Add Activity</span>
                </button>
                <button
                  onClick={onDelete}
                  className="text-ink/30 hover:text-postal font-body text-sm transition-colors flex items-center gap-1.5"
                >
                  <Icons.Trash className="w-4 h-4" />
                  Remove section
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
