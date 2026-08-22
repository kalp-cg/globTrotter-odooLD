"use client";

import React from "react";
import { SlideOver } from "./slide-over";
import { ActivitySearch } from "./activity-search";

interface ActivitySearchSlideoverProps {
  isOpen: boolean;
  onClose: () => void;
  cityId: string;
  startDate?: string;
  endDate?: string;
  onSelectActivity: (activityId: string, cost: number, date: string) => void;
}

export function ActivitySearchSlideover({ isOpen, onClose, cityId, startDate, endDate, onSelectActivity }: ActivitySearchSlideoverProps) {
  return (
    <SlideOver isOpen={isOpen} onClose={onClose} title="Add Activity">
      <ActivitySearch 
        cityId={cityId} 
        startDate={startDate} 
        endDate={endDate} 
        onSelectActivity={onSelectActivity} 
        className="h-full" 
      />
    </SlideOver>
  );
}
