"use client";

import React, { useState, useRef, useMemo } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useActivities } from "@/lib/hooks/useActivities";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { LuggageTag } from "./luggage-tag";
import { StampButton } from "./stamp-button";
import { PaperSkeleton } from "./paper-skeleton";
import * as Icons from "./icons";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = ["Sightseeing", "Food", "Adventure", "Culture", "Nightlife", "Relaxation"];

interface ActivitySearchProps {
  cityId: string;
  startDate?: string;
  endDate?: string;
  onSelectActivity: (activityId: string, cost: number, date: string) => void;
  className?: string;
}

export function ActivitySearch({ cityId, startDate, endDate, onSelectActivity, className = "" }: ActivitySearchProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [maxCost, setMaxCost] = useState<number>(300); // Slider state
  const [expandedActivityId, setExpandedActivityId] = useState<string | null>(null);
  const [addingActivityId, setAddingActivityId] = useState<string | null>(null);
  
  const debouncedSearch = useDebounce(search, 300);
  const debouncedCost = useDebounce(maxCost, 500);

  const { data: activities, isLoading } = useActivities(
    useMemo(() => {
      const params: Record<string, string | number> = { city: cityId };
      if (debouncedSearch) params.search = debouncedSearch;
      if (selectedCategory) params.category = selectedCategory;
      if (debouncedCost < 300) params.cost = debouncedCost; // Only filter if changed
      return params;
    }, [cityId, debouncedSearch, selectedCategory, debouncedCost])
  );

  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: activities?.length || 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 140, // Estimated height of a row
    overscan: 5,
  });

  // Generate date range array
  const dateOptions = useMemo(() => {
    if (!startDate || !endDate) return [];
    const dates = [];
    const curr = new Date(startDate);
    const end = new Date(endDate);
    while (curr <= end) {
      dates.push(new Date(curr));
      curr.setDate(curr.getDate() + 1);
    }
    return dates;
  }, [startDate, endDate]);

  const handleSelect = (actId: string, cost: number, dateStr: string) => {
    setAddingActivityId(actId);
    // Brief animation before invoking callback
    setTimeout(() => {
      onSelectActivity(actId, cost, dateStr);
      setAddingActivityId(null);
      setExpandedActivityId(null);
    }, 400);
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      
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
            placeholder="Search experiences..."
            className="w-full bg-kraft/10 font-display text-xl text-ink placeholder:text-ink/40 border-2 border-kraft rounded-r-lg pl-12 pr-4 py-3 focus:outline-none focus:border-postal transition-colors shadow-sm"
          />
          <Icons.Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink/30" />
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 bg-kraft/10 p-3 rounded-sm border-2 border-dashed border-kraft">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(isSelected ? null : cat)}
                  className={`
                    font-display text-xs px-2 py-1 border-2 transition-all transform hover:-translate-y-0.5
                    ${isSelected 
                      ? "border-postal text-postal bg-postal/10 rotate-1 shadow-sm" 
                      : "border-kraft text-ink/60 hover:text-ink hover:border-ink/40 -rotate-1"}
                  `}
                  style={{ borderRadius: "2px", borderStyle: isSelected ? "solid" : "dashed" }}
                >
                  {cat}
                </button>
              )
            })}
          </div>

          <div className="flex items-center gap-4">
            <label className="font-display text-sm text-ink/60 shrink-0">Max Cost</label>
            <input 
              type="range" 
              min="0" max="300" 
              value={maxCost} 
              onChange={e => setMaxCost(parseInt(e.target.value))}
              className="w-full h-2 bg-kraft/50 rounded-full appearance-none outline-none accent-postal"
            />
            <span className="font-display text-sm text-ink shrink-0 w-12 text-right">
              {maxCost >= 300 ? 'Any' : `$${maxCost}`}
            </span>
          </div>
        </div>
      </div>

      {/* Results List */}
      <div ref={parentRef} className="flex-1 overflow-y-auto pr-2">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <PaperSkeleton key={i} className="w-full h-[120px]" />
            ))}
          </div>
        ) : activities && activities.length > 0 ? (
          <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}>
            {rowVirtualizer.getVirtualItems().map((virtualItem) => {
              const act = activities[virtualItem.index];
              const isExpanded = expandedActivityId === act.id;
              const isAdding = addingActivityId === act.id;

              return (
                <div
                  key={virtualItem.key}
                  style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: `${virtualItem.size}px`,
                    transform: `translateY(${virtualItem.start}px)`, paddingBottom: '16px'
                  }}
                >
                  <div className="h-full bg-paper border-2 border-kraft shadow-sm p-4 flex flex-col group transition-colors hover:border-postal/50 relative overflow-hidden">
                    
                    {isAdding && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                        className="absolute inset-0 bg-postal/10 z-10 flex items-center justify-center backdrop-blur-[1px]"
                      >
                        <div className="flex items-center gap-2 font-display text-xl text-postal">
                          <Icons.Check className="w-8 h-8" /> Added!
                        </div>
                      </motion.div>
                    )}

                    <div className="flex items-start gap-4 flex-1">
                      {act.imageUrl && (
                        <div className="w-16 h-16 shrink-0 bg-kraft overflow-hidden rounded-sm border border-ink/20 transform rotate-1">
                          <img src={act.imageUrl} alt={act.name} className="w-full h-full object-cover" />
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h3 className="font-display text-xl text-ink leading-tight">{act.name}</h3>
                          <LuggageTag text={`$${act.estCost}`} className="bg-kraft/50 text-ink text-xs ml-2 shrink-0" />
                        </div>
                        <p className="font-body text-sm text-ink/70 mt-1 line-clamp-1">{act.description}</p>
                        <div className="flex gap-4 mt-2 font-body text-[10px] text-ink/50 uppercase tracking-widest font-semibold">
                          <span>{act.category}</span>
                          <span>•</span>
                          <span>{Math.round((act.estDurationMins || 60) / 60)}h</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-3 pt-3 border-t-2 border-dashed border-kraft/30">
                      <AnimatePresence mode="wait">
                        {!isExpanded ? (
                          <motion.div key="add-btn" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <button 
                              onClick={() => setExpandedActivityId(act.id)}
                              className="font-display text-sm text-postal hover:underline underline-offset-4 w-full text-left flex items-center gap-2"
                            >
                              <Icons.Plus className="w-4 h-4" /> Add to day...
                            </button>
                          </motion.div>
                        ) : (
                          <motion.div key="date-picker" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
                            <span className="font-body text-xs text-ink/60 shrink-0 self-center mr-2">Select Date:</span>
                            {dateOptions.map(d => (
                              <button
                                key={d.toISOString()}
                                onClick={() => handleSelect(act.id, act.estCost || 0, d.toISOString())}
                                className="shrink-0 bg-kraft/10 hover:bg-postal hover:text-paper text-ink font-display text-sm px-3 py-1 rounded-sm border border-kraft transition-colors"
                              >
                                {d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' })}
                              </button>
                            ))}
                            {dateOptions.length === 0 && (
                              <span className="text-xs text-ink/40 italic">Set stop dates first</span>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-48 text-center px-4 border-2 border-dashed border-kraft bg-kraft/10">
            <Icons.Compass className="w-12 h-12 text-ink/30 mb-4" />
            <p className="font-display text-2xl text-ink/60">No activities match "{search}"</p>
            <p className="font-body text-sm text-ink/40 mt-1">Try broadening your filters.</p>
          </div>
        )}
      </div>

    </div>
  );
}
