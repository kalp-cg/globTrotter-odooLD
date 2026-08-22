"use client";

import React from "react";
import { SlideOver } from "./slide-over";
import { useActivities } from "@/lib/hooks/useActivities";
import { LuggageTag } from "./luggage-tag";
import * as Icons from "./icons";

interface ActivitySearchSlideoverProps {
  isOpen: boolean;
  onClose: () => void;
  cityId: string;
  onSelectActivity: (activityId: string, cost: number) => void;
}

export function ActivitySearchSlideover({ isOpen, onClose, cityId, onSelectActivity }: ActivitySearchSlideoverProps) {
  const { data: activities, isLoading } = useActivities(cityId);

  return (
    <SlideOver isOpen={isOpen} onClose={onClose} title="Add Activity">
      <div className="space-y-6">
        {isLoading ? (
          <div className="text-center py-10 font-body text-ink/60">Searching local guides...</div>
        ) : (
          <div className="flex flex-col gap-4 pb-20">
            {activities?.map((act, idx) => (
              <div 
                key={act.id}
                className="bg-paper p-4 border-2 border-kraft rounded-sm shadow-sm flex flex-col gap-2 relative transform transition-transform hover:-translate-y-1"
                style={{ transform: `rotate(${idx % 2 === 0 ? -1 : 1}deg)` }}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <h3 className="font-display text-xl text-ink">{act.name}</h3>
                    <p className="font-body text-sm text-ink/70 mt-1 line-clamp-2">{act.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <LuggageTag text={`$${act.estCost}`} className="bg-kraft text-ink" />
                    <button 
                      onClick={() => onSelectActivity(act.id, act.estCost)}
                      className="text-postal hover:scale-110 transition-transform"
                      title="Add to Itinerary"
                    >
                      <Icons.Plus className="w-6 h-6" />
                    </button>
                  </div>
                </div>
                <div className="flex gap-4 mt-2 font-body text-xs text-ink/60 uppercase tracking-widest">
                  <span>{act.category}</span>
                  <span>•</span>
                  <span>{Math.round(act.estDurationMins / 60)}h</span>
                </div>
              </div>
            ))}
            {activities?.length === 0 && (
              <div className="text-center py-10 font-body text-ink/60">No activities found for this city.</div>
            )}
          </div>
        )}
      </div>
    </SlideOver>
  );
}
