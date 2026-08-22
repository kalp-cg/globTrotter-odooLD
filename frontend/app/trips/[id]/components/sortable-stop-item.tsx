"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Stop } from "@/lib/api/types";
import { LuggageTag } from "@/components/ui/luggage-tag";
import * as Icons from "@/components/ui/icons";

interface SortableStopItemProps {
  stop: Stop;
  isSelected: boolean;
  onSelect: () => void;
  index: number;
}

export function SortableStopItem({ stop, isSelected, onSelect, index }: SortableStopItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: stop.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  const startDate = stop.arrivalDate ? new Date(stop.arrivalDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '';
  const endDate = stop.departureDate ? new Date(stop.departureDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '';
  
  // Use stable random rotation based on index for the masonry journal feel
  const rotation = index % 2 === 0 ? -1 : 1;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative flex items-center gap-4 p-3 pr-4 rounded-sm border-2 cursor-pointer transition-colors
        ${isSelected ? 'bg-kraft/30 border-postal' : 'bg-paper border-kraft hover:bg-kraft/10'}
        ${isDragging ? 'opacity-90 shadow-xl rotate-3 scale-105' : 'shadow-sm'}
      `}
      onClick={onSelect}
    >
      {/* Drag Handle */}
      <div 
        {...attributes} 
        {...listeners} 
        className="cursor-grab hover:text-postal text-ink/40"
        onClick={(e) => e.stopPropagation()}
      >
        <Icons.DragHandle className="w-6 h-6" />
      </div>

      {/* Thumbnail */}
      <div 
        className="w-16 h-16 bg-kraft overflow-hidden rounded-sm border border-ink/20 shrink-0 shadow-sm"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        <img 
          src={stop.cityImageUrl || "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400&q=80"} 
          alt={stop.cityName}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-display text-xl text-ink truncate">{stop.title || stop.cityName}</h3>
        <p className="font-body text-sm text-ink/70 truncate">{stop.cityName}, {stop.cityCountry}</p>
      </div>

      {/* Dates & Badge */}
      <div className="flex flex-col items-end gap-2 shrink-0">
        <LuggageTag text={`${startDate} - ${endDate}`} className="bg-paper text-ink text-xs py-0.5 px-2" />
        {stop.activities && stop.activities.length > 0 && (
          <span className="font-display text-sm text-postal bg-postal/10 px-2 py-0.5 rounded-full">
            {stop.activities.length} activities
          </span>
        )}
      </div>
    </div>
  );
}
