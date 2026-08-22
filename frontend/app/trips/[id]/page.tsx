"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { City, Stop, Activity } from "@/lib/api/types";
import { SortableStopItem } from "./components/sortable-stop-item";
import { CitySearchSlideover } from "@/components/ui/city-search-slideover";
import { ActivitySearchSlideover } from "@/components/ui/activity-search-slideover";
import { StampButton } from "@/components/ui/stamp-button";
import { PaperSkeleton } from "@/components/ui/paper-skeleton";
import { LuggageTag } from "@/components/ui/luggage-tag";
import * as Icons from "@/components/ui/icons";
import { motion, AnimatePresence } from "framer-motion";

export default function ItineraryBuilderPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  
  const { data: trip, isLoading } = useTrip(id);
  const addStop = useAddStop(id);
  const updateStop = useUpdateStop(id);
  const deleteStop = useDeleteStop(id);
  const reorderStops = useReorderStops(id);
  const addActivity = useAddActivity(id);
  const removeActivity = useRemoveActivity(id);

  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const [isCitySearchOpen, setIsCitySearchOpen] = useState(false);
  const [isActivitySearchOpen, setIsActivitySearchOpen] = useState(false);

  // Debounced Date Updates
  const [localDates, setLocalDates] = useState<{ arrival: string; departure: string }>({ arrival: '', departure: '' });
  const dateUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const selectedStop = useMemo(() => {
    return trip?.stops?.find(s => s.id === selectedStopId) || null;
  }, [trip, selectedStopId]);

  // Sync local dates when stop selection changes
  useEffect(() => {
    if (selectedStop) {
      setLocalDates({
        arrival: selectedStop.arrivalDate ? new Date(selectedStop.arrivalDate).toISOString().split('T')[0] : '',
        departure: selectedStop.departureDate ? new Date(selectedStop.departureDate).toISOString().split('T')[0] : '',
      });
    }
  }, [selectedStop?.id, selectedStop?.arrivalDate, selectedStop?.departureDate]);

  const handleDateChange = (field: 'arrival' | 'departure', value: string) => {
    setLocalDates(prev => ({ ...prev, [field]: value }));
    
    if (dateUpdateTimeoutRef.current) clearTimeout(dateUpdateTimeoutRef.current);
    
    dateUpdateTimeoutRef.current = setTimeout(() => {
      if (selectedStopId) {
        updateStop.mutate({
          stopId: selectedStopId,
          data: {
            [`${field}Date`]: value ? new Date(value).toISOString() : undefined
          }
        });
      }
    }, 400);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id && trip?.stops) {
      const oldIndex = trip.stops.findIndex((s) => s.id === active.id);
      const newIndex = trip.stops.findIndex((s) => s.id === over?.id);
      
      const newStops = arrayMove(trip.stops, oldIndex, newIndex);
      
      const orderData = newStops.map((s, index) => ({
        id: s.id,
        order_index: index + 1
      }));

      reorderStops.mutate(orderData);
    }
  };

  const handleAddStop = (city: City) => {
    setIsCitySearchOpen(false);
    
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    addStop.mutate({
      cityId: city.id,
      title: city.name,
      arrivalDate: today.toISOString(),
      departureDate: nextWeek.toISOString(),
      orderIndex: (trip?.stops?.length || 0) + 1
    }, {
      onSuccess: (newStop) => setSelectedStopId(newStop.id)
    });
  };

  const handleAddActivity = (activityId: string, cost: number) => {
    setIsActivitySearchOpen(false);
    if (selectedStopId) {
      addActivity.mutate({
        stopId: selectedStopId,
        data: {
          activity_id: activityId,
          actual_cost: cost,
          scheduled_date: selectedStop?.arrivalDate
        }
      });
    }
  };

  const totalCost = useMemo(() => {
    if (!trip?.stops) return 0;
    return trip.stops.reduce((acc, stop) => {
      let stopCost = stop.sectionBudget || 0;
      if (stop.activities) {
        stopCost += stop.activities.reduce((a, act) => a + (act.actualCost || 0), 0);
      }
      return acc + stopCost;
    }, 0);
  }, [trip?.stops]);

  if (isLoading) {
    return (
      <main className="min-h-screen max-w-7xl mx-auto px-4 py-8 flex gap-8">
        <PaperSkeleton className="w-1/2 h-[800px]" />
        <PaperSkeleton className="w-1/2 h-[800px]" />
      </main>
    );
  }

  if (!trip) return <div className="p-10">Trip not found</div>;

  return (
    <main className="min-h-screen bg-paper max-w-7xl mx-auto py-8 px-4 flex flex-col md:flex-row shadow-2xl relative">
      
      {/* Journal Spine */}
      <div className="absolute top-0 bottom-0 left-1/2 w-4 bg-kraft/40 -translate-x-1/2 hidden md:block shadow-[inset_0_0_10px_rgba(0,0,0,0.1)] z-10" />

      {/* LEFT PAGE: Stops List */}
      <section className="w-full md:w-1/2 md:pr-12 lg:pr-16 flex flex-col relative pb-24 md:pb-0 min-h-[600px]">
        <div className="flex justify-between items-end mb-8 border-b-2 border-dashed border-kraft pb-4">
          <div>
            <h1 className="font-display text-4xl text-ink">{trip.name}</h1>
            <p className="font-body text-ink/70 flex items-center gap-2 mt-2">
              <Icons.Suitcase className="w-4 h-4" /> 
              {trip.stops?.length || 0} Stops
            </p>
          </div>
          <div className="flex flex-col items-end">
            <span className="font-body text-sm text-ink/60 uppercase tracking-widest">Total Cost</span>
            <span className="font-display text-2xl text-postal">${totalCost.toLocaleString()}</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 pb-20 space-y-4">
          {trip.stops && trip.stops.length > 0 ? (
            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext 
                items={trip.stops.map(s => s.id)}
                strategy={verticalListSortingStrategy}
              >
                {trip.stops.sort((a,b) => (a.orderIndex||0) - (b.orderIndex||0)).map((stop, i) => (
                  <SortableStopItem 
                    key={stop.id} 
                    stop={stop} 
                    isSelected={selectedStopId === stop.id}
                    onSelect={() => setSelectedStopId(stop.id)}
                    index={i}
                  />
                ))}
              </SortableContext>
            </DndContext>
          ) : (
            <div className="text-center py-20 border-2 border-dashed border-kraft rounded-sm bg-kraft/10">
              <p className="font-display text-xl text-ink/60">No stops in your itinerary yet.</p>
              <p className="font-body text-sm text-ink/40 mt-2">Click "Add Stop" to begin your journey.</p>
            </div>
          )}
        </div>

        {/* Add Stop Button Fixed at Bottom of Left Page */}
        <div className="absolute bottom-4 left-0 right-0 md:pr-12 lg:pr-16 flex justify-center bg-gradient-to-t from-paper via-paper to-transparent pt-8">
          <StampButton onClick={() => setIsCitySearchOpen(true)} className="transform rotate-1 hover:rotate-0">
            + Add Stop
          </StampButton>
        </div>
      </section>


      {/* RIGHT PAGE: Stop Details */}
      <section className="w-full md:w-1/2 md:pl-12 lg:pl-16 pt-12 md:pt-0 relative min-h-[600px] border-t-2 md:border-t-0 border-kraft/40 md:border-transparent mt-12 md:mt-0">
        <AnimatePresence mode="wait">
          {!selectedStopId ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center justify-center text-center px-8"
            >
              <Icons.Compass className="w-16 h-16 text-kraft/50 mb-6" />
              <p className="font-display text-2xl text-ink/40">Select a stop to view details</p>
            </motion.div>
          ) : selectedStop ? (
            <motion.div 
              key="details"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="h-full flex flex-col"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="font-display text-3xl text-ink flex items-center gap-2">
                    <Icons.MapPin className="w-6 h-6 text-postal" />
                    {selectedStop.title || selectedStop.cityName}
                  </h2>
                  <p className="font-body text-ink/60 mt-1">{selectedStop.cityName}, {selectedStop.cityCountry}</p>
                </div>
                <button 
                  onClick={() => {
                    deleteStop.mutate(selectedStop.id);
                    setSelectedStopId(null);
                  }}
                  className="p-2 text-ink/40 hover:text-postal hover:bg-postal/10 rounded-full transition-colors"
                  title="Remove Stop"
                >
                  <Icons.Trash className="w-5 h-5" />
                </button>
              </div>

              {/* Date Editor */}
              <div className="bg-kraft/20 p-4 rounded-sm border border-kraft mb-8 flex gap-6">
                <div className="flex-1">
                  <label className="block font-display text-sm text-ink/60 mb-1">Arrival</label>
                  <input 
                    type="date" 
                    value={localDates.arrival}
                    onChange={(e) => handleDateChange('arrival', e.target.value)}
                    className="w-full bg-transparent border-b-2 border-dashed border-ink/40 outline-none font-body focus:border-postal py-1"
                  />
                </div>
                <div className="flex-1">
                  <label className="block font-display text-sm text-ink/60 mb-1">Departure</label>
                  <input 
                    type="date" 
                    value={localDates.departure}
                    onChange={(e) => handleDateChange('departure', e.target.value)}
                    className="w-full bg-transparent border-b-2 border-dashed border-ink/40 outline-none font-body focus:border-postal py-1"
                  />
                </div>
              </div>

              {/* Activities List */}
              <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-display text-xl text-ink">Activities</h3>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pb-20 pr-2">
                  {selectedStop.activities?.length ? selectedStop.activities.map((act) => (
                    <div key={act.stopActivityId || act.id} className="relative group bg-paper border border-kraft shadow-sm flex items-center">
                      <div className="w-2 h-full bg-postal absolute left-0 top-0 bottom-0" />
                      <div className="flex-1 pl-6 pr-4 py-3 flex justify-between items-center">
                        <div>
                          <p className="font-display text-lg text-ink truncate">{act.activityName}</p>
                          <div className="flex gap-3 text-xs font-body text-ink/60 uppercase mt-1 tracking-wider">
                            <span>{new Date(act.scheduledDate || '').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                            <span>•</span>
                            <span>{act.scheduledTime}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <LuggageTag text={`$${act.actualCost}`} className="bg-kraft text-ink" />
                          <button 
                            onClick={() => removeActivity.mutate({ stopId: selectedStop.id, activityId: act.stopActivityId || act.id })}
                            className="text-ink/30 hover:text-postal transition-colors opacity-0 group-hover:opacity-100"
                            title="Remove Activity"
                          >
                            <Icons.Trash className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Ticket stub jagged edge effect */}
                      <div className="absolute -right-1 top-0 bottom-0 w-2 flex flex-col justify-between overflow-hidden opacity-50">
                        {[1,2,3,4,5,6].map(i => (
                          <div key={i} className="w-2 h-2 rounded-full bg-kraft -ml-1" />
                        ))}
                      </div>
                    </div>
                  )) : (
                    <p className="font-body text-ink/50 italic text-center py-8">No activities planned.</p>
                  )}
                </div>

                {/* Add Activity Button Fixed at Bottom of Right Page */}
                <div className="absolute bottom-4 left-0 right-0 md:pl-12 lg:pl-16 flex justify-center bg-gradient-to-t from-paper via-paper to-transparent pt-8">
                  <StampButton 
                    onClick={() => setIsActivitySearchOpen(true)} 
                    className="transform rotate-[-1deg] hover:rotate-0 bg-transparent text-ink border-2 border-ink hover:bg-ink hover:text-paper"
                  >
                    + Add Activity
                  </StampButton>
                </div>

              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </section>

      {/* Slide Overs */}
      <CitySearchSlideover 
        isOpen={isCitySearchOpen} 
        onClose={() => setIsCitySearchOpen(false)} 
        onSelectCity={handleAddStop} 
      />
      
      {selectedStopId && (
        <ActivitySearchSlideover 
          isOpen={isActivitySearchOpen} 
          onClose={() => setIsActivitySearchOpen(false)} 
          cityId={selectedStop?.cityId || ""}
          onSelectActivity={handleAddActivity}
        />
      )}

    </main>
  );
}
